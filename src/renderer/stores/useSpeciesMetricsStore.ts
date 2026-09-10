import { defineStore } from "pinia";
import { PokemonGame } from "~/logic/PokeDataTypes";
const path = require('path');
import { loadAppSettings, saveAppSettings } from "./helper/files";
import { formatTime, getTime, Timer, TimerData } from "~/logic/Timer";
import { findLegacySpeciesEntry } from "~/logic/legacyStorage";
import { FaultMode } from "./types/FaultMode";

/**
 * The species metrics store is in control of the timer and keeps track of relevant run statistics like faults and
 * attempts. It also remembers the state of the current attempt (save file id, whether the run was finished) so that
 * restarting the overlay mid-run does not count as a new attempt.
 *
 * Saved automatically by {@link useSettingsStore} whenever it changes.
 */
export type SpeciesMetricStore = ReturnType<typeof useSpeciesMetricsStore>;
export type SpeciesMetrics = ReturnType<typeof defaultSpeciesMetrics>;

const METRICS_FILE_NAME = "metrics.json";

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
		/**
		 * Loads from `%APPDATA%/stp-generation1-overlay/data/${game}/${starter}/metrics.json`.
		 * When no file exists yet the counters are migrated from the old `Storage.json` file.
		 */
		async load(game: PokemonGame|null, starter: string|null) {
			let next = defaultSpeciesMetrics();
			if (game && starter) {
				const loaded = await loadAppSettings<Partial<SpeciesMetrics>>(path.join(game, starter), METRICS_FILE_NAME);
				next = loaded
					? { ...next, ...loaded, timer: { ...next.timer, ...(loaded.timer ?? {}) } }
					: { ...next, ...legacyMetrics(game, starter) };
			}
			// Replace the state in one go so that subscribers get a single, synchronous notification.
			this.$patch((state) => { Object.assign(state, next); });
			Timer.initialize(this);
		},
		/** Saves to `%APPDATA%/stp-generation1-overlay/data/${game}/${starter}/metrics.json` */
		async save(game: PokemonGame|null, starter: string|null) {
			if (game && starter) {
				await saveAppSettings<SpeciesMetrics>(path.join(game, starter), METRICS_FILE_NAME, this.$state);
			}
		},
		update<K extends keyof SpeciesMetrics>(key: K, value: SpeciesMetrics[K]) {
			this.$state[key] = value;
		},
		/** Start the timer. Sets {@link timer_override} as the starting time. */
		startTime() {
			Timer.ensure(this).start(this.timer_override);
		},
		/** Resets the timer and pauses it. Sets {@link timer_override} as the starting time. */
		resetTimer() {
			Timer.ensure(this).set(this.timer_override);
		},
		/** Stop the timer */
		stopTimer() {
			Timer.ensure(this).stop();
		},
		/** Pause or unpause the timer. */
		toggleTimer() {
			Timer.ensure(this).toggle();
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

/** Read the counters of a species from the old `Storage.json` file. */
function legacyMetrics(game: PokemonGame, starter: string): Partial<SpeciesMetrics> {
	const style = findLegacySpeciesEntry(game, starter)?.style;
	if (!style) {
		return {};
	}
	const count = (value: unknown) => Math.max(0, Math.floor(Number(value) || 0));
	return {
		attempts: count(style.attempt_number),
		finishes: count(style.finished_run_count),
		resets: count(style.playerResets),
		blackouts: count(style.blackout_counter),
		player_id: count(style.playerId),
		run_finished: style.game_over === true,
		splits_logged: style.flag_finished_logging_splits === true || style.finished_logs === true,
	};
}

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
		/** The player id of the save file of the current attempt. Used to detect when a new game is started. */
		player_id: 0,
		/** Set once the champion has been beaten, so that the reset afterwards does not count as a fault. */
		run_finished: false,
		/** Set once the split files of the finished run have been copied to the "finishes" folder. */
		splits_logged: false,
		/** Set when the players pokemon fainted in battle. If they end up in the overworld afterwards, it is a blackout. */
		blackout_pending: false,
		splits_path: "",
	};
}
