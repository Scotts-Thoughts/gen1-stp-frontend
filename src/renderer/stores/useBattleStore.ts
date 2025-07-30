
import { defineStore } from "pinia";
import { GameHookMapperClient, GameHookProperty } from "~/packages/gameHookMapperClient";
import { battle_summary  } from "~/autosplitter/battle_summary";
import { convertMSToDuration } from "~/utils/timehelpers";
import { useSpeciesMetricsStore } from "./useSpeciesMetricsStore";
import { UniqueTrainerIdFunction } from "~/autosplitter/split_functions";

function padTime(time: number) {
	if (!time) { return "00" }
	return time.toString().padStart(2, "0")
};

function gametimeSplit(gameProperties: Record<string, GameHookProperty>) {
	const h = gameProperties?.gameTime?.hours;
	const m = gameProperties?.gameTime?.minutes;
	const timecode = h + ":" + (m+"").padStart(2, "0")
	return timecode
}

type BattleSummaryProperties = typeof battle_summary.global_stats[number]["data_name"];
type BattleSummaryRecord = Partial<Record<BattleSummaryProperties, number|undefined>>;

/** 
 * Store to keep track of battle statistics.
 */
export const useBattleStore = defineStore('battle', {
	state: () => { return {
		/** The battle summary items read at the beginning of the battle. */
		start: {} as BattleSummaryRecord,
		/** The difference between the summary item values at the start and end of the battle. */
		end: {} as BattleSummaryRecord,
		battle_start: 0,
		/** Formatted string value of whatever the timer read when the battle started. */
		time_split_start: "",
		/** Formatted string of the duration of the battle (e.g. 1:23.45) */
		battle_duration: "",
		/** Experience gained per second of battle. */
		exp_per_second: 0,
		/** Nth battle of the playtrough. Taken from the property `patch.battles.trainerBattles`. */
		battle_summary_battle_number: 0
	}},
	getters: {
		statistics: (state) => {
			return {
				...state.end,
				battle_start: state.battle_start,
				time_split_start: state.time_split_start,
				battle_duration: state.battle_duration,
				exp_per_second: state.exp_per_second,
				battle_summary_battle_number: state.battle_summary_battle_number,
			}
		}
	},
	actions: {
		startBattle(mapper: GameHookMapperClient, battleType: string, trainerIdFunction: UniqueTrainerIdFunction) {
			if (battleType !== "Trainer") {
				return;
			}
			const { raw: time } = useSpeciesMetricsStore().getTime();
			
			// Use for...of loop to iterate over the array
			for (let property of battle_summary.global_stats) {
				if (property !== null) {
					this.start[property.data_name] = mapper.get(property.path)?.value as number|undefined;
				}
			}
			this.battle_start = Date.now()
			const unique_trainer_id = trainerIdFunction(mapper.properties);
			this.time_split_start = `${padTime(time.hours)}:${padTime(time.minutes)}:${padTime(time.seconds)}.${padTime(time.ms)}`;
			console.log(`Autosplitter - Battle Started: ${unique_trainer_id} started at ${this.time_split_start} (Gametime: ${gametimeSplit(mapper.properties)})`);
		},
		endBattle(mapper: GameHookMapperClient) {
			for (let property of battle_summary["global_stats"]) {
				if (property !== null) {
					let data = mapper.get(property.path)?.value as number;
					this.end[property.data_name] = data - this.start[property.data_name]!;
				}
			}
			const duration_ms = (Date.now() - this.battle_start) / 1000;
			this.battle_duration = convertMSToDuration(Date.now() - this.battle_start);
			this.exp_per_second = Math.round((this.end.battle_summary_exp_gained ?? 0) / duration_ms);
			this.battle_summary_battle_number = mapper.properties.patch?.battles?.trainerBattles?.value;
		},
	}
});