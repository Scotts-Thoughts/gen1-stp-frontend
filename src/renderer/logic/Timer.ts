import PubSub from "./PubSub";
import { LocalStorageProxy } from "./LocalStorageProxy";
const f = (x: number) => x.toString().padStart(2, "0");

/**
 * Real-world timer.
 */
class Timer {
	storage: Record<string, any>;
	formatted_time: string[];
	constructor(storage: Record<string, any>) {
		// We use the storage for keeping track of timer_pause, timer_startTime and timer_pause_time:
		// formatted_time is initalized here only as good practise. update() will always set it to the correct value.
		// We do not keep formatted_time in storage, because we can always reconstruct it from the 3 variables we do
		// store.
		this.storage = storage;
		/** 
		 * An array with formatted time information. First item is the general time as `hh:mm:ss`. 
		 * Second is the number of milliseconds elapsed as `.ms` 
		 */
		this.formatted_time  = ["0", ".00"];
		this.update();     // update once to set everything correctly.
		this.updateLoop(); // then start the timer loop.
		// We may be paused, so the update() is necessary, since the loop does no updates when paused.
	}

	updateLoop = () => {
		if (!this.storage.timer_pause) {
			this.update();
		}
		window.requestAnimationFrame(this.updateLoop);
	}

	/**
 	 * Pause and set the timer back to default
	 * @param startTimeOffset The default value to set the timer to, as a string in the format `hh:mm:ss.ms`
	 */
	setTimer = (startTimeOffset: string) => {
		const timeOffset = this.parseOffsetString(startTimeOffset);
		this.storage.timer_pause = true;
		this.storage.timer_startTime = Date.now() - timeOffset;
		this.storage.timer_pause_time = Date.now();
		this.update();
	}

	/**
	 * Sets the timer (see {@link setTimer}) and unpauses it.
	 * @param startTimeOffset An offset to add to the timer value, a string in the format hh:mm:ss.ms.
	 */
	startTime = (startTimeOffset: string) => {
		if (this.storage.timer_pause == false) {
			return
		}
		this.setTimer(startTimeOffset);
		this.storage.timer_pause = false;
		this.update();
		PubSub.publish("@timer/start", this.formatted_time);
	}

	/**
	 * Pauses the timer if it's currently running and vice versa.
	 */
	pauseUnpauseTime = () => {
		if (this.storage.timer_pause == true) {
			this.storage.timer_pause = false;
			this.storage.timer_startTime += Date.now() - this.storage.timer_pause_time;
			this.update();
		}
		else {
			this.storage.timer_pause = true;
			this.storage.timer_pause_time = Date.now();
		}
	}

	/** Pause the timer. */
	stopTime = () => {
		this.storage.timer_pause_time = Date.now();
		this.storage.timer_pause = true;
	}

	/**
	 * Get the current timer value as an object.
	 * @returns {{ms: number, seconds:number,minutes: number ,hours: number}} 
	 * An object containing the hours, minutes, seconds and milliseconds that have elapsed on the timer.
	 */
	getTime = () => {
		var time = Date.now() - this.storage.timer_startTime
		if (this.storage.timer_pause == true) {
			time = this.storage.timer_pause_time - this.storage.timer_startTime
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

export default new Timer(LocalStorageProxy);