// Metrics save when the game-species pair is changed or when the overlay unmounts

import { defineStore } from "pinia";
import { PokemonGame } from "~/logic/PokeDataTypes";
const path = require('path');
import { loadAppSettings, saveAppSettings } from "./helper/files";
import { Timer, TimerData } from "~/logic/Timer";


export type SpeciesMetricStore = ReturnType<typeof useSpeciesMetricsStore>;
export type SpeciesMetrics = ReturnType<typeof defaultSpeciesMetrics>;

function defaultSpeciesMetrics() {
	return {
		/** Timer override */
		timer_override: "00:00:00.00",
		timer: {
			paused: true,
			started_at: 0,
			paused_at: 0,
		} as TimerData,
		attempts: 0,
		finishes: 0,
		resets: 0,
		blackouts: 0,
		splits_path: "",
	};
}

export async function saveSpeciesMetrics(game: string|null, starter: string, data: SpeciesMetrics) {
	if (!game || !starter) {
		return;
	}

	await saveAppSettings<SpeciesMetrics>(path.join(game, starter), "metrics.json", data);
}

export enum FaultMode  {
	none = "None",
	resets = "Resets",
	blackouts = "Blackouts",
	both = "Both",
}

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
			console.log(`metrics.save(${game}, ${starter});`);
			if (game && starter) {
				await saveAppSettings<SpeciesMetrics>(path.join(game, starter), "metrics.json", this.$state);
			}
		},
		update<K extends keyof SpeciesMetrics>(key: K, value: SpeciesMetrics[K]) {
			this.$state[key] = value;
		},
		/** Start the timer. Sets {@link timer_override} as the starting time. */
		startTime() {
			Timer.instance().start(this.timer_override);
		},
		/** Resets the timer and pauses it. Sets {@link timer_override} as the starting time. */
		resetTimer() {
			Timer.instance().set(this.timer_override);
		},
		/** Stop the timer */
		stopTimer() {
			Timer.instance().stop();
		},
		/** Pause or unpause the timer. */
		toggleTimer() {
            Timer.instance().toggle();
        },
		clearCounters() {
			this.blackouts = 0;
			this.resets = 0;
		}
	}
});

