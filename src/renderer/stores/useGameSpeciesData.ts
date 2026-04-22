import { defineStore } from "pinia";
import { loadAppSettings, saveAppSettings } from "./helper/files";
import { JsonStorage } from "~/logic/Storage.js";
const path = require('path');

const SETTINGS_FILE_NAME = "settings.json";

export const useGameSpeciesData = defineStore("game_species_data", {
	state: () => defaultGameSpeciesSettings(),
	getters: {
		advanced(state) {
			return state.config.advanced;
		},
		background(state) {
			return state.styling.background;
		},
		artwork(state) {
			return state.styling.artwork;
		},
		ui(state) {
			return state.styling.ui;
		},
		gameSpecific<T extends Record<string, any>>(state) {
			return () =>  state.config.gameSpecific as T ?? {};
		}
	},
	actions: {
		/** Saves the config section to %APPSETTINGS%/data/${game}/${starter}/settings.json */
		async saveConfig(game: string|null, starter:string|null) {
			if (!game || !starter) {
				return;
			}
			// load the currently saved settigns:
			const settings = await loadAppSettings<GameSpeciesData>(path.join(game, starter), SETTINGS_FILE_NAME)
				?? defaultGameSpeciesSettings();
			// Apply the config sub-section:
			Object.assign(settings.config, this.$state.config);
			// Save the resulting merged config.
			saveAppSettings(path.join(game, starter), SETTINGS_FILE_NAME, settings)
			// This way we don't also save the style-settings if there are pending changes on there that the user
			// has not yet manually changed.
		},
		/** Loads the config section from %APPSETTINGS%/data/${game}/${starter}/settings.json */
		async loadConfig(game: string|null, starter:string|null) {
			if (!game || !starter) {
				return;
			}
			const loadedSettings = await loadAppSettings<GameSpeciesData>(path.join(game, starter), SETTINGS_FILE_NAME)
				?? defaultGameSpeciesSettings();
			Object.assign(this.$state.config, loadedSettings.config);
		},
		/** Saves the style section to `%APPSETTINGS%/data/${game}/${starter}/settings.json` */
		async saveStyle(game: string|null, starter:string|null) {
			if (!game || !starter) {
				return;
			}
			// We can just save the entire state in this case:
			saveAppSettings(path.join(game, starter), SETTINGS_FILE_NAME, this.$state)
		},
		/** Loads the style section from `%APPSETTINGS%/data/${game}/${starter}/settings.json` */
		async loadStyle(game: string|null, starter:string|null) {
			if (!game || !starter) {
				return;
			}
			const loadedSettings = await loadAppSettings<GameSpeciesData>(path.join(game, starter), SETTINGS_FILE_NAME);
			if (loadedSettings === null)  {
				this.applyPresetStyle(JsonStorage['games'][game][starter].style)
				return;
			}
			Object.assign(this.$state.styling, loadedSettings.styling);
		},
		applyPresetStyle(preset: DeprecatedStyleSettings) {
			const newStyle = structuredClone(defaultGameSpeciesSettings().styling);
			// TODO: Hopefully this is temporary code 'til we migrated all the presets to the new format. 
			// Then loading them is a lot less code. - Ion.
			if (Object.getOwnPropertyNames(preset).length === 0) {
				return;
			}
			newStyle.ui.saturation = parseFloat(preset.ui_saturation.toString());
			newStyle.ui.color = preset.overlay_color;

			newStyle.artwork.offset_x = parseInt(preset.imageXOffset.toString());
			newStyle.artwork.offset_y = parseInt(preset.imageYOffset.toString());
			newStyle.artwork.scale = parseFloat(preset.imageScale);
			newStyle.artwork.flip = preset.imageFlip;
			newStyle.artwork.saturation = parseInt(preset.imageSat);
			newStyle.artwork.rotation = preset.imageRotation;

			newStyle.background.blur = preset.backgroundBlur;
			newStyle.background.scale = parseFloat(preset.backgroundScale);
			newStyle.background.flip = preset.backgroundFlip;
			newStyle.background.offset_x = preset.backgroundXOffset;
			newStyle.background.offset_y = preset.backgroundYOffset;
			newStyle.background.texture = preset.backgroundTexture;
			newStyle.background.brightness = preset.backgroundBrightness;
			newStyle.background.contrast = parseInt(preset.backgroundContrast);
			newStyle.background.saturation = preset.backgroundSaturation;
			newStyle.background.hue = parseInt(preset.backgroundHue);
			Object.assign(this.$state.styling, newStyle);
		}
	}
});

type GameSpeciesData = ReturnType<typeof defaultGameSpeciesSettings>;

export function defaultGameSpeciesSettings() {
	return {
		// Config settings save on change
		config: {
			labels: {
				split_previous: "Previous",
				split_current: "Current",
			},
			hidden_power: "Dark",
			ability: "Intimidate",
			nature: "Adamant",
			gender: "Female",
			encounters: {
				// game specific structure; booleans
			},
			advanced: {
				test_run: false,
				refilming_mode: false,
				no_attempt: false,
				shuckie_timer: false,
				shuckie_counters: false,
				editor: {
					moves: {},
					items: {
						replacements: ["Rare Candy", "PP UP", "Full Restore", "Max Elixer"]
					},
					dvs: {},
				},
			},
			gameSpecific: {} as Record<string, any>
		},
		// Styling settings are saved with the click of a button on the overlay
		styling: {
			artwork: {
				/** X-offset for the pokemon artwork. Should be a whole number. */
				offset_x:   0,
				/** Y-offset for the pokemon artwork. Should be a whole number. */
				offset_y:   0,
				/** Scale factor (0 to 1) for the artwork. */
				scale:      1,
				/** Whether to flip the artwork horizontally */
				flip:       false,
				/** Saturation from 0 to 200, 100 being regular. */
				saturation: 100,
				/** Rotation in degrees, should be a whole number */
				rotation:   0,
			},
			background: {
				blur:        0,
				scale:       100,
				flip:        false,
				offset_x:    0, // went with "offset_x" instead of "x_offset" so that the offets are "grouped".
				offset_y:    0,
				texture:     'Bug 1',
				brightness:  100,
				contrast:    100,
				saturation:  100,
				/** Hue-shift applied to the background, in degrees. */
				hue:         0,
			},
			ui: {
				color: "#000000",
				saturation: 0.6,
			},
		}
	}
}

export interface DeprecatedStyleSettings {
	overlay_color: string,
	imageXOffset: string,
	imageYOffset: string,
	imageScale: string,
	imageFlip: true,
	imageSat: string,
	imageRotation: number,
	backgroundBlur: number,
	backgroundScale: string,
	backgroundFlip: false,
	backgroundXOffset: number,
	backgroundYOffset: number,
	backgroundTexture: string,
	backgroundBrightness: number,
	backgroundContrast: string,
	backgroundSaturation: number,
	backgroundHue: string,
	ui_saturation: string,
}

