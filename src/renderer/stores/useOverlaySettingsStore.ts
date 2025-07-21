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

export interface OverlaySettings {
	// Overlay settings save on change
	game: PokemonGame | null,
	starter: string,
	starter_search: string,
	keyboard_shortcuts: any,
	visualization: {
		pop_ups: {
			/* 
			 * Enable/disable the pop-ups in general. If set to false, no pop up will be displayed, even if the 
			 * individual popup has `enabled === true`.
			 */
			enabled: boolean,
			bonks: OverlayPopupSettings & { mode: "Bonks" | "Item Count"},
			repel: OverlayPopupSettings,
			accuracy: OverlayPopupSettings,
			evasion: OverlayPopupSettings,
			field: OverlayPopupSettings,
		},
		left_panel: {
			stats: {
				mode: StatsPanelMode
			},
		},
		right_panel: {
			/** The preferred mode for the right-hand panel. */
			mode: RightPanelMode,
			/** Temporary override for the right hand panel, used for post-battle splits. */
			mode_override?: RightPanelMode | null,
			/** Whether or not the hotkeys are allowed to change the right hand panel mode. */
			hotkeys?: boolean,
			/** Whether to automatically switch to "splits" after a battle. */
			post_battle_splits?: boolean,
			/** Whether or not to show battle details in the right panel (on mode == Automatic) on wild pokemon encounters */
			wild_battles?: boolean,
			/** Movepool settings */
			movepool: {},
			/** Splits settings */
			splits: { mode: SplitsMode},
			/** Trainer battle settings */
			trainer: {},
			/** Wild encounter battle settings */
			wild_pokemon: {},
			/** Inventory settings */
			inventory: {},
		}
	},
}

function defaultOverlaySettings(): OverlaySettings {
	return {
		game: null,
		starter: "",
		starter_search: "",
		keyboard_shortcuts: {},
		visualization: {
			left_panel: {
				stats: {
					mode: StatsPanelMode.automatic,
				}
			},
			pop_ups: {
				enabled: true,
				bonks: { enabled: true, mode: "Bonks"  },
				repel: { enabled: true },
				accuracy: { enabled: true },
				evasion: { enabled: true },
				field: { enabled: true },
			},
			right_panel: {		
				hotkeys: false,
				post_battle_splits: true,
				inventory: {},
				mode: RightPanelMode.automatic,
				movepool: {},
				splits: { mode: SplitsMode.followup },
				trainer: {},
				wild_pokemon: {},
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