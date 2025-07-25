import moves from "~/data/moves.js";
import { GameDexes } from "~/data/pokedex";
import { tmhm } from "~/data/tmhm";
import { trainers } from "~/data/trainers/trainers";
import { PokemonGame, PokemonGeneration, PokemonMove, PokemonMovePool, PokemonSpecies } from "./PokeDataTypes.js";

/**
 * Get the property (or attribute) of the target object via a case-insenstivie key.
 * @param {Record<string, any>} object The object to read from.
 * @param {string} key The name of the key.
 * @returns {any} The value of the property.
 */
function getPropertyInvariant<T>(object: Record<string, T>, key: string) {
	const actualKey: string|undefined = Object.keys(object).find(x => x.toLowerCase() == key.toLowerCase());
	if (!actualKey) {
		return null;
	}
	return object[actualKey] ?? null;
}

class PokeData {
	_games: PokemonGame[] = [
		"Yellow",
		"Red and Blue",
		"Gold and Silver",
		"Crystal",
		"Ruby and Sapphire",
		"Emerald",
		"FireRed and LeafGreen",
		"Diamond and Pearl",
		"Platinum",
		"HeartGold and SoulSilver",
	];
	private _game: PokemonGame | null;
	private _generation: PokemonGeneration | null;

	constructor() {
		this._game = null;
		this._generation = null;
	};

	setGame = (game: PokemonGame) => {
		if (!this._games.includes(game)) {
			throw new Error("Unsupported game: " + game);
		}
		this._game = game;
		switch (this._game) {
			case "Yellow":
				this._generation = "1";
				break;
			case "Red and Blue":
				this._generation = "1";
				break;
			case "Gold and Silver":
				this._generation = "2";
				break;
			case "Crystal":
				this._generation = "2";
				break;
			case "Ruby and Sapphire":
				this._generation = "3";
				break;
			case "Emerald":
				this._generation = "3";
				break;
			case "FireRed and LeafGreen":
				this._generation = "3";
				break;
			case "Diamond and Pearl":
				this._generation = "4";
				break;
			case "Platinum":
				this._generation = "4";
				break;
			case "HeartGold and SoulSilver":
				this._generation = "4";
				break;
		}
	}

	/**
	 * Retrieve the pokedex data for a species.
	 * @param speciesName Name of the pokemon species.
	 * @returns The pokedex data.
	 */
	getSpecies = (speciesName: string): PokemonSpecies => {
		if (!this._game || !this._generation) {
			throw new Error("PokeData: No game defined.");
		}
		var result = GameDexes[this._game][normalizeSpeciesName(speciesName)];
		if (!result) {
			throw new Error(`PokeData: Could not find species ${speciesName} for ${this._game}.`);
		}
		return result;
	}

	getAllSpecieNames = (): string[] => {
		if (!this._game || !this._generation) {
			throw new Error("PokeData: No game defined.");
		}
		return Object.keys(GameDexes[this._game]);
	}
	
	getAllSpecies = (): PokemonSpecies[] => {
		if (!this._game || !this._generation) {
			throw new Error("PokeData: No game defined.");
		}
		return Object.values(GameDexes[this._game]);
	}

	/**
	 * Get the data of a move by it's name (not case sensitive).
	 * @param {string} moveName The name of the move.
	 * @returns {PokemonMove} - The move description.
	 */
	getMove = (moveName): PokemonMove => {
		if (!this._game || !this._generation) {
			throw new Error("PokeData: No game defined.");
		}
		const move = getPropertyInvariant<PokemonMove>(moves[this._generation], moveName) ?? null;
		if (!move) {
			throw new Error(`PokeData: Could not find move ${moveName} for generation ${this._generation}`);
		}
		return move;
	}

	/** 
	 * Get move data, by name, with additional `tmhm` property.
	 * @param moveName The name of the move.
	 * @returns - The move description.
	 */
	getMachineMove = (moveName): PokemonMove => {
		if (!this._game || !this._generation) {
			throw new Error("PokeData: No game defined.");
		}
		for(const [key, value] of Object.entries(tmhm[this._generation])) {
			if (value.toLowerCase() === moveName.toLocaleLowerCase()) {
				return {
					...this.getMove(moveName),
					tmhm: key
				}
			}
		}
		throw new Error(`PokeData: Could not find move ${moveName} for generation ${this._generation}`);
	}

	/**
	 * Get the move pool of a given pokemon species.
	 * @param speciesName Name of the species to get the move pool of.
	 * @returns The pokemons movepool data.
	 */
	getMovepool = (speciesName): PokemonMovePool => {
		const movePool: PokemonMovePool = {
			level: [],
			tmhm: [],
			tutor: [],
			egg: [],		
		};
		var species = this.getSpecies(speciesName);
		if (!species) {
			return movePool;
		}
		movePool.level = species.level_up_learnset.map(([level, move]) => {
			return {
				...this.getMove(move),
				Level: level,
			}
		}) ?? [];
		movePool.tmhm = species.tm_hm_learnset.map(this.getMachineMove);
		movePool.tutor = species.tutor_learnset?.map(this.getMove);
		movePool.egg = species.egg_moves?.map(this.getMove);
		return movePool;
	}

	/**
	 * Gets the information for the specified trainer.
	 * @param {string} id ID of the trainer (e.g. "YOUNGSTER 1").
	 * @returns {Trainer} The trainer data.
	 */
	getTrainer(id) {
		if (!this._game || !this._generation) {
			throw new Error("PokeData: No game defined.");
		}
		return getPropertyInvariant(trainers[this._game], id);
	}
}

export default new PokeData();

/** 
 * Helper function to translate between Poke-A-Byte mapper defined names and the names in the pokedex.js 
 * @param {string} name Name of a pokemon species.
 * @returns The form of the name usable with the pokedex data.
*/
function normalizeSpeciesName(name: string): string {
	switch (name) {
		case "NidoranM":
			return "Nidoran_M";
		case "NidoranF":
			return "Nidoran_F";
		default:
			return name;
	}
}

// Type definitions for documentation sake (also helps catching errors).

