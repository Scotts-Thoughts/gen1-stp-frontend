import { defineStore } from "pinia";

const EMULATOR_BASE_URL = "http://127.0.0.1:30158";
const POLL_INTERVAL_MS = 10;

export interface EmulatorCounters {
	playerResets?: number;
	blackout_counter?: number;
	[key: string]: number | undefined;
}

export interface EmulatorStats {
	time_current?: number | null;
	time?: string | null;
	counters?: EmulatorCounters;
	[key: string]: unknown;
}

/**
 * Polls the Shuckie emulator HTTP server for timer/counter stats and exposes methods to control them.
 * The server is expected to expose:
 *   GET  /stats               → stats object (incl. counters and time_current in ms)
 *   POST /mark-start          → begin emulator-side timer
 *   POST /mark-end            → end emulator-side timer
 *   POST /increment-counter?name=X[&by=Y]
 */
export const useEmulatorStatsStore = defineStore("emulator_stats", {
	state: () => ({
		stats: null as EmulatorStats | null,
		_interval: null as ReturnType<typeof setInterval> | null,
		_lastErrorLoggedAt: 0 as number,
		_loggedFirstSuccess: false as boolean,
		_lastStartAttemptAt: 0 as number,
	}),
	getters: {
		timeCurrent(state): number | null {
			return state.stats?.time_current ?? null;
		},
		playerResets(state): number {
			return state.stats?.counters?.playerResets ?? 0;
		},
		blackoutCounter(state): number {
			return state.stats?.counters?.blackout_counter ?? 0;
		},
	},
	actions: {
		startPolling() {
			if (this._interval != null) {
				return;
			}
			console.log(`[emulator-stats] starting poll loop against ${EMULATOR_BASE_URL}/stats every ${POLL_INTERVAL_MS}ms`);
			this._interval = setInterval(() => {
				this.fetchStats();
			}, POLL_INTERVAL_MS);
		},
		stopPolling() {
			if (this._interval != null) {
				clearInterval(this._interval);
				this._interval = null;
			}
		},
		async fetchStats() {
			try {
				const response = await fetch(`${EMULATOR_BASE_URL}/stats`);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}
				this.stats = await response.json();
				if (!this._loggedFirstSuccess) {
					this._loggedFirstSuccess = true;
					console.log(
						`[emulator-stats] first poll succeeded. time_current=${this.stats?.time_current} counters=${JSON.stringify(this.stats?.counters)} full=${JSON.stringify(this.stats)}`
					);
				}
			} catch (err) {
				// Keep the last-known stats on transient failures to avoid display flicker.
				// Log at most once every 5 seconds so we don't flood the console.
				const now = Date.now();
				if (now - this._lastErrorLoggedAt > 5000) {
					this._lastErrorLoggedAt = now;
					console.warn(`[emulator-stats] poll failed:`, err);
				}
			}
		},
		async sendStart() {
			this._lastStartAttemptAt = Date.now();
			return postVoid(`${EMULATOR_BASE_URL}/mark-start`);
		},
		/**
		 * Kick off the Shuckie timer if stats are loaded but `time_current` is still null.
		 * Safe to call frequently — it self-throttles to at most one POST every 2 seconds.
		 */
		async ensureStarted() {
			if (this.stats == null || this.stats.time_current != null) {
				return;
			}
			if (Date.now() - this._lastStartAttemptAt < 2000) {
				return;
			}
			console.log("[emulator-stats] time_current is null; sending /mark-start");
			await this.sendStart();
		},
		async sendEnd() {
			return postVoid(`${EMULATOR_BASE_URL}/mark-end`);
		},
		async incrementCounter(name: string) {
			return postVoid(`${EMULATOR_BASE_URL}/increment-counter?name=${encodeURIComponent(name)}`);
		},
		async incrementCounterBy(name: string, amount: number) {
			return postVoid(`${EMULATOR_BASE_URL}/increment-counter?name=${encodeURIComponent(name)}&by=${amount}`);
		},
	},
});

async function postVoid(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, { method: "POST" });
		return response.ok;
	} catch (_err) {
		return false;
	}
}

/**
 * Formats a millisecond count into `[h:mm:ss | m:ss | s, .cs]` matching the Shuckie overlay's display.
 */
export function formatShuckieTime(ms: number | null | undefined): [string, string] {
	if (ms == null) {
		return ["0", ".00"];
	}
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	const centiseconds = Math.floor(ms / 10) % 100;
	const pad = (x: number) => x.toString().padStart(2, "0");
	const cs = "." + pad(centiseconds);
	if (hours > 0) {
		return [`${hours}:${pad(minutes)}:${pad(seconds)}`, cs];
	}
	if (minutes > 0) {
		return [`${minutes}:${pad(seconds)}`, cs];
	}
	return [seconds.toString(), cs];
}
