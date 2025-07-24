export async function saveAppSettings<T>(folder: string, file: string, data:T) {
	const fs = require('fs');
	const path = require('path');
	const settingsDir = await window.api.settings_dir();
	const filePath = path.join(settingsDir, "data", folder, file);
	const fileDirectory = path.dirname(filePath);
	if (!fs.existsSync(fileDirectory)) {
		fs.mkdirSync(fileDirectory, { recursive: true });
	}
	const json = JSON.stringify(data, null, 4);
	fs.writeFileSync(filePath, json);
}

export async function loadAppSettings<T>(folder: string, file: string): Promise<T|null> {
	const fs = require('fs');
	const path = require('path');
	const settingsDir = await window.api.settings_dir();
	const filePath = path.join(settingsDir, "data", folder, file);
	if (!fs.existsSync(filePath)) {
		return null;
	}
	try {
		const data = fs.readFileSync(filePath, 'utf8');
		return JSON.parse(data) as T;
	} catch (ex) {
		return null;
	}
}