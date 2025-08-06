import { defineStore } from "pinia";
import { PokemonGame } from "~/logic/PokeDataTypes";
import { loadAppSettings, saveAppSettings } from "./helper/files";
import { StatsPanelMode } from "./types/StatsPanelMode";
import { RightPanelMode } from "./types/RightPanelMode";
import { SplitsMode } from "./types/SplitsMode";
import { OverlayPopupSettings } from "./types/OverlayPopupSettings";
import { BonksSettings } from "./types/BonksSettings";

/**
 * General overlay settings, that apply regardless of game and starer species. 
 * Saved automatically when changes are made, at the appropriate app-settings directory of the user.
 */
export type OverlaySettings = ReturnType<typeof defaultOverlaySettings>;

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
				speed_comparison: true as boolean, 
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