// Metrics save when the game-species pair is changed or when the overlay unmounts

import { defineStore } from "pinia";
import { PokemonGame } from "~/logic/PokeDataTypes";
const path = require('path');
import { loadAppSettings, saveAppSettings } from "./helper/files";
import { formatTime, getTime, Timer, TimerData } from "~/logic/Timer";
import { FaultMode } from "./types/FaultMode";
import { SlimSplit } from "./autoSplitterStore";
import { useGameSpeciesData } from "./useGameSpeciesData";

export enum RunState {
	/** No run is currently in progress */
	initial,
	/** Run has been started. */
	started,
	/** The final split was reached (e.g. the final rival battle in gen 1 or defeating red in gen 2.). */
	finished,
	/** The run has been completed, all metrics collected and saved in their appropriate places. */
	saved,
}

/**
 * The species metrics store is in control of the timer and keeps track of relevant run statistics like faults and attempts. 
 */
export type SpeciesMetricStore = ReturnType<typeof useSpeciesMetricsStore>;
export type SpeciesMetrics = ReturnType<typeof defaultSpeciesMetrics>;

export const useSpeciesMetricsStore = defineStore('species_metrics', {
	state: () => defaultSpeciesMetrics(),
	getters: {
		/** Computed: Whether the user currently has no faults, only blackouts, only resets or both. */
		faultsMode(state) {
			if (state.blackouts == 0 && state.resets == 0) {
				return FaultMode.none;
			}
			if (state.blackouts === 0 && state.resets > 0) {
				return FaultMode.resets;
			}
			if (state.blackouts > 0 &&  state.resets === 0) {
				return FaultMode.blackouts;
			}
			return FaultMode.both;
		},
		/** Computed: Combined blackouts and resets. */
		faults(state) {
			return state.blackouts + state.resets;
		}
	},
	actions: {
		/** Loads from %APPDATA%/stp-generation1-overlay/data/${game}/${starter}/metrics.json */
		async load(game: PokemonGame|null, starter: string|null) {
			if (game && starter) {
				const loadedSettings = await loadAppSettings<SpeciesMetrics>(path.join(game, starter), "metrics.json")
					?? defaultSpeciesMetrics();
				Object.assign(this.$state, loadedSettings);
			} else {
				Object.assign(this.$state, defaultSpeciesMetrics());
			}
			Timer.initialize(this);
		},
		/** Saves to %APPDATA%/stp-generation1-overlay/data/${game}/${starter}/metrics.json */
		async save(game: PokemonGame|null, starter: string|null) {
			if (game && starter) {
				await saveAppSettings<SpeciesMetrics>(path.join(game, starter), "metrics.json", this.$state);
			}
		},
		update<K extends keyof SpeciesMetrics>(key: K, value: SpeciesMetrics[K]) {
			this.$state[key] = value;
		},
		/** Resets the timer and pauses it. Sets {@link timer_override} as the starting time. */
		resetTimer() {
			Timer.instance().set(this.timer_override);
		},
		/** Pause or unpause the timer. */
		toggleTimer() {
            Timer.instance().toggle();
        },
		/** Get the current time on the timer, both in raw numbers and formatted */
		getTime() {
			const raw = getTime(this.timer);
			return {
				raw: raw,
				/** Array of 3 strings, see {@link formatTime} */
				formatted: formatTime(raw),
			}
		},
		addSplit(split: SlimSplit) {
			const existingSplit = this.splits.find(x => x.unique_trainer_id === split.unique_trainer_id);
			if (existingSplit) {
				existingSplit.time = split.time;
			} else {
				this.splits.push(split);
			}
		},
		clear_run() {
			this.flag_blackout_prerequisite = false;
			this.resetTimer();
			this.blackouts = 0;
			this.resets = 0;
			this.splits = [];
			this.player_id = 0;
			this.state = RunState.initial;
		},
		start_new_run(player_id: number) {
			const runConfig = useGameSpeciesData();
			if (runConfig.advanced.test_run == false && runConfig.advanced.refilming_mode == false) {
				this.attempts++;
			};
			if (!runConfig.advanced.no_attempt) {
				this.clear_run();
			}
			this.player_id = player_id;
			this.state = RunState.started;
			Timer.instance().start(this.timer_override);
		},
		finish_run() {
			Timer.instance().stop();
			this.state = RunState.finished;
		}
	}
});

function defaultSpeciesMetrics() {
	return {
		/** Timer override, determines the start time when the timer is set or reset. */
		timer_override: "00:00:00.00",
		/** Timer data from which the formatted time can be computed */
		timer: {
			paused: true,
			started_at: 0,
			paused_at: 0,
		} as TimerData,
		/** Number of attempts for the current species and game. */
		attempts: 0,
		/** Number of finished runs for the current species and game. */
		finishes: 0,
		/** Number of resets in the current attempt. */
		resets: 0,
		/** Number of blackouts in the current attempt. */
		blackouts: 0,
		splits_path: "",
		player_id: 0,
		state: RunState.initial,
		flag_blackout_prerequisite: false,
		splits: [] as SlimSplit[],
	};
}