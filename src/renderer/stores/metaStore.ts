import { defineStore } from "pinia";
import { PokemonGame } from "../logic/PokeDataTypes";

export enum GameState {
	no_pokemon = "No Pokemon",
	overworld = "Overworld",
	to_battle = "To Battle",
	in_battle = "Battle",
	from_battle = "From Battle",
}

/** 
 * Store for general purpose information that is not specific to a game or generation. 
 * Things like the current game, selected starter and the game state (which can be normalized accross generations).
 */
export const useMetaStore = defineStore('meta', {
	state: () => ({
		game: null as PokemonGame|null,
		starter: "",
		currentSpecies: "",
		gameState: GameState.no_pokemon,
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
		setGame(game: PokemonGame) {
			this.game = game;
		},
	}
});