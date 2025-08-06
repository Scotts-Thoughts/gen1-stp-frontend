
export enum FaultMode {
	/** Player has neither resets nor blackouts. */
	none = "None",
	/** Player has at least one reset, zero blackouts. */
	resets = "Resets",
	/** Player has at least one blackout, zero resets. */
	blackouts = "Blackouts",
	/** Player at least one reset and blackout. */
	both = "Both"
}
