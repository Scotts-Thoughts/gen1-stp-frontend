import { PokemonGame, PokemonSpecies } from "../logic/PokeDataTypes";
import { CrystalDex } from "./pokedex/CrystalDex";
import { DiamondAndPearlDex } from "./pokedex/DiamondAndPearlDex";
import { HeartGoldAndSoulSilverDex } from "./pokedex/HeartGoldAndSoulSilverDex";
import { PlatinumDex } from "./pokedex/PlatinumDex";
import { YellowDex } from "./pokedex/YellowDex";
import { RedAndBlueDex } from "./pokedex/RedAndBlueDex";
import { GoldAndSilverDex } from "./pokedex/GoldAndSilverDex";
import { EmeraldDex } from "./pokedex/EmeraldDex";
import { FireRedAndLeafGreenDex } from "./pokedex/FireRedAndLeafGreenDex";
import { RubyAndSapphireDex } from "./pokedex/RubyAndSapphire";

export const GameDexes: Record<PokemonGame, Record<string, PokemonSpecies>> = {
    "Yellow": YellowDex,
    "Red and Blue": RedAndBlueDex,
    "Gold and Silver": GoldAndSilverDex,
    "Crystal": CrystalDex,
    "Ruby and Sapphire": RubyAndSapphireDex,
    "Emerald": EmeraldDex,
    "FireRed and LeafGreen": FireRedAndLeafGreenDex,
    "Diamond and Pearl": DiamondAndPearlDex,
    "Platinum": PlatinumDex,
    "HeartGold and SoulSilver": HeartGoldAndSoulSilverDex,
}