import { defineStore } from "pinia";
import { PokemonGame } from "../logic/PokeDataTypes";

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
	state: () => ({
		game: null as PokemonGame | null,
		starter: "",
		currentSpecies: "",
		gameState: GameState.no_pokemon,
		enemyState: EnemyState.not_in_battle,
	}),
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