/** Modes for the pokemon statistics panel. */

export enum StatsPanelMode {
	/** Choose the stats display mode automatically. */
	automatic = "Automatic",
	/** Show pokemon base stats */
	base_stats = "Base Stats",
	/** Show pokemon DVs */
	dvs = "DVs",
	/** Show pokemon EVs */
	evs = "EVs",
	/** Show detailed EV breakdown */
	detailed_evs = "Detailed EVs",
	/** Show badge boost information */
	badge_boosts = "Badge Boosts",
	/** Show the mean stats of all pokemon species in the current game. */
	averages = "Averages",
	/** Show the average stats of all pokemon species in the current game. */
	medians = "Medians",
	/** Show how many vitamins the current pokemon can still take and the stat experience. */
	vitamins = "Vitamins"
}
