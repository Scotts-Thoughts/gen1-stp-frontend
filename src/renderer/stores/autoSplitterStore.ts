import { ref, watch } from "vue";
import { useSpeciesMetricsStore } from "./useSpeciesMetricsStore"
import { defineStore } from "pinia";
import { GameHookMapperClient } from "~/packages/gameHookMapperClient";
import { FullSplitFunction, isTargetSplit, SplitConfiguration, UniqueTrainerIdFunction, write_split_csv } from "~/autosplitter/split_functions";
import { useMetaStore } from "./metaStore";
import { useBattleStore } from "./useBattleStore";
import { FullSplit } from "~/autosplitter/types";
import { useGameSpeciesData } from "./useGameSpeciesData";
import { useOverlaySettingsStore } from "./useOverlaySettingsStore";
import { logCopy } from "~/autosplitter/autosplitter_functions";
import { RightPanelMode } from "./types/RightPanelMode";

export type SlimSplit = {
	trainer: string,
	unique_trainer_id: string,
	time: string,
};

// TODOs:
// - final saving (see frontend.js)
// - Save and load split data
// - figure out where to put "refilmed_attempt"
// - figure out "collect_split_data" (is it still neede?)
export const useAutoSplitterStore = defineStore('autosplitter', () => {
	let mapper: GameHookMapperClient; 
	const metrics = useSpeciesMetricsStore();
	const runConfig = useGameSpeciesData();
	const meta = useMetaStore();
	const battle = useBattleStore();
	const overlaySettings = useOverlaySettingsStore();
	const finishedSplits = ref<boolean>(false);
	const collect_split_data = true; // TODO!
	let getSplitData: FullSplitFunction | null = null;
	let getUniqueTrainerId: UniqueTrainerIdFunction | null = null;
	let configuration: SplitConfiguration | null = null;

	function configure(
		mapperClient: GameHookMapperClient, 
		splitFunction: FullSplitFunction, 
		trainerIdFunction: UniqueTrainerIdFunction,
		splitConfiguration: SplitConfiguration
	) {
		mapper = mapperClient;
		configuration = splitConfiguration;
		getSplitData = splitFunction;
		getUniqueTrainerId = trainerIdFunction;
		watch(
			() => meta.run_finished, 
			() => {
				if (meta.run_finished === false) {
					finishedSplits.value = false;
				}
			}
		);
	}

	function checkGameEnd() {
		if (!finishedSplits.value && meta.run_finished) {
			logCopy(  // copy the current `attempt_number` split data to the finished folder
				meta.game,
				meta.game,
				metrics.attempts,
				meta.starter,
				metrics.finishes,
				runConfig.advanced.refilming_mode,
				runConfig.advanced.refilmed_attempt
			);
			console.log("[AutoSplitter] Run complete - moving attempt files to finished folder.")
			finishedSplits.value = true
		}
	}

	function onBattleStart(battleType: "Wild" | "Trainer") {
		if (collect_split_data && getUniqueTrainerId) {
			battle.startBattle(mapper, battleType, getUniqueTrainerId);
		}
	}

	function onBattleEnd(battleType: "Wild" | "Trainer") {
		if (battleType === "Trainer") {
			if (collect_split_data) {
				battle.endBattle(mapper);
			}
			createSplit();
		}
	}

	function onFinalSplit() {
		metrics.attempts++;
		console.log("Run Ended - Backing up split data now...")
		const split = createSplit();				
		console.log(`[AutoSplitter] Run Ended: Real-Time: ${split["Real Time"]} Resets: ${split.resets} Blackouts: ${split.blackouts} Level: ${split.level} Gametime: ${split["game_time"]})`)
		metrics.finish_run();
	}

	function saveSplit(split: FullSplit, unique_trainer_id: string) {
		metrics.addSplit({ trainer: split.trainer_name, unique_trainer_id, time: split.real_time_hmmss});
		if (!meta.game) {
			return;
		}
		const { test_run, refilming_mode, refilmed_attempt } = runConfig.advanced;
		write_split_csv(meta.game, meta.game, split, "Full", test_run, refilming_mode, refilmed_attempt);
		if (isTargetSplit(unique_trainer_id, configuration?.deprecated ?? [])) {
			write_split_csv(meta.game, meta.game, split, "Deprecated", test_run, refilming_mode, refilmed_attempt);
		}
		if (isTargetSplit(unique_trainer_id, configuration?.simple ?? [])) {
			write_split_csv(meta.game, meta.game, split, "Simple", test_run, refilming_mode, refilmed_attempt);
		}
		if (isTargetSplit(unique_trainer_id, configuration?.show_panel ?? [])) {
			if (overlaySettings.right_panel.post_battle_splits === true) {
				overlaySettings.setRightPanelOverride(RightPanelMode.splits);
			}
		}
		if (isTargetSplit(unique_trainer_id, configuration?.final_splits ?? [])) {
			if (overlaySettings.right_panel.post_battle_splits === true) {
				overlaySettings.setRightPanelOverride(RightPanelMode.splits);
			}
			if (runConfig.advanced.test_run == false && runConfig.advanced.refilming_mode == false && runConfig.advanced.no_attempt == false) {
				metrics.update("finishes", metrics.finishes + 1); //increment finished count if this is not a test run
			};
			metrics.finish_run();
		}
	}

	function createSplit() {
		if (!mapper.properties || !getSplitData || !getUniqueTrainerId) {
			throw new Error("Autosplitter has no access to game properties or has no split function. Something went wrong.");
		}
		const split = getSplitData(mapper.properties, meta, metrics, battle);
		const unique_trainer_id = getUniqueTrainerId(mapper.properties);
		console.log(`AutosplitterStore - Battle Ended: Split: ${unique_trainer_id} at ${split.real_time_total} (Gametime: ${split["Game Time"]})`)
		saveSplit(split, unique_trainer_id);		
		return split;
	}

	return {
		configure,
		onBattleStart,
		onBattleEnd,
		checkGameEnd,
		onFinalSplit,
		finishedSplits
	};
});