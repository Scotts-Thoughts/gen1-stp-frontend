import PubSub from "./PubSub";
import { SpeciesMetricStore } from "~/stores/useSpeciesMetricsStore";
const f = (x: number) => x.toString().padStart(2, "0");

export type TimerData = {
	paused: boolean
	started_at: number
	paused_at: number
};

/**
 * Real-world timer.
 */
export class Timer {
	static _instance: Timer| null;

	static initialize(store: SpeciesMetricStore) {
		this._instance = new Timer(store);
	}

	static instance() {
		if (!this._instance)  {
			throw new Error("Timer has not been initialized");
		}
		return this._instance;
	}

	_store: SpeciesMetricStore;

	/** 
	 * An array with formatted time information. First item is the general time as `hh:mm:ss`. 
	 * Second is the number of milliseconds elapsed as `.ms` 
	 */
	formatted_time: string[] = ["0", ".00"];
	constructor(store: SpeciesMetricStore) {
		this._store = store;
		this.formatted_time  = ["0", ".00"];
		this.update();     // update once to set everything correctly.
		this.updateLoop(); // then start the timer loop.
		// We may be paused, so the update() is necessary, since the loop does no updates when paused.
	}

	updateLoop = () => {
		if (!this._store.timer.paused) {
			this.update();
		}
		window.requestAnimationFrame(this.updateLoop);
	}

	/**
 	 * Pause and set the timer back to default
	 * @param startTimeOffset The default value to set the timer to, as a string in the format `hh:mm:ss.ms`
	 */
	set = (startTimeOffset: string) => {
		const timeOffset = this.parseOffsetString(startTimeOffset);
		this._store.timer.paused = true;
		this._store.timer.started_at = Date.now() - timeOffset;
		this._store.timer.paused_at = Date.now();
		this.update();
	}

	/**
	 * Sets the timer (see {@link set}) and unpauses it.
	 * @param startTimeOffset An offset to add to the timer value, a string in the format hh:mm:ss.ms.
	 */
	start = (startTimeOffset: string) => {
		if (this._store.timer.paused == false) {
			return
		}
		this.set(startTimeOffset);
		this._store.timer.paused = false;
		this.update();
	}

	/**
	 * Pauses the timer if it's currently running and vice versa.
	 */
	toggle = () => {
		if (this._store.timer.paused == true) {
			this._store.timer.paused = false;
			this._store.timer.started_at += Date.now() - this._store.timer.paused_at;
			this.update();
		}
		else {
			this._store.timer.paused = true;
			this._store.timer.paused_at = Date.now();
		}
	}

	/** Pause the timer. */
	stop = () => {
		this._store.timer.paused_at = Date.now();
		this._store.timer.paused = true;
	}

	/**
	 * Get the current timer value as an object.
	 * @returns {{ms: number, seconds:number,minutes: number ,hours: number}} 
	 * An object containing the hours, minutes, seconds and milliseconds that have elapsed on the timer.
	 */
	getTime = () => {
		var time = Date.now() - this._store.timer.started_at
		if (this._store.timer.paused == true) {
			time = this._store.timer.paused_at - this._store.timer.started_at
		}
		return {
			ms: (Math.floor(time / 10) % 100),
			seconds: (Math.floor(time / 1000) % 60),
			minutes: (Math.floor(time / 60000) % 60),
			hours: (Math.floor(time / 3600000))
		};
	}

	/**
	 * Updates the {@link formatted_time} and publishes a `time_update` event which the "Timer" vue component listens for.
	 */
	update = () => {
		const {ms: ms, seconds: s, minutes: m, hours: h} = this.getTime();		
		if (h != 0) {
			this.formatted_time = [ h + ":" + f(m) + ":" + f(s), "." + f(ms), h + "h" + m + "m" + s + "s", ]
		} else if (m != 0) {
			this.formatted_time = [ m + ":" + f(s), "." + f(ms), h + "h" + m + "m" + s + "s", ]
		} else {
			this.formatted_time = [ s.toString(), "." + f(ms), h + "h" + m + "m" + s + "s", ]
		}
		// console.log(`PubSub.publish("@timer/update", this.formatted_time);`, this.formatted_time, this.getTime());
		PubSub.publish("@timer/update", this.formatted_time);
	}

	/**
	 * Parses a time value string with format `hh:mm:ss.ms` and returns the number of milliseconds that value describes.
	 * @param offset The offset string to parse.
	 * @returns Milliseconds
	 */
	parseOffsetString = (offset: string): number => {
		const timeRegex = /(\d+):(\d{2}):(\d{2})\.(\d{2})/;
		const timeOffsetArray = offset.match(timeRegex)?.slice(1,5).map(x => parseInt(x)) ?? [0,0,0,0];
		return timeOffsetArray[0] * 3600000 + timeOffsetArray[1] * 60000 + timeOffsetArray[2] * 1000 + timeOffsetArray[3] * 10;
	}
}