// Metrics save when the game-species pair is changed or when the overlay unmounts

import { defineStore } from "pinia";
import { PokemonGame } from "~/logic/PokeDataTypes";
const path = require('path');
import { loadAppSettings, saveAppSettings } from "./helper/files";
import { formatTime, getTime, Timer, TimerData } from "~/logic/Timer";

/**
 * The species metrics store is in control of the timer and keeps track of relevant run statistics like faults and attempts. 
 */
export type SpeciesMetricStore = ReturnType<typeof useSpeciesMetricsStore>;
export type SpeciesMetrics = ReturnType<typeof defaultSpeciesMetrics>;

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
	};
}

export async function saveSpeciesMetrics(game: string|null, starter: string, data: SpeciesMetrics) {
	if (!game || !starter) {
		return;
	}

	await saveAppSettings<SpeciesMetrics>(path.join(game, starter), "metrics.json", data);
}

export enum FaultMode {
	/** Player has neither resets nor blackouts. */
	none = "None",
	/** Player has at least one reset, zero blackouts. */
	resets = "Resets",
	/** Player has at least one blackout, zero resets. */
	blackouts = "Blackouts",
	/** Player at least one reset and blackout. */
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
		/** Get the current time on the timer, both in raw numbers and formatted */
		getTime() {
			const raw = getTime(this.timer);
			return {
				raw: raw,
				/** Array of 3 strings, see {@link formatTime} */
				formatted: formatTime(raw),
			}
		},
		clearCounters() {
			this.blackouts = 0;
			this.resets = 0;
		}
	}
});

