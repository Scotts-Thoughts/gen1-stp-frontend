import { JsonStorage } from "./Storage.js";
import { PokemonGame } from "./PokeDataTypes";

/**
 * Helpers for reading the pre-refactor `storage/Storage.json` file. That file is only used as a read-only source
 * for migrating presets and run counters into the per-species settings files in the user data directory.
 */

/** Storage.json keyed games by edition ("Red", "Blue", "Yellow") rather than by the mapper's game name. */
export function legacyGameKeys(game: PokemonGame | string | null): string[] {
	switch (game) {
		case "Yellow": return ["Yellow"];
		case "Red and Blue": return ["Red", "Blue"];
		default: return game ? [game] : [];
	}
}

/** Species keys that have been spelled differently over time. */
function speciesNameVariants(starter: string): string[] {
	const variants = [starter];
	if (starter === "NidoranM") variants.push("Nidoran_M", "Nidoran M");
	if (starter === "NidoranF") variants.push("Nidoran_F", "Nidoran F");
	if (starter === "Nidoran_M") variants.push("NidoranM");
	if (starter === "Nidoran_F") variants.push("NidoranF");
	return variants;
}

export type LegacySpeciesEntry = {
	style?: Record<string, any>,
	settings?: Record<string, any>,
	splits?: Record<string, any>,
	data?: Record<string, any>,
};

/**
 * Find the most useful Storage.json entry for a game/species pair. When both a "Red" and a "Blue" entry exist the
 * one with the most recorded attempts wins. Returns `null` when nothing usable is stored.
 */
export function findLegacySpeciesEntry(game: PokemonGame | string | null, starter: string | null): LegacySpeciesEntry | null {
	if (!game || !starter) {
		return null;
	}
	const games = (JsonStorage as any)?.games;
	if (!games || typeof games !== "object") {
		return null;
	}
	let best: LegacySpeciesEntry | null = null;
	let bestScore = -1;
	for (const gameKey of legacyGameKeys(game)) {
		for (const name of speciesNameVariants(starter)) {
			const entry = games[gameKey]?.[name];
			if (!entry || typeof entry !== "object") {
				continue;
			}
			const style = entry.style ?? {};
			const score = (Number(style.attempt_number) || 0) * 1000 + Object.keys(style).length;
			if (score > bestScore) {
				best = entry;
				bestScore = score;
			}
		}
	}
	return best;
}
