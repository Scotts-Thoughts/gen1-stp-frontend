export function convertDurationToSeconds(duration) {
	const parts = duration.split(':').map(part => parseInt(part, 10));
	if (parts.length === 1) {
		return parts[0];
	} else if (parts.length === 2) {
		return parts[0] * 60 + parts[1];
	} else if (parts.length === 3) {
		return parts[0] * 3600 + parts[1] * 60 + parts[2];
	}
}

export function convertSecondsToDuration(seconds) {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
	} else if (minutes > 0) {
		return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
	} else {
		var seconds = remainingSeconds
		if (remainingSeconds < 10) { seconds = "0" + remainingSeconds.toString() }
		return `0:${String(seconds)}`
	}
}

export function convertMSToDuration(milliseconds) {
	const seconds = milliseconds / 1000;
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = seconds % 60;

	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
	} else if (minutes > 0) {
		return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
	} else {
		return `${remainingSeconds}`;
	}
}