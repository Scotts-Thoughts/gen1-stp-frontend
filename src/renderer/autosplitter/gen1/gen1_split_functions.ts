import { toRaw } from "vue";
import { FullSplitFunction, padTime, UniqueTrainerIdFunction } from "../split_functions";
import { FullSplit } from "../types";
import { deprecated_autosplitter } from "~/data/deprecated_autosplitter";
import { PokemonGame } from "~/logic/PokeDataTypes";
import { capitalize_words } from "~/methods/text_functions";

export const getUniqueTrainerIdGen1: UniqueTrainerIdFunction = (properties) => {
	return properties.battle.trainer.class.value + "_" + properties.battle.trainer.number.value;
}

export const createFullSplitGen1: FullSplitFunction = ( properties,  meta, metrics, battle) => {
	const incremented_finished_run_count: number = metrics.finishes + 1;
	const d = new Date();
	const battle_end = Date.now();
	const { raw: time, formatted: formattedTime } = metrics.getTime();
	const gameTimeH = properties.gameTime?.hours?.value;
	const gameTimeM = properties.gameTime?.minutes?.value;
	const gameTimeS = properties.gameTime?.seconds?.value;
	const gameTimeF = properties.gameTime?.frames?.value;
	const split = {
		"date_string": (d.getMonth() + 1) + "-" + d.getDate().toString().padStart(2, "0"),
		"time_string": d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0"),
		"player_name": properties.player.name.value,
		"pokemon": meta.starter,
		"trainer_name": format_trainer_name(meta.game, properties.battle.trainer.class.value, properties.battle.trainer.number.value),
		"trainer_id": properties.battle.trainer.number.value,
		"location": properties.overworld.map.value,
		"total_pokemon": properties.battle.trainer.totalPokemon.value,
		"real_time_total": formattedTime[0] + formattedTime[1],
		"real_time_hmmss": formattedTime[0],
		"real_time_file_label": formattedTime[2],
		"resets": metrics.resets.toString(),
		"blackouts": metrics.blackouts.toString(),
		"failures": metrics.resets + metrics.blackouts,
		"level": properties.player.team[0].level.value.toString(),
		"game_time": gameTimeH + ":" + gameTimeM.toString().padStart(2, "0"),
		"battle_duration": (battle_end - battle.statistics.battle_start)/1000 ,
		"move1": properties.player.team[0].move1.value,
		"move2": properties.player.team[0].move2.value,
		"move3": properties.player.team[0].move3.value,
		"move4": properties.player.team[0].move4.value,
		"saves": properties.patch.saves.saveCount.value,
		"steps": properties.patch.steps.stepsCount.value,
		"bonks": properties.patch.steps.bonks.value,
		"trainerBattles": properties.patch.battles.trainerBattles.value,
		"wildBattles": properties.patch.battles.wildBattles.value,
		"battleTurns": properties.patch.battle_info.turns.battleTurns.value,
		"playerTurns": properties.patch.battle_info.turns.playerTurns.value,
		"enemyTurns": properties.patch.battle_info.turns.enemyTurns.value,
		"itemsInBag": properties.player.itemCount.value,
		"money": properties.player.money.value,
		"rivalTeam": properties.rival.finalTeam.value,
		"statusCondition": properties.player.team[0].statusCondition.value,
		"type1": properties.player.team[0].type1.value,
		"type2": properties.player.team[0].type2.value,
		"experience": properties.player.team[0].expPoints.value,
		"ROM": meta.starter.toString() + " " + incremented_finished_run_count.toString(),
		"Species": meta.starter, 
		"Trainer": deprecated_autosplitter[properties.meta.gameName.value][`${properties.battle.trainer.class.value}_${properties.battle.trainer.number.value}`],
		"Start Time": battle.statistics.time_split_start, 
		"Real Time": padTime(time.hours) + ":" + padTime(time.minutes) + ":" + padTime(time.seconds) + "." + padTime(time.ms), 
		"Game Time": padTime(gameTimeH) + ":" + padTime(gameTimeM) + ":" + padTime(gameTimeS) + "." + padTime(gameTimeF), 
		"Level": properties.player.team[0].level.value.toString(), 
		"Resets": metrics.resets,
		"RTHours": time.hours,
		"RTMinutes": time.minutes,
		"RTSeconds": time.seconds,
		"RTMilliseconds": time.ms,
		"Move 1": properties.player.team[0].move1.value,
		"Move 2": properties.player.team[0].move2.value,
		"Move 3": properties.player.team[0].move3.value,
		"Move 4": properties.player.team[0].move4.value,
		"move1pp": properties.player.team[0].move1pp.value,
		"move2pp": properties.player.team[0].move2pp.value,
		"move3pp": properties.player.team[0].move3pp.value,
		"move4pp": properties.player.team[0].move4pp.value,
		"move1ppUp": properties.player.team[0].move1ppUp.value,
		"move2ppUp": properties.player.team[0].move2ppUp.value,
		"move3ppUp": properties.player.team[0].move3ppUp.value,
		"move4ppUp": properties.player.team[0].move4ppUp.value,
		"Hp": properties.player.team[0].hp.value,
		"Max HP": properties.player.team[0].maxHp.value,
		"Attack": properties.player.team[0].attack.value,
		"Defense": properties.player.team[0].defense.value,
		"Sp. Attack": properties.player.team[0].special.value,
		"Sp. Defense": properties.player.team[0].special.value,
		"Speed": properties.player.team[0].speed.value,
		"StatExp HP": properties.player.team[0].statExpHp.value,
		"StatExp Attack": properties.player.team[0].statExpAttack.value,
		"StatExp Def": properties.player.team[0].statExpDefense.value,
		"StatExp Sp. Attack": properties.player.team[0].statExpSpecial.value,
		"StatExp Sp. Defense": properties.player.team[0].statExpSpecial.value,
		"StatExp Speed": properties.player.team[0].statExpSpeed.value,
		"Attack DV": properties.player.team[0].dvAttack.value,
		"Defense DV": properties.player.team[0].dvDefense.value,
		"Speed DV": properties.player.team[0].dvSpeed.value,
		"Special DV": properties.player.team[0].dvSpecial.value,
		"Attack Stage": properties.battle.yourPokemon.modStageAttack.value,
		"Defense Stage": properties.battle.yourPokemon.modStageDefense.value,
		"Sp. Attack Stage": properties.battle.yourPokemon.modStageSpecial.value,
		"Sp. Defense Stage": properties.battle.yourPokemon.modStageSpecial.value,
		"Speed Stage": properties.battle.yourPokemon.modStageSpeed.value,
		"Accuracy Stage": properties.battle.yourPokemon.modStageAccuracy.value,
		"Evasion Stage": properties.battle.yourPokemon.modStageEvasion.value,
		"Battle Attack": properties.battle.yourPokemon.attack.value,
		"Battle Defense": properties.battle.yourPokemon.defense.value,
		"Battle Sp. Attack": properties.battle.yourPokemon.special.value,
		"Battle Sp. Defense": properties.battle.yourPokemon.special.value,
		"Battle Speed": properties.battle.yourPokemon.speed.value,
		"Frame Count": properties.patch.time?.frameCount?.value ?? 0,
		"Overworld Frame Count": properties.patch.time?.oWFrameCount?.value ?? 0,
		"Battle Frame Count": properties.patch.time?.battleFrameCount?.value ?? 0,
		"Menu Frame Count": properties.patch.time?.menuFrameCount?.value ?? 0,
		"Intro Frame Count": properties.patch.time?.introsFrameCount?.value ?? 0,
		"Save Count": properties.patch.saves?.saveCount?.value ?? 0,
		"Reload Count": properties.patch.saves?.reloadCount?.value ?? 0,
		"Clock Reset Count": properties.patch.saves?.clockResetCount?.value ?? 0,
		"Steps Count": properties.patch.steps?.stepsCount.value ?? 0,
		"Steps Count Walk": properties.patch.steps?.stepsCountWalk.value ?? 0,
		"Steps Count Bike": properties.patch.steps?.stepsCountBike.value ?? 0,
		"Steps Count Surf": properties.patch.steps?.stepsCountSurf.value ?? 0,
		"Bonks": properties.patch.steps?.bonks.value ?? 0,
		"Battles": (properties.patch.battles?.trainerBattles.value ?? 0) + (properties.patch.battles?.wildBattles.value ?? 0),
		"Trainer Battles": properties.patch.battles?.trainerBattles.value ?? 0,
		"Wild Battles": properties.patch.battles?.wildBattles.value ?? 0,
		"Battles Fled": properties.patch.battles?.battlesFled.value ?? 0,
		"Failed Runs": properties.patch.battles?.failedRuns.value ?? 0,
		"Total Damage Dealt": properties.patch.battle_info.damage?.totalDamageDealt?.value ?? 0,
		"Actual Damage Dealt": properties.patch.battle_info.damage?.actualDamageDealt?.value ?? 0,
		"Total Damage Taken": properties.patch.battle_info.damage?.totalDamageTaken?.value ?? 0,
		"Actual Damage Taken": properties.patch.battle_info.damage?.actualDamageTaken?.value ?? 0,
		"Own Moves Hit": properties.patch.battle_info.hits?.ownMovesHit?.value ?? 0,
		"Own Moves Missed": properties.patch.battle_info.hits?.ownMovesMissed?.value ?? 0,
		"Enemy Moves Hit": properties.patch.battle_info.hits?.enemyMovesHit?.value ?? 0,
		"Enemy Moves Missed": properties.patch.battle_info.hits?.enemyMovesMissed?.value ?? 0,
		"Own Moves Super Effective": properties.patch.battle_info.hits?.ownMovesSE?.value ?? 0,
		"Own Moves Not Very Effective": properties.patch.battle_info.hits?.ownMovesNVE?.value ?? 0,
		"Enemy Moves Super Effective": properties.patch.battle_info.hits?.enemyMovesSE?.value ?? 0,
		"Enemy Moves Not Very Effective": properties.patch.battle_info.hits?.enemyMovesNVE?.value ?? 0,
		"Criticals Dealt": properties.patch.battle_info.hits?.criticalsDealt?.value ?? 0,
		"OHKOs Dealt": properties.patch.battle_info.hits?.oHKOsDealt?.value ?? 0,
		"Criticals Taken": properties.patch.battle_info.hits?.criticalsTaken?.value ?? 0,
		"OHKOs Taken": properties.patch.battle_info.hits?.oHKOsTaken?.value ?? 0,
		"Was Confused": properties.patch.battle_info.status?.wasConfused?.value ?? 0,
		"Enemy Became Confused": properties.patch.battle_info.status?.enemyBecameConfused?.value ?? 0,
		"Was Paralyzed": properties.patch.battle_info.status?.wasParalyzed?.value ?? 0,
		"Enemy Was Paralyzed": properties.patch.battle_info.status?.enemyWasParalyzed?.value ?? 0,
		"Was Burned": properties.patch.battle_info.status?.wasBurned?.value ?? 0,
		"Enemy Was Burned": properties.patch.battle_info.status?.enemyWasBurned?.value ?? 0,
		"Was Frozen": properties.patch.battle_info.status?.wasFrozen?.value ?? 0,
		"Enemy Was Frozen": properties.patch.battle_info.status?.enemyWasFrozen?.value ?? 0,
		"Was Poisoned": properties.patch.battle_info.status?.wasPoisoned?.value ?? 0,
		"Enemy Was Poisoned": properties.patch.battle_info.status?.enemyWasPoisoned?.value ?? 0,
		"Was Badly Poisoned": properties.patch.battle_info.status?.wasPoisonedBadly?.value ?? 0,
		"Enemy Was Badly Poisoned": properties.patch.battle_info.status?.enemyWasPoisonedBadly?.value ?? 0,
		"Fell Asleep": properties.patch.battle_info.status?.fellAsleep?.value ?? 0,
		"Enemy Fell Asleep": properties.patch.battle_info.status?.enemyFellAsleep?.value ?? 0,
		"Player Turns Confused": properties.patch.battle_info.status?.playerTurnsConfused?.value ?? 0,
		"Player Turns Confused Hit Self": properties.patch.battle_info.status?.playerTurnsConfusedHitSelf?.value ?? 0,
		"Player Turns Paralyzed": properties.patch.battle_info.status?.playerTurnsParalyzed?.value ?? 0,
		"Player Turns Paralyzed Fully": properties.patch.battle_info.status?.playerTurnsParalyzedFully?.value ?? 0,
		"Enemy Turns Confused": properties.patch.battle_info.status?.enemyTurnsConfused?.value ?? 0,
		"Enemy Turns Confused Hit Self": properties.patch.battle_info.status?.enemyTurnsConfusedHitSelf?.value ?? 0,
		"Enemy Turns Paralyzed": properties.patch.battle_info.status?.enemyTurnsParalyzed?.value ?? 0,
		"Enemy Turns Paralyzed Fully": properties.patch.battle_info.status?.enemyTurnsParalyzedFully?.value ?? 0,
		"Player Turns Asleep": properties.patch.battle_info.status.PlayerTurnsAsleep.value ?? 0,
		"Enemy Turns Asleep": properties.patch.battle_info.status.EnemyTurnsAsleep.value ?? 0,
		"Player HP Healed": 0, // not working in yellow; there is no ROM implementation of this
		"Enemy HP Healed": 0, // not working in yellow; there is no ROM implementation of this
		"Player Pokemon Fainted": properties.patch.battle_info?.playerPokemonFainted?.value ?? 0,
		"Enemy Pokemon Fainted": properties.patch.battle_info?.enemyPokemonFainted?.value ?? 0,
		"Experience Gained": properties.patch.battle_info?.experienceGained?.value ?? 0,
		"Switchouts": properties.patch.battle_info?.switchout?.value ?? 0,
		"Money Made": properties.patch.money?.moneyMade?.value ?? 0,
		"Money Spent": properties.patch.money?.moneySpent?.value ?? 0,
		"Money Lost": properties.patch.money?.moneyLost?.value ?? 0,
		"Items Picked Up": properties.patch.items?.itemsPickedUp?.value ?? 0,
		"Items Bought": properties.patch.items?.itemsBought?.value ?? 0,
		"Items Sold": properties.patch.items?.itemsSold?.value ?? 0,
		"Balls Thrown": properties.patch.catching?.ballsThrown?.value ?? 0,
		"Pokemon Caught In Balls": properties.patch.catching?.pokemonCaughtInBalls.value ?? 0,
		"Moves Learnt": properties.patch.movesLearnt.value ?? 0,
		"Blackouts": metrics.blackouts.toString(),
		"Attempt Number": metrics.attempts,
		"Failures": metrics.resets + metrics.blackouts,
		"Rival's Team": properties.rival.finalTeam.value
	};
	const clone = {};
	// cloning the split object in funky way to make sure vue is not tracking any of the values still.
	// If it did, it would work itself to death trying to keep up with some of the items included.
	Object.entries(split).forEach(([key, value]) => clone[key] = structuredClone(toRaw(value)));
	return clone as FullSplit;
}

