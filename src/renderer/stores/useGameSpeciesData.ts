import { defineStore } from "pinia";
import { loadAppSettings, saveAppSettings } from "./helper/files";
import { deepMerge } from "./helper/merge";
import { findLegacySpeciesEntry } from "~/logic/legacyStorage";
import { textures } from "~/data/textures";
const path = require('path');

const SETTINGS_FILE_NAME = "settings.json";

/**
 * Settings that are specific to a game and species combination: the run configuration (encounter flags, advanced
 * toggles, split labels) and the styling of the overlay (artwork position, background texture, UI colour).
 *
 * Everything in here is saved automatically by {@link useSettingsStore} whenever it changes, to
 * `%APPDATA%/stp-generation1-overlay/data/${game}/${starter}/settings.json`.
 */
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
		/** Game specific configuration, e.g. the encounter flags. */
		gameSpecific(state): Record<string, any> {
			return state.config.gameSpecific;
		}
	},
	actions: {
		/** Saves the complete state to `%APPDATA%/data/${game}/${starter}/settings.json` */
		async save(game: string|null, starter: string|null) {
			if (!game || !starter) {
				return;
			}
			await saveAppSettings(path.join(game, starter), SETTINGS_FILE_NAME, this.$state);
		},
		/**
		 * Loads the complete state from `%APPDATA%/data/${game}/${starter}/settings.json`.
		 * When no file exists yet, the styling preset from the old `Storage.json` is used (if there is one).
		 */
		async load(game: string|null, starter: string|null) {
			if (!game || !starter) {
				return;
			}
			const defaults = defaultGameSpeciesSettings();
			const loaded = await loadAppSettings<Partial<GameSpeciesData>>(path.join(game, starter), SETTINGS_FILE_NAME);
			const next = loaded
				? deepMerge(defaults, loaded)
				: { ...defaults, styling: presetStyling(game, starter) ?? defaults.styling };
			// Earlier versions of the overlay wrote settings files with default styling before the legacy preset
			// could be applied. If the styling is still untouched, prefer the preset.
			if (loaded && JSON.stringify(next.styling) === JSON.stringify(defaults.styling)) {
				next.styling = presetStyling(game, starter) ?? next.styling;
			}
			// Replace the state in one go so that subscribers get a single, synchronous notification.
			this.$patch((state) => { Object.assign(state, next); });
		},
		/** Re-reads only the styling section, from the settings file or the legacy preset. */
		async reloadStyle(game: string|null, starter:string|null) {
			if (!game || !starter) {
				return;
			}
			const defaults = defaultGameSpeciesSettings();
			const loaded = await loadAppSettings<Partial<GameSpeciesData>>(path.join(game, starter), SETTINGS_FILE_NAME);
			const styling = loaded?.styling
				? deepMerge(defaults.styling, loaded.styling)
				: (presetStyling(game, starter) ?? defaults.styling);
			this.$patch((state) => { state.styling = styling; });
		},
		// Aliases kept for the buttons on the style panel.
		async saveStyle(game: string|null, starter:string|null) {
			await this.save(game, starter);
		},
		async loadStyle(game: string|null, starter:string|null) {
			await this.reloadStyle(game, starter);
		},
	}
});

type GameSpeciesData = ReturnType<typeof defaultGameSpeciesSettings>;
type StylingSettings = GameSpeciesData["styling"];

/** Convert a styling preset from the old `Storage.json` file to the current format. */
function presetStyling(game: string, starter: string): StylingSettings | null {
	const entry = findLegacySpeciesEntry(game, starter);
	const preset = entry?.style;
	if (!preset || Object.keys(preset).length === 0) {
		return null;
	}
	return presetToStyling(preset as DeprecatedStyleSettings);
}

const toNumber = (value: unknown, fallback: number): number => {
	const parsed = typeof value === "number" ? value : parseFloat(String(value));
	return Number.isFinite(parsed) ? parsed : fallback;
};
const toBool = (value: unknown, fallback: boolean): boolean => {
	if (typeof value === "boolean") return value;
	if (value === "true") return true;
	if (value === "false") return false;
	return fallback;
};

export function presetToStyling(preset: DeprecatedStyleSettings): StylingSettings {
	const style = structuredClone(defaultGameSpeciesSettings().styling);
	style.ui.saturation = toNumber(preset.ui_saturation, style.ui.saturation);
	style.ui.color = typeof preset.overlay_color === "string" && preset.overlay_color ? preset.overlay_color : style.ui.color;

	style.artwork.offset_x = toNumber(preset.imageXOffset, style.artwork.offset_x);
	style.artwork.offset_y = toNumber(preset.imageYOffset, style.artwork.offset_y);
	style.artwork.scale = toNumber(preset.imageScale, style.artwork.scale);
	style.artwork.flip = toBool(preset.imageFlip, style.artwork.flip);
	style.artwork.saturation = toNumber(preset.imageSat, style.artwork.saturation);
	style.artwork.rotation = toNumber(preset.imageRotation, style.artwork.rotation);

	style.background.blur = toNumber(preset.backgroundBlur, style.background.blur);
	style.background.scale = toNumber(preset.backgroundScale, style.background.scale);
	style.background.flip = toBool(preset.backgroundFlip, style.background.flip);
	style.background.flip_y = toBool(preset.backgroundXFlip, style.background.flip_y);
	style.background.offset_x = toNumber(preset.backgroundXOffset, style.background.offset_x);
	style.background.offset_y = toNumber(preset.backgroundYOffset, style.background.offset_y);
	style.background.texture = typeof preset.backgroundTexture === "string" && preset.backgroundTexture in textures
		? preset.backgroundTexture
		: style.background.texture;
	style.background.brightness = toNumber(preset.backgroundBrightness, style.background.brightness);
	style.background.contrast = toNumber(preset.backgroundContrast, style.background.contrast);
	style.background.saturation = toNumber(preset.backgroundSaturation, style.background.saturation);
	style.background.hue = toNumber(preset.backgroundHue, style.background.hue);
	return style;
}

export function defaultGameSpeciesSettings() {
	return {
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
				/** Attempt number to log to when refilming. */
				refilmed_attempt: 0,
				/** Finish number to log to when refilming. */
				refilmed_finish: 0,
				no_attempt: false,
				shuckie_timer: false,
				shuckie_counters: false,
				/** Whether a blackout (returning to the overworld after fainting) counts as a fault. */
				count_blackouts: true,
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
				/** Mirror the background horizontally. */
				flip:        false,
				/** Mirror the background vertically. */
				flip_y:      false,
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

/** The style section of a species entry in the old `Storage.json` file. Values were often stored as strings. */
export interface DeprecatedStyleSettings {
	overlay_color?: string,
	imageXOffset?: string | number,
	imageYOffset?: string | number,
	imageScale?: string | number,
	imageFlip?: boolean | string,
	imageSat?: string | number,
	imageRotation?: string | number,
	backgroundBlur?: string | number,
	backgroundScale?: string | number,
	backgroundFlip?: boolean | string,
	backgroundXFlip?: boolean | string,
	backgroundXOffset?: string | number,
	backgroundYOffset?: string | number,
	backgroundTexture?: string,
	backgroundBrightness?: string | number,
	backgroundContrast?: string | number,
	backgroundSaturation?: string | number,
	backgroundHue?: string | number,
	ui_saturation?: string | number,
}
