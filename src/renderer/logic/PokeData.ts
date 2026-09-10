import moves from "~/data/moves.js";
import { GameDexes } from "~/data/pokedex";
import { tmhm } from "~/data/tmhm";
import { trainers } from "~/data/trainers/trainers";
import { PokemonGame, PokemonGeneration, PokemonMove, PokemonMovePool, PokemonSpecies, Trainer } from "./PokeDataTypes.js";

/**
 * Get the property (or attribute) of the target object via a case-insenstivie key.
 * @param {Record<string, any>} object The object to read from.
 * @param {string} key The name of the key.
 * @returns {any} The value of the property.
 */
function getPropertyInvariant<T>(object: Record<string, T>, key: string): T | null {
	if (typeof key !== "string") {
		return null;
	}
	if (Object.prototype.hasOwnProperty.call(object, key)) {
		return object[key] ?? null;
	}
	const actualKey: string|undefined = Object.keys(object).find(x => x.toLowerCase() == key.toLowerCase());
	if (!actualKey) {
		return null;
	}
	return object[actualKey] ?? null;
}

/** A stand-in for a move that is not part of the data set, so that a single unknown move never breaks the overlay. */
function unknownMove(moveName: string): PokemonMove {
	return {
		rom_id: 0,
		move: moveName,
		type: "Normal",
		category: "Physical",
		pp: 0,
		power: null,
		accuracy: null,
		priority: 0,
		effect: "",
		effect_chance: null,
		target: "",
		makes_contact: false,
		affected_by_protect: false,
		affected_by_magic_coat: false,
		affected_by_snatch: false,
		affected_by_mirror_move: false,
		affected_by_kings_rock: false,
		description: "",
	};
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

	get game(): PokemonGame | null {
		return this._game;
	}

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
	 * Look up the pokedex data for a species. Unlike {@link getSpecies} this never throws.
	 * @param speciesName Name of the pokemon species.
	 * @returns The pokedex data, or `null` if the species is unknown or no game has been set.
	 */
	findSpecies = (speciesName: string | null | undefined): PokemonSpecies | null => {
		if (!this._game || !this._generation || !speciesName) {
			return null;
		}
		return getPropertyInvariant(GameDexes[this._game], normalizeSpeciesName(speciesName));
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
		var result = this.findSpecies(speciesName);
		if (!result) {
			throw new Error(`PokeData: Could not find species ${speciesName} for ${this._game}.`);
		}
		return result;
	}

	/** Whether the species only exists through the backport ROM patch (and is not one of the original 151). */
	isBackportSpecies = (speciesName: string | null | undefined): boolean => {
		const species = this.findSpecies(speciesName);
		if (!species) {
			return false;
		}
		return species.backport === true
			|| species.national_dex_number == null
			|| species.national_dex_number > 151;
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
	 * Look up a move by name (not case sensitive). Unlike {@link getMove} this never throws.
	 * @param moveName The name of the move.
	 * @returns The move description, or `null` if the move is unknown or no game has been set.
	 */
	findMove = (moveName: string | null | undefined): PokemonMove | null => {
		if (!this._game || !this._generation || !moveName) {
			return null;
		}
		return getPropertyInvariant<PokemonMove>(moves[this._generation], moveName);
	}

	/**
	 * Get the data of a move by it's name (not case sensitive).
	 * @param {string} moveName The name of the move.
	 * @returns {PokemonMove} - The move description.
	 */
	getMove = (moveName: string): PokemonMove => {
		if (!this._game || !this._generation) {
			throw new Error("PokeData: No game defined.");
		}
		const move = this.findMove(moveName);
		if (!move) {
			throw new Error(`PokeData: Could not find move ${moveName} for generation ${this._generation}`);
		}
		return move;
	}

	/**
	 * Get move data, by name, with additional `tmhm` property.
	 * @param moveName The name of the move.
	 * @returns - The move description. Moves that have no TM/HM in this generation get `tmhm: "-"`.
	 */
	getMachineMove = (moveName: string): PokemonMove => {
		if (!this._game || !this._generation) {
			throw new Error("PokeData: No game defined.");
		}
		const move = this.findMove(moveName) ?? unknownMove(moveName);
		for (const [key, value] of Object.entries(tmhm[this._generation])) {
			if (value.toLowerCase() === moveName.toLowerCase()) {
				return { ...move, tmhm: key };
			}
		}
		return { ...move, tmhm: "-" };
	}

	/**
	 * Get the move pool of a given pokemon species.
	 * @param speciesName Name of the species to get the move pool of.
	 * @returns The pokemons movepool data.
	 */
	getMovepool = (speciesName: string): PokemonMovePool => {
		const movePool: PokemonMovePool = {
			level: [],
			tmhm: [],
			tutor: [],
			egg: [],
		};
		var species = this.findSpecies(speciesName);
		if (!species) {
			return movePool;
		}
		const lookup = (move: string) => this.findMove(move) ?? unknownMove(move);
		movePool.level = (species.level_up_learnset ?? []).map(([level, move]) => {
			return {
				...lookup(move),
				Level: level,
			}
		});
		movePool.tmhm = (species.tm_hm_learnset ?? []).map(this.getMachineMove);
		movePool.tutor = (species.tutor_learnset ?? []).map(lookup);
		movePool.egg = (species.egg_moves ?? []).map(lookup);
		return movePool;
	}

	/**
	 * Gets the information for the specified trainer.
	 * @param {string} id ID of the trainer (e.g. "YOUNGSTER 1").
	 * @returns {Trainer} The trainer data.
	 */
	getTrainer(id: string): Trainer | null {
		if (!this._game || !this._generation) {
			throw new Error("PokeData: No game defined.");
		}
		return getPropertyInvariant(trainers[this._game], id);
	}
}

export default new PokeData();

/**
 * Helper function to translate between Poke-A-Byte mapper defined names and the names in the pokedex data.
 * @param {string} name Name of a pokemon species.
 * @returns The form of the name usable with the pokedex data.
*/
export function normalizeSpeciesName(name: string): string {
	switch (name) {
		case "Nidoran_M":
		case "Nidoran M":
			return "NidoranM";
		case "Nidoran_F":
		case "Nidoran F":
			return "NidoranF";
		default:
			return name;
	}
}
