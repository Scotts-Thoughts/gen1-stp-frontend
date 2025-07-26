
import { defineStore } from "pinia";
import { GameHookProperty } from "~/packages/gameHookMapperClient";
import { battle_summary  } from "~/autosplitter/battle_summary";
import { convertMSToDuration } from "~/utils/timehelpers";
import { useSpeciesMetricsStore } from "./useSpeciesMetricsStore";

function getByPath(obj: Record<string, GameHookProperty>, path: string): any {
	return path.split('.').reduce((o, p) => (o || {})[p], obj);
};

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
		split_logStr: "",
		battle_start: 0,
		time_split_start: "",
		battle_duration_ms: 0,
		battle_duration: "",
		exp_per_second: 0,
		battle_summary_battle_number: 0
	}},
	getters: {
		statistics: (state) => {
			return {
				...state.end,
				split_logStr: state.split_logStr,
				battle_start: state.battle_start,
				time_split_start: state.time_split_start,
				battle_duration_ms: state.battle_duration_ms,
				battle_duration: state.battle_duration,
				exp_per_second: state.exp_per_second,
				battle_summary_battle_number: state.battle_summary_battle_number,
			}
		}
	},
	actions: {
		startBattle(properties: Record<string, GameHookProperty>, battleType: string, collectData: boolean) {
			if (battleType !== "Trainer" || !collectData) {
				return;
			}
			const { raw: time, formatted: formatted_time } = useSpeciesMetricsStore().getTime();
			var logStr = `Autosplitter - Battle Started: ${properties.battle.trainer.class.value} started at ${formatted_time[0]}${formatted_time[1]} (Gametime: ${gametimeSplit(properties)})`;
			
			// Use for...of loop to iterate over the array
			for (let property of battle_summary.global_stats) {
				if (property !== null) {
					this.start[property.data_name] = getByPath(properties, property.path) as number|undefined;
				}
			}
			this.split_logStr = logStr
			this.battle_start = Date.now()
			this.time_split_start = `${padTime(time.hours)}:${padTime(time.minutes)}:${padTime(time.seconds)}.${padTime(time.ms)}`;
			console.log(logStr);
		},
		endBattle(properties: Record<string, GameHookProperty>, collectData: boolean) {
			if (!collectData) {
				return;
			}
			for (let property of battle_summary["global_stats"]) {
				if (property !== null) {
					let data = getByPath(properties, property.path) as number;
					this.end[property.data_name] = data - this.start[property.data_name]!;
				}
			}
			this.battle_duration_ms = (Date.now() - this.battle_start) / 1000;
			this.battle_duration = convertMSToDuration(Date.now() - this.battle_start);
			this.exp_per_second = Math.round((this.end.battle_summary_exp_gained ?? 0) / this.battle_duration_ms);
			this.battle_summary_battle_number = properties.patch?.battles?.trainerBattles?.value;
		},
	}
});