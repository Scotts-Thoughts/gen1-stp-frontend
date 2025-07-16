const localStorage = require("./MyStorage");
const jsonStorage = require("./Storage");
const PubSub = require("./PubSub");

class UIStyles {
	constructor() {
		this._localStorage = localStorage;
		this._storage = jsonStorage;
		this._gameName = this._storage['global_variables'].game;
		this._starterName = this._storage['global_variables'].starter;

		this._settings = {
			ui_saturation:          .6,
			// Pokemon settings for local storage
			overlay_color:         "#000000",
			imageXOffset:          0,
			imageYOffset:          0,
			imageScale:            1,
			imageFlip:             false,
			imageSat:              100,
			imageRotation:         0,

			// Background texture settings
			backgroundBlur:        0,
			backgroundScale:       100,
			backgroundFlip:        false,
			backgroundUrl:         "",
			backgroundXOffset:     0,
			backgroundYOffset:     0,
			backgroundTexture:     'Bug 1',
			backgroundBrightness:  100,
			backgroundContrast:    100,
			backgroundSaturation:  100,
			backgroundHue:         0,
		};

		if (this._gameName && this._starterName) {
			this.applyStyle(this._storage['games'][this._gameName][this._starterName].style);
		}
	}

	get settings() {
		return this._settings;
	}	

	setGameName = (value) => {
		this._gameName = value;
		if (this._gameName && this._starterName) {
			this.applyStyle(this._storage['games'][this._gameName][this._starterName].style);
		}
	}
	setStarterName = (value) => {
		this._starterName = value;
		if (this._gameName && this._starterName) {
			this.applyStyle(this._storage['games'][this._gameName][this._starterName].style);
		}
	}

	update = (settingName, settingValue) => {
		this._settings[settingName] = settingValue;
		this._localStorage.ui_customization = this._settings;
		this._onUpdate();
	}

	save = () => {
		// Save to storage:
		if (this._starterName) {
			var storedStyleSettings = this._storage['games'][this._gameName][this._starterName].style;
			for (let key in this._settings) {
				storedStyleSettings[key] = this._settings[key];
			}
		}
	}

	_onUpdate = () => {
		// apply some stuff directly to the document:
		document.documentElement.style.setProperty('--overlay-color', this._settings.overlay_color);
		document.documentElement.style.setProperty('--style_ui_saturation', this._settings.ui_saturation);

		// Inform components:
		PubSub.publish("ui_styles", structuredClone(this._settings));

		this.save();
	}

	applyStyle = (style)  => {
		// Assign the values for each setting to the data() properties
		for (let key in style) {
			if (this._settings[key] !== undefined) {
				this._settings[key] = style[key]; 
			}
		}
		this._onUpdate();
	}
}

module.exports = new UIStyles();