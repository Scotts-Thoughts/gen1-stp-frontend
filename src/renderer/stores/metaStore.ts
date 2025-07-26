import { defineStore } from "pinia";
import { useOverlaySettingsStore } from "./useOverlaySettingsStore";
import { PokemonGame } from "~/logic/PokeDataTypes";

export enum GameState {
	/** Player has not yet obtained their starter pokemon, or they have reset the game and not yet hit "continue". */
	no_pokemon = "No Pokemon",
	/** Player has their pokemon and is currently in the overworld. */
	overworld = "Overworld",
	/** Player is entering a pokemon battle. */
	to_battle = "To Battle",
	/** Player is fighting in a pokemon battle. */
	in_battle = "Battle",
	/** Player is leaving a pokemon battle. */
	from_battle = "From Battle",
}

export enum EnemyState {
	/** Player is not currently in battle, no enemy exists. */
	not_in_battle = "Not In Battle",
	/** Start of the battle. Set when `battle.type` changes to `Trainer` or `Wild`. */
	battle_starting = "Battle Starting",
	/** 
	 * Pokemon was sent out.
	 * Is set when property `screen.menu.currentItem` changes to 0 while the current battle state 
	 * is either {@link fainted} or {@link battle_starting}.
	 */
	pokemon_sent_out = "Pokemon Sent Out",
	/** 
	 * Pokemon was sent out and either:
	 * a) the property `screen.menu.currentItem` is > 0 (indicating that the 'fight' menu has been opened)
	 * b) the gamestate is {@link GameState.to_battle} while property `battle.turnInfo.battleStart` changed to be 
	 * non-zero.
	 * */
	pokemon = "Pokemon",
	/** 
	 * Enemy pokemon is fainting. 
	 * Happens when property `battle.enemyPokemon.hp` changes to `0` while the current state is {@link pokemon}
	*/
	fainting = "Fainting",
	/** 
	 * Enemy pokemon has completed it's fainting state transition.
	 **/
	fainted = "Fainted",
	/** Battle has ended. */
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
		starter: (): string => {
			const overlaySettings = useOverlaySettingsStore();
			return overlaySettings.starter;
		},
		/** Forwarding from see {@link useOverlaySettingsStore}*/
		game: (): PokemonGame | null => {
			const overlaySettings = useOverlaySettingsStore();
			return overlaySettings.game;
		},
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
		/** Flag that is set to true when the run is finished and reset on a new run. */
		run_finished: false,
	}
}

export type MetaState = ReturnType<typeof getDefaultMetaState>;
