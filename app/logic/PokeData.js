const moves = require("../data/moves.js");
const pokedex = require("../data/pokedex.js");
const tmhm = require("../data/tmhm.js");
const trainers = require("../data/trainers/all.js");

/**
 * Get the property (or attribute) of the target object via a case-insenstivie key.
 * @param {Record<string, any>} object The object to read from.
 * @param {string} key The name of the key.
 * @returns {any} The value of the property.
 */
function getPropertyInvariant(object, key) {
	var actualKey = Object.keys(object).find(x => x.toLowerCase() == key.toLowerCase());
	return object[actualKey];
}

class PokeData {
	_games = [
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

	constructor() {
		this._game = null;
		this._generation = 0;
	};

	setGame = (game) => {
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
	 * @param {string} speciesName Name of the pokemon species.
	 * @returns {PokemonSpecies} The pokedex data.
	 */
	getSpecies = (speciesName) => {
		if (!this._game) {
			throw new Error("PokeData: No game defined.")
		}
		return pokedex[this._game][normalizeSpeciesName(speciesName)];
	}

	getAllSpecieNames = () => {
		if (!this._game) {
			throw new Error("PokeData: No game defined.")
		}
		return Object.keys(pokedex[this._game]);
	}
	
	getAllSpecies = () => {
		if (!this._game) {
			throw new Error("PokeData: No game defined.")
		}
		return Object.values(pokedex[this._game]);
	}

	/**
	 * Get the data of a move by it's name (not case sensitive).
	 * @param {string} moveName The name of the move.
	 * @returns {PokemonMove} - The move description.
	 */
	getMove = (moveName) => {
		if (!this._game) {
			throw new Error("PokeData: No game defined.")
		}
		return getPropertyInvariant(moves[this._generation], moveName) ?? null;
	}

	/** 
	 * Get move data, by name, with additional `tmhm` property.
	 * @param {string} moveName The name of the move.
	 * @returns {PokemonMove & {tmhm: string}} - The move description.
	 */
	getMachineMove = (moveName) => {
		if (!this._game) {
			throw new Error("PokeData: No game defined.")
		}
		for(const [key, value] of Object.entries(tmhm[this._generation])) {
			if (value.toLowerCase() === moveName.toLocaleLowerCase()) {
				return {
					...this.getMove(moveName),
					tmhm: key
				}
			}
		}
		return null;
	}

	/**
	 * Get the move pool of a given pokemon species.
	 * @param {string} speciesName Name of the species to get the move pool of.
	 * @returns {PokemonMovePool}
	 */
	getMovepool = (speciesName) => {
		const movePool = {
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
				Level: level,
				...this.getMove(move)
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
		if (!this._game) {
			throw new Error("PokeData: No game defined.")
		}
		return getPropertyInvariant(trainers[this._game], id);
	}
}

module.exports = new PokeData();

/** 
 * Helper function to translate between Poke-A-Byte mapper defined names and the names in the pokedex.js 
 * @param {string} name Name of a pokemon species.
 * @returns The form of the name usable with the pokedex data.
*/
function normalizeSpeciesName(name) {
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

/**
 * @typedef {{
 *    "species": "Abra",
 *    "rom_id": 148,
 *    "national_dex_number": 63,
 *    "base_stats": {
 *        "hp": number,
 *        "attack": number,
 *        "defense": number,
 *        "speed": number,
 *        "special_attack": number,
 *        "special_defense": number,
 *    },
 *    "ev_yield": {
 *        "hp": number,
 *        "attack": number,
 *        "defense": number,
 *        "speed": number,
 *        "special_attack": number,
 *        "special_defense": number,
 *    },
 *    "type_1": PokemonType,
 *    "type_2": PokemonType,
  *    "catch_rate": number,
 *    "base_experience": number,
 *    "common_item": (string | null),
 *    "rare_item": (string | null),
 *    "gender_ratio": (string | null),
 *    "egg_cycles": (string | null),
 *    "base_friendship": (string | null),
 *    "growth_rate": string,
 *    "egg_group_1": (string | null),
 *    "egg_group_2": (string | null),
 *    "abilities": string[],
 *    "tm_hm_learnset": string[]
 *    "tutor_learnset": string[],
 *    "egg_moves": string[],
 *    "level_up_learnset": [number, string][],
 *    "weight": any,
 *    "evolution_family": any[],
 * }} PokemonSpecies
 */

/**
 * Pokemon type.
 * @typedef {(
 * "Physical" | "Status" | "Special"
 *)} MoveCategory
 */

/**
 * Pokemon move category.
 * @typedef {(
 * "Normal" | "Fighting" | "Grass" | "Fire" | "Water" | "Electric" | "Ground" | "Rock" | "Psychic" | "Poison" | "Flying" 
 * | "Bug" | "Ice" | "Ghost" | "Dragon" | "Steel" | "Dark" | "Fairy"  
 *)} PokemonType
 */

/**
 * Data describing a pokemon move.
 * @typedef {{
 *     "rom_id": number,
 *     "move": string,
 *     "type": PokemonType,
 *     "category": MoveCategory,
 *     "pp": number,
 *     "power": number | null,
 *     "accuracy": number | null,
 *     "priority": number,
 *     "effect": string,
 *     "effect_chance": number | null,
 *     "target": string,
 *     "makes_contact": boolean,
 *     "affected_by_protect": boolean,
 *     "affected_by_magic_coat": boolean,
 *     "affected_by_snatch": boolean,
 *     "affected_by_mirror_move": boolean,
 *     "affected_by_kings_rock": boolean,
 *     "description": string,
 * }} PokemonMove
 */

/**
 * Data describing a pokemon move.
 * @typedef {{
 *     level: PokemonMove[],
 *     tmhm: PokemonMove[],
 *     tutor: PokemonMove[],
 *     egg: PokemonMove[],
 * }} PokemonMovePool
 */

/**
 * @typedef {{
 *     rom_id: string,
 *     name: string,
 *     trainer_class: string,
 *     location: string,
 *     money: number,
 *     is_double_battle: boolean,
 *     items: any[],
 *     pokemon: TrainerPokemon[],
 * }} Trainer
 */

/**
 * @typedef {{
 *     species: string,
 *     level: number,
 *     experience_yield:number,
 *     nature: string | null,
 *     ability: string | null,
 *     held_item: string | null,
 *     stats: {
 *         hp: number,
 *         attack: number,
 *         defense: number,
 *         speed: number,
 *         special_attack: number,
 *         special_defense: number,
 *     }
 *     moves: string[],
 * }} TrainerPokemon
 */