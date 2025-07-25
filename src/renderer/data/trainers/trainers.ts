import { PokemonGame, Trainer } from "~/logic/PokeDataTypes.js";
import { RedAndBlueTrainers } from "./RedAndBlueTrainers.js";
import { YellowTrainers } from "./YellowTrainers.js";

export const trainers: Record<PokemonGame, Record<string, Trainer>> = {
	"Yellow": YellowTrainers,
	"Red and Blue": RedAndBlueTrainers,
	"Gold and Silver": {},
	"Crystal": {},
	"Ruby and Sapphire": {},
	"Emerald": {},
	"FireRed and LeafGreen": {},
	"Diamond and Pearl": {},
	"Platinum": {},
	"HeartGold and SoulSilver": {}
};