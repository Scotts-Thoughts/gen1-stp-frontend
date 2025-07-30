import { defineStore } from "pinia";
import { useOverlaySettingsStore } from "./useOverlaySettingsStore";
import { PokemonGame } from "~/logic/PokeDataTypes";
import { GameState } from "./types/GameState";
import { EnemyState } from "./types/EnemyState";
import { RunState, useSpeciesMetricsStore } from "./useSpeciesMetricsStore";

/** 
 * Store for general purpose information that is not specific to a game or generation. 
 * Things like the current game, selected starter and the game state (which can be normalized accross generations).
 */
export const useMetaStore = defineStore('meta', {
	state: () => getDefaultMetaState() as MetaState,
	getters: {
		/** Forwarding from see {@link useOverlaySettingsStore} */
		starter: (): string => {
			const overlaySettings = useOverlaySettingsStore();
			return overlaySettings.starter;
		},
		/** Forwarding from see {@link useOverlaySettingsStore}*/
		game: (): PokemonGame | null => {
			const overlaySettings = useOverlaySettingsStore();
			return overlaySettings.game;
		},
		/** Whether the current run is completed */
		run_finished: () => {
			return useSpeciesMetricsStore().state == RunState.finished;
		}
	},
	actions: {
		/** Set the species of the currently active pokemon. */
		setCurrentSpecies(species: string): void {
			this.currentSpecies = species;
		},
		/** Set the current game state. */
		setGameState(state: GameState): void {
			this.gameState = state;
		},
		/** Set the current enemy state. */
		setEnemyState(state: EnemyState): void {
			this.enemyState = state;
		},
	}
});

function getDefaultMetaState() {
	return {
		/** The species that is currently the players active pokemon. May differ from starter. */
		currentSpecies: "",
		/** The current state of the game. */
		gameState: GameState.no_pokemon,
		/** The current state of the enemy trainer or enemy wild pokemon. */
		enemyState: EnemyState.not_in_battle,
	}
}

export type MetaState = ReturnType<typeof getDefaultMetaState>;
