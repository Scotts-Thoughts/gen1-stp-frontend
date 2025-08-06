
export enum EnemyState {
	/** Player is not currently in battle, no enemy exists. */
	not_in_battle = "Not In Battle",
	/** Start of the battle. Set when `battle.type` changes to `Trainer` or `Wild`. */
	battle_starting = "Battle Starting",
	/**
	 * Pokemon was sent out.
	 * Is set when property `screen.menu.currentItem` changes to 0 while the current battle state
	 * is either {@link fainted} or {@link battle_starting}.
	 */
	pokemon_sent_out = "Pokemon Sent Out",
	/**
	 * Pokemon was sent out and either:
	 * a) the property `screen.menu.currentItem` is > 0 (indicating that the 'fight' menu has been opened)
	 * b) the gamestate is {@link GameState.to_battle} while property `battle.turnInfo.battleStart` changed to be
	 * non-zero.
	 * */
	pokemon = "Pokemon",
	/**
	 * Enemy pokemon is fainting.
	 * Happens when property `battle.enemyPokemon.hp` changes to `0` while the current state is {@link pokemon}
	*/
	fainting = "Fainting",
	/**
	 * Enemy pokemon has completed it's fainting state transition.
	 **/
	fainted = "Fainted",
	/** Battle has ended. */
	battle_finished = "Battle Finished"
}
