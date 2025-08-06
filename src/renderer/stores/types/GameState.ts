
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
	from_battle = "From Battle"
}
