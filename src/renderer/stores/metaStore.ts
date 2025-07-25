import { defineStore } from "pinia";
import { useOverlaySettingsStore } from "./useOverlaySettingsStore";

export enum GameState {
	no_pokemon = "No Pokemon",
	overworld = "Overworld",
	to_battle = "To Battle",
	in_battle = "Battle",
	from_battle = "From Battle",
}

export enum EnemyState {
	not_in_battle = "Not In Battle",
	battle_starting = "Battle Starting",
	pokemon_sent_out = "Pokemon Sent Out",
	pokemon = "Pokemon",
	fainting = "Fainting",
	fainted = "Fainted",
	battle_finished = "Battle Finished",
}

/** 
 * Store for general purpose information that is not specific to a game or generation. 
 * Things like the current game, selected starter and the game state (which can be normalized accross generations).
 */
export const useMetaStore = defineStore('meta', {
	state: () => getDefaultMetaState() as MetaState,
	getters: {
		/** Forwarding from see {@link useOverlaySettingsStore} */
		starter: () => {
			const overlaySettings = useOverlaySettingsStore();
			return overlaySettings.starter;
		},
		/** Forwarding from see {@link useOverlaySettingsStore}*/
		game: () => {
			const overlaySettings = useOverlaySettingsStore();
			return overlaySettings.game;
		},
	},
	actions: {
		setCurrentSpecies(species: string) {
			this.currentSpecies = species;
		},
		setGameState(state: GameState) {
			this.gameState = state;
		},
		setEnemyState(state: EnemyState) {
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

		run_finished: false,
	}
}

export type MetaState = ReturnType<typeof getDefaultMetaState>;
