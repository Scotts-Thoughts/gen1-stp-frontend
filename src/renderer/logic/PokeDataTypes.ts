export type PokemonGeneration = "1" | "2" | "3" | "4" | "5";
export type PokemonGame = "Yellow"
	| "Red and Blue"
	| "Gold and Silver"
	| "Crystal"
	| "Ruby and Sapphire"
	| "Emerald"
	| "FireRed and LeafGreen"
	| "Diamond and Pearl"
	| "Platinum"
	| "HeartGold and SoulSilver";
	
/** Possible pokemon growth rates. */
export type GrowthRate = "Erratic" | "Fast" | "Medium Fast" | "Medium Slow" | "Slow" | "Fluctuating";



export type PokemonSpecies = {
	"species": string;
	"rom_id": number;
	"national_dex_number": number;
	"base_stats": {
		"hp": number;
		"attack": number;
		"defense": number;
		"speed": number;
		"special_attack": number;
		"special_defense": number;
	};
	"ev_yield": {
		"hp": number;
		"attack": number;
		"defense": number;
		"speed": number;
		"special_attack": number;
		"special_defense": number;
	};
	"type_1": PokemonType;
	"type_2": PokemonType;
	"catch_rate": number;
	"base_experience": number;
	"common_item": (string | null);
	"rare_item": (string | null);
	"gender_ratio": (number | null);
	"egg_cycles": (number | null);
	"base_friendship": (number | null);
	"growth_rate": GrowthRate;
	"egg_group_1": (string | null);
	"egg_group_2": (string | null);
	"abilities": string[];
	"tm_hm_learnset": string[];
	"tutor_learnset": string[];
	"egg_moves": string[];
	"level_up_learnset": [number, string][];
	"weight": any;
	"evolution_family": any[];
};

/**
 * Pokemon type.
 */
export type MoveCategory = (
	"Physical" | "Status" | "Special");

/**
 * Pokemon move category.
 */
export type PokemonType = (
	"Normal" | "Fighting" | "Grass" | "Fire" | "Water" | "Electric" | "Ground" | "Rock" | "Psychic" | "Poison" | "Flying" |
	"Bug" | "Ice" | "Ghost" | "Dragon" | "Steel" | "Dark" | "Fairy");

/**
 * Data describing a pokemon move.
 */
export type PokemonMove = {
	Level?: number,
	tmhm?: string
	"rom_id": number;
	"move": string;
	"type": PokemonType;
	"category": MoveCategory;
	"pp": number;
	"power": number | null;
	"accuracy": number | null;
	"priority": number;
	"effect": string;
	"effect_chance": number | null;
	"target": string;
	"makes_contact": boolean;
	"affected_by_protect": boolean;
	"affected_by_magic_coat": boolean;
	"affected_by_snatch": boolean;
	"affected_by_mirror_move": boolean;
	"affected_by_kings_rock": boolean;
	"description": string;
};

/**
 * Data describing a pokemon move.
 */
export type PokemonMovePool = {
	level: PokemonMove[];
	tmhm: PokemonMove[];
	tutor: PokemonMove[];
	egg: PokemonMove[];
};

export type Trainer = {
	rom_id: string;
	name: string;
	trainer_class: string;
	location: string;
	money: number;
	is_double_battle: boolean;
	items: any[];
	party: TrainerPokemon[];
};

export type TrainerPokemon = {
	species: string;
	level: number;
	experience_yield: number;
	nature: string | null;
	ability: string | null;
	held_item: string | null;
	stats: {
		hp: number;
		attack: number;
		defense: number;
		speed: number;
		special_attack: number;
		special_defense: number;
	};
	moves: string[];
};

export type BaseStats = PokemonSpecies["base_stats"];