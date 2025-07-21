import localStorage from "../logic/MyStorage";
import jsonStorage from "../logic/Storage";
import { defineStore } from "pinia";

export type UIStyleSettings = {
	ui_saturation: number;
	overlay_color: string; 
	imageXOffset: number; 
	imageYOffset: number; 
	imageScale: number; 
	imageFlip: boolean; 
	imageSat: number; 
	imageRotation: number;
	backgroundBlur: number; 
	backgroundScale: number; 
	backgroundFlip: boolean; 
	backgroundUrl: string; 
	backgroundXOffset: number; 
	backgroundYOffset: number; 
	backgroundTexture: string; 
	backgroundBrightness: number; 
	backgroundContrast: number; 
	backgroundSaturation: number; 
	backgroundHue: number;
};

function defaultSettings(): UIStyleSettings {
	return {
		ui_saturation:          .6,
		overlay_color:         "#000000",
		imageXOffset:          0,
		imageYOffset:          0,
		imageScale:            1,
		imageFlip:             false,
		imageSat:              100,
		imageRotation:         0,
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
}

export const useUIStylesStore = defineStore('uiStyles', {
	state: () => ({
		game_selection: (jsonStorage['global_variables']?.game) || "Yellow",
		starterName: (jsonStorage['global_variables']?.starter as string) || "",
		settings: defaultSettings(),
	}),

	actions: {
		selectGame(value: string) {
			this.game_selection = value;
			if (this.starterName && this.game_selection) {
				this.applyStyle(jsonStorage['games'][this.game_selection]?.[this.starterName]?.style);
			}
		},
		setStarterName(value: string) {
			this.starterName = value;
			if (this.starterName && this.game_selection) {
				this.applyStyle(jsonStorage['games'][this.game_selection]?.[this.starterName]?.style);
			}
		},
		update<K extends keyof UIStyleSettings>(settingName: K, settingValue: UIStyleSettings[K]) {
			this.settings[settingName] = settingValue;
			localStorage.ui_customization = this.settings;
			if (settingName === "overlay_color") {
				document.documentElement.style.setProperty('--overlay-color', this.settings.overlay_color);
			}
			if (settingName ==="ui_saturation") {
				document.documentElement.style.setProperty('--style_ui_saturation', this.settings.ui_saturation.toString());
			}
			this._onUpdate();
		},
		_save() {
			if (this.starterName) {
				const storedStyleSettings = jsonStorage['games'][this.game_selection]?.[this.starterName].style;
				for (let key in this.settings) {
					storedStyleSettings[key] = this.settings[key];
				}
			}
		},
		_onUpdate() {
			document.documentElement.style.setProperty('--overlay-color', this.settings.overlay_color);
			document.documentElement.style.setProperty('--style_ui_saturation', this.settings.ui_saturation.toString());
			// No PubSub needed: Components react to store changes directly
			this._save();
		},
		applyStyle(style: Partial<UIStyleSettings> = {}) {
			for (let key in style) {
				type K = keyof UIStyleSettings;
				if (this.settings[key as K] !== undefined) {
					this.settings[key] = style[key as keyof UIStyleSettings];
				}
			}
			this._onUpdate();
		},
	},
});