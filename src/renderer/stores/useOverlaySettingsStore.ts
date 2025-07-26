import { defineStore } from "pinia";
import { PokemonGame } from "~/logic/PokeDataTypes";
import { loadAppSettings, saveAppSettings } from "./helper/files";

export interface OverlayPopupSettings {
	enabled: boolean,
}

/** Modes for the pokemon statistics panel. */
export enum StatsPanelMode {
	/** Choose the stats display mode automatically. */
	automatic = "Automatic",
	/** Show pokemon base stats */
	base_stats = "Base Stats",
	/** Show pokemon DVs */
	dvs = "DVs",
	/** Show pokemon EVs */
	evs = "EVs",
	/** Show detailed EV breakdown */
	detailed_evs = "Detailed EVs",
	/** Show badge boost information */
	badge_boosts = "Badge Boosts",
	/** Show the mean stats of all pokemon species in the current game. */
	averages = "Averages",
	/** Show the average stats of all pokemon species in the current game. */
	medians = "Medians",
	/** Show how many vitamins the current pokemon can still take and the stat experience. */
	vitamins = "Vitamins",
}

export enum RightPanelMode {
	automatic = "Automatic",
	movepool = "Movepool",
	splits = "Splits",
}

export enum SplitsMode {
	first = "First",
	followup = "Followup",
	followup_summary = "Followup + Summary",
}

export interface BonksSettings extends OverlayPopupSettings {
	mode: "Bonks" | "Item Count"
};

/**
 * General overlay settings, that apply regardless of game and starer species. 
 * Saved automatically when changes are made, at the appropriate app-settings directory of the user.
 */
export type OverlaySettings = ReturnType<typeof defaultOverlaySettings>;

function defaultOverlaySettings() {
	return {
		/** The game that is currently being played and that Poke-A-Byte has a mapper loaded for. */
		game: null as PokemonGame | null,
		/** The starter chosen for the run. */
		starter: "Venomoth",
		starter_search: "",
		keyboard_shortcuts: {},
		visualization: {
			left_panel: {
				stats: {
					mode: StatsPanelMode.automatic,
				}
			},
			pop_ups: {
				enabled: true as boolean,
				bonks: { enabled: true, mode: "Bonks" } as BonksSettings,
				repel: { enabled: true } as OverlayPopupSettings,
				accuracy: { enabled: true } as OverlayPopupSettings,
				evasion: { enabled: true } as OverlayPopupSettings,
				field: { enabled: true } as OverlayPopupSettings,
			},
			right_panel: {
				/** The preferred mode for the right-hand panel. */
				mode: RightPanelMode.automatic,
				/** Temporary override for the right hand panel, used for post-battle splits. */
				mode_override: null as RightPanelMode | null,
				/** Whether or not the hotkeys are allowed to change the right hand panel mode. */
				hotkeys: false as boolean,
				/** Whether to automatically switch to "splits" after a battle. */
				post_battle_splits: true as boolean,
				/** Whether or not to show battle details in the right panel (on mode == Automatic) on wild pokemon encounters */
				wild_battles: false as boolean,
				/** Movepool settings */
				movepool: {},
				/** Splits settings */
				splits: { mode: SplitsMode.followup },
				/** Trainer battle settings */
				trainer: {},
				/** Wild encounter battle settings */
				wild_pokemon: {},
				/** Inventory settings */
				inventory: {},
			}
		}
	};
}

export function saveOverlaySettings(data: OverlaySettings) {
	const fs = require('fs');
	if (!fs.existsSync("settings")) {
		fs.mkdirSync("settings", { recursive: true });
	}
	const json = JSON.stringify(data, null, 4);
	fs.writeFileSync("settings/overlay_settings.json", json);
}

export const useOverlaySettingsStore = defineStore('overlay_settings', {
	state: () => defaultOverlaySettings(),
	getters: {
		// Useful shorthands:
		left_panel(state) {
			return state.visualization.left_panel;
		},
		pop_ups(state) {
			return state.visualization.pop_ups;
		},
		right_panel(state) {
			return state.visualization.right_panel;
		},
		right_panel_mode(state) {
			return state.visualization.right_panel.mode_override
				?? state.visualization.right_panel.mode;
		}
	},
	actions: {
		async save() {
			await saveAppSettings<OverlaySettings>("", "overlay_settings.json", this.$state);
		},
		async load() {
			const loadedSettigns = await loadAppSettings<OverlaySettings>("", "overlay_settings.json")
				?? defaultOverlaySettings();
			Object.assign(this.$state, loadedSettigns);			
		},
		setRightPanelOverride(mode: RightPanelMode) {
			this.visualization.right_panel.mode_override = mode;
		},
		setRightPanelMode(mode: RightPanelMode) {
			this.visualization.right_panel.mode = mode;
		},
		setStatsPanelMode(mode: StatsPanelMode) {
			this.visualization.left_panel.stats.mode = mode;
		},
		clearRightPanelOverride() {
			this.visualization.right_panel.mode_override = null;
		},
		setGame(value: PokemonGame | null) {
			this.game = value;
		},
		setStarter(value: string) {
			this.starter = value;
		},
	}
});