export function format_trainer_name(game: PokemonGame|null, trainer_class: string, trainer_number: number) {
	if (game == 'Red and Blue') {
		//rivals
		if (trainer_class == "RIVAL1" && trainer_number == 1)  { return "Rival1-Lab" }
		if (trainer_class == "RIVAL1" && trainer_number == 2)  { return "Rival1-Lab" }
		if (trainer_class == "RIVAL1" && trainer_number == 3)  { return "Rival1-Lab" }
		if (trainer_class == "RIVAL1" && trainer_number == 4)  { return "Rival1a-Route 22" }
		if (trainer_class == "RIVAL1" && trainer_number == 5)  { return "Rival1a-Route 22" }
		if (trainer_class == "RIVAL1" && trainer_number == 6)  { return "Rival1a-Route 22" }
		if (trainer_class == "RIVAL1" && trainer_number == 7)  { return "Rival2-Nugget Bridge" }
		if (trainer_class == "RIVAL1" && trainer_number == 8)  { return "Rival2-Nugget Bridge" }
		if (trainer_class == "RIVAL1" && trainer_number == 9)  { return "Rival2-Nugget Bridge" }
		if (trainer_class == "RIVAL2" && trainer_number == 1)  { return "Rival3-SS Anne" }
		if (trainer_class == "RIVAL2" && trainer_number == 2)  { return "Rival3-SS Anne"  }
		if (trainer_class == "RIVAL2" && trainer_number == 3)  { return "Rival3-SS Anne"  }
		if (trainer_class == "RIVAL2" && trainer_number == 4)  { return "Rival4-Pkmn Tower" }
		if (trainer_class == "RIVAL2" && trainer_number == 5)  { return "Rival4-Pkmn Tower" }
		if (trainer_class == "RIVAL2" && trainer_number == 6)  { return "Rival4-Pkmn Tower" }
		if (trainer_class == "RIVAL2" && trainer_number == 7)  { return "Rival5-Silph" }
		if (trainer_class == "RIVAL2" && trainer_number == 8)  { return "Rival5-Silph" }
		if (trainer_class == "RIVAL2" && trainer_number == 9)  { return "Rival5-Silph" }
		if (trainer_class == "RIVAL2" && trainer_number == 10) { return "Rival6-Route 22" }
		if (trainer_class == "RIVAL2" && trainer_number == 11) { return "Rival6-Route 22" }
		if (trainer_class == "RIVAL2" && trainer_number == 12) { return "Rival6-Route 22" }
		if (trainer_class == "RIVAL3" && trainer_number == 1)  { return "Champion" }
		if (trainer_class == "RIVAL3" && trainer_number == 2)  { return "Champion" }
		if (trainer_class == "RIVAL3" && trainer_number == 3)  { return "Champion" }
	}
	if (game == 'Yellow') {
		//rivals
		if (trainer_class == "RIVAL1" && trainer_number == 1)  { return "Rival1-Lab" }
		if (trainer_class == "RIVAL1" && trainer_number == 2)  { return "Rival1a-Route 22" }
		if (trainer_class == "RIVAL1" && trainer_number == 3)  { return "Rival2-Nugget Bridge" }
		if (trainer_class == "RIVAL2" && trainer_number == 1)  { return "Rival3-SS Anne" }
		if (trainer_class == "RIVAL2" && trainer_number == 2)  { return "Rival4-Pkmn Tower" }
		if (trainer_class == "RIVAL2" && trainer_number == 3)  { return "Rival4-Pkmn Tower" }
		if (trainer_class == "RIVAL2" && trainer_number == 4)  { return "Rival4-Pkmn Tower" }
		if (trainer_class == "RIVAL2" && trainer_number == 5)  { return "Rival5-Silph" }
		if (trainer_class == "RIVAL2" && trainer_number == 6)  { return "Rival5-Silph" }
		if (trainer_class == "RIVAL2" && trainer_number == 7)  { return "Rival5-Silph" }
		if (trainer_class == "RIVAL2" && trainer_number == 8)  { return "Rival6-Route 22" }
		if (trainer_class == "RIVAL2" && trainer_number == 9)  { return "Rival6-Route 22" }
		if (trainer_class == "RIVAL2" && trainer_number == 10) { return "Rival6-Route 22" }
		if (trainer_class == "RIVAL3" && trainer_number == 1) { return "Champion" }
		if (trainer_class == "RIVAL3" && trainer_number == 2) { return "Champion" }
		if (trainer_class == "RIVAL3" && trainer_number == 3) { return "Champion" }
	}
	//gym leaders
	if (trainer_class == "BROCK")    { return "Brock" }
	if (trainer_class == "MISTY")    { return "Misty" }
	if (trainer_class == "LT.SURGE") { return "Surge" }
	if (trainer_class == "ERIKA")    { return "Erika" }
	if (trainer_class == "KOGA")     { return "Koga" }
	if (trainer_class == "SARINA")   { return "Sabrina" }
	if (trainer_class == "BLAINE")   { return "Blaine" }
	//giovanni
	if (trainer_class == "GIOVANNI" && trainer_number == 1) { return "Giovanni-Hideout" }
	if (trainer_class == "GIOVANNI" && trainer_number == 2) { return "Giovanni-Silph" }
	if (trainer_class == "GIOVANNI" && trainer_number == 3) { return "Giovanni" }
	//elite4 members
	if (trainer_class == "LORELEI") { return "Lorelei" }
	if (trainer_class == "BRUNO")   { return "Bruno" }
	if (trainer_class == "AGATHA")  { return "Agatha" }
	if (trainer_class == "LANCE")   { return "Lance" }
	//notable npcs
	if (trainer_class == "ROCKET"       && trainer_number == 5)   { return "Cerulean Rocket" }
	if (trainer_class == "YOUNGSTER"    && trainer_number == 1)   { return "Youngster Ben" }
	if (trainer_class == "LASS"         && trainer_number == 10)  { return "Oddish Lass" } 
	if (trainer_class == "JR TRAINER F" && trainer_number == 1)   { return "Pecking Lass" } 
	if (trainer_class == "JR TRAINER F" && trainer_number == 3)   { return "Sandy" } 
	if (trainer_class == "JR TRAINER F" && trainer_number == 5)   { return "Wrapping Lass" } 
	if (trainer_class == "SUPER NERD"   && trainer_number == 2)   { return "Fossil Nerd" }
	if (trainer_class == "POKEMANIAC"   && trainer_number == 7)   { return "Slowbone" }
	if (trainer_class == "JR TRAINER F" && trainer_number == 10)  { return "Status-Condition-Jr-Trainer" }
	if (trainer_class == "HIKER"        && trainer_number == 9)   { return "Selfdestructing Hiker" }
	if (trainer_class == "JR TRAINER F" && trainer_number == 18)  { return "Finisher" }
	if (trainer_class == "ROCKET"       && trainer_number == 38)  { return "Hypno Rocket" }
	if (trainer_class == "CHANNELER"    && trainer_number == 10)  { return "Agatha Jr" }
	return capitalize_words(trainer_class)
}
