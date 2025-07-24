import { defineStore } from "pinia";
import { PokemonGame } from "../logic/PokeDataTypes";
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
 * 
 * Note: This store has a one-way synchronisation with {@link useOverlaySettingsStore} 
 * for the {@link MetaState.game} and {@link MetaState.starter} properties. The overlay settings will be updated
 * if this stores updates, but not the other way around.
 */
export const useMetaStore = defineStore('meta', {
	state: () => getDefaultMetaState() as MetaState,
	actions: {
		setStarter(starter: string) {
			this.starter = starter;
		},
		setCurrentSpecies(species: string) {
			this.currentSpecies = species;
		},
		setGameState(state: GameState) {
			this.gameState = state;
		},
		setEnemyState(state: EnemyState) {
			this.enemyState = state;
		},
		setGame(game: PokemonGame) {
			this.game = game;
		},
	}
});

function getDefaultMetaState() {
	return {
		/** The game that is currently being played and that Poke-A-Byte has a mapper loaded for. */
		game: null as PokemonGame | null,
		/** The starter chosen for the run. */
		starter: "",
		/** The species that is currently the players active pokemon. May differ from starter. */
		currentSpecies: "",
		/** The current state of the game. */
		gameState: GameState.no_pokemon,
		/** The current state of the enemy trainer or enemy wild pokemon. */
		enemyState: EnemyState.not_in_battle,
	}
}

export type MetaState = ReturnType<typeof getDefaultMetaState>;
