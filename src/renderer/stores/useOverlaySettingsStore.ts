import { defineStore } from "pinia";
import { PokemonGame } from "../logic/PokeDataTypes";

export interface OverlayPopupSettings {
	enabled: boolean,
}

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
	averages = "Averages",
	medians = "Medians",
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
		game: null as PokemonGame | null,
		starter: "",
		starter_search: "",
		keyboard_shortcuts: {},
		test_run: false as boolean,
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

function loadOverlaySettings(): OverlaySettings  {
	const fs = require('fs');
	try {
		const data = fs.readFileSync("settings/overlay_settings.json", 'utf8');
		return JSON.parse(data);
	} catch {
		const data = defaultOverlaySettings();
		saveOverlaySettings(data);
		return data;
	}
}

export const useOverlaySettingsStore = defineStore('overlay_settings', {
	state: () => ({
		settings: loadOverlaySettings(),
	}),
	getters: {
		// Useful shorthands:
		game(state) {
			return state.settings.game;
		},
		starter(state) {
			return state.settings.starter;
		},
		left_panel(state) {
			return state.settings.visualization.left_panel;
		},
		pop_ups(state) {
			return state.settings.visualization.pop_ups;
		},
		right_panel(state) {
			return state.settings.visualization.right_panel;
		},
		right_panel_mode(state) {
			return state.settings.visualization.right_panel.mode_override 
				?? state.settings.visualization.right_panel.mode;
		}
	},
	actions: {
		setRightPanelOverride(mode: RightPanelMode) {
			this.settings.visualization.right_panel.mode_override = mode;
		},
		setRightPanelMode(mode: RightPanelMode) {
			this.settings.visualization.right_panel.mode = mode;
		},
		setStatsPanelMode(mode: StatsPanelMode) {
			this.settings.visualization.left_panel.stats.mode = mode;
		},
		clearRightPanelOverride() {
			this.settings.visualization.right_panel.mode_override = null;
		},
		setGame(value: PokemonGame|null) {
			this.settings.game = value;
			saveOverlaySettings(this.settings);
		},
		setStarter(value: string) {
			this.settings.starter = value;
			saveOverlaySettings(this.settings);
		},
	}
});