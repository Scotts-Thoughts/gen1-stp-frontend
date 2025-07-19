function log_split(timer) {
    const time = this.timer.formatted_time;
    const opponent = this.mapper.properties.battle.trainer.class.value;
    console.log(`Autosplitter - Battle Ended: Split: ${opponent} at ${time[0]}${time[1]} (Gametime: ${this.gametimeSplit})`)
} 
function autosplitter_process() {
    if (this.autosplitter_toggle == true && this.no_attempt == false) {
        d = new Date()
        battle_end = Date.now()
        //values
        let gameTimeH = this.mapper.properties.gameTime?.hours?.value
        let gameTimeM = this.mapper.properties.gameTime?.minutes?.value
        let gameTimeS = this.mapper.properties.gameTime?.seconds?.value
        let gameTimeF = this.mapper.properties.gameTime?.frames?.value

        //data to be collected with the autosplitter
        let date_string = (d.getMonth() + 1) + "-" + d.getDate().toString().padStart(2, "0")
        let time_string = d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0")
        let player_name = this.mapper.properties.player.name.value
        let pokemon = this.starterName
        let trainer_name = this.format_trainer_name(this.mapper.properties.battle.trainer.class.value, this.mapper.properties.battle.trainer.number.value)
        let trainer_id = this.mapper.properties.battle.trainer.number.value
        let location = this.mapper.properties.overworld.map.value
        let total_pokemon = this.mapper.properties.battle.trainer.totalPokemon
        const formattedTime = this.timer.formatted_time;
        let real_time_total = formattedTime[0] + formattedTime[1]
        let real_time_hmmss = formattedTime[0]
        let real_time_file_label = formattedTime[2]
        let resets = this.playerResets.toString()
        let blackouts = this.blackout_counter.toString()
        let failures = this.playerResets + this.blackout_counter
        let level = this.mapper.properties.player.team[0].level.value.toString()
        let game_time = this.gametimeSplit.toString()
        let battle_duration = (battle_end - this.battle_start)/1000 
        let move1 = this.mapper.properties.player.team[0].move1.value
        let move2 = this.mapper.properties.player.team[0].move2.value
        let move3 = this.mapper.properties.player.team[0].move3.value
        let move4 = this.mapper.properties.player.team[0].move4.value
        let move1pp = this.mapper.properties.player.team[0].move1pp.value
        let move2pp = this.mapper.properties.player.team[0].move2pp.value
        let move3pp = this.mapper.properties.player.team[0].move3pp.value
        let move4pp = this.mapper.properties.player.team[0].move4pp.value
        let move1ppUp = this.mapper.properties.player.team[0].move1ppUp.value
        let move2ppUp = this.mapper.properties.player.team[0].move2ppUp.value
        let move3ppUp = this.mapper.properties.player.team[0].move3ppUp.value
        let move4ppUp = this.mapper.properties.player.team[0].move4ppUp.value
        let saves = this.mapper.properties.patch.saves.saveCount.value
        let steps = this.mapper.properties.patch.steps.stepsCount.value
        let bonks = this.mapper.properties.patch.steps.bonks.value
        let trainerBattles = this.mapper.properties.patch.battles.trainerBattles.value
        let wildBattles = this.mapper.properties.patch.battles.wildBattles.value
        let battleTurns = this.mapper.properties.patch.battle_info.turns.battleTurns.value
        let playerTurns = this.mapper.properties.patch.battle_info.turns.playerTurns.value
        let enemyTurns = this.mapper.properties.patch.battle_info.turns.enemyTurns.value
        let itemsInBag = this.mapper.properties.player.itemCount.value
        let money = this.mapper.properties.player.money.value
        let rivalTeam = this.mapper.properties.rival.finalTeam.value
        let statusCondition = this.mapper.properties.player.team[0].statusCondition.value
        let type1 = this.mapper.properties.player.team[0].type1.value
        let type2 = this.mapper.properties.player.team[0].type2.value
        let experience = this.mapper.properties.player.team[0].expPoints.value
        //deprecated properties (these are used by all of my legacy software)

        let incremented_finished_run_count = this.finished_run_count + 1
        let runIdentifier = this.starterName.toString() + " " + incremented_finished_run_count.toString()
        let trainerName = this.deprecated_autosplitter[this.mapper.properties.meta.gameName.value][`${this.mapper.properties.battle.trainer.class}_${this.mapper.properties.battle.trainer.number}`]
        const time = this.timer.getTime();
        let RTHours = time.hours;
        let RTMinutes = time.minutes;
        let RTSeconds = time.seconds;
        let RTMilliseconds = time.ms;
        let startTime = this.time_split_start
        let realTime = this.padTime(time.hours) + ":" + this.padTime(time.minutes) + ":" + this.padTime(time.seconds) + "." + this.padTime(time.ms)
        let gameTime = this.padTime(gameTimeH) + ":" + this.padTime(gameTimeM) + ":" + this.padTime(gameTimeS) + "." + this.padTime(gameTimeF)
        let hp = this.mapper.properties.player.team[0].hp.value
        let maxHp = this.mapper.properties.player.team[0].maxHp.value
        let atk = this.mapper.properties.player.team[0].attack.value
        let def = this.mapper.properties.player.team[0].defense.value
        let spA = this.mapper.properties.player.team[0].special.value
        let spD = this.mapper.properties.player.team[0].special.value
        let spe = this.mapper.properties.player.team[0].speed.value
        let statExp_hp = this.mapper.properties.player.team[0].statExpHp.value
        let statExp_atk = this.mapper.properties.player.team[0].statExpAttack.value
        let statExp_def = this.mapper.properties.player.team[0].statExpDefense.value
        let statExp_spA = this.mapper.properties.player.team[0].statExpSpecial.value
        let statExp_spD = this.mapper.properties.player.team[0].statExpSpecial.value
        let statExp_spe = this.mapper.properties.player.team[0].statExpSpeed.value
        let dvAttack = this.mapper.properties.player.team[0].dvAttack.value
        let dvDefense = this.mapper.properties.player.team[0].dvDefense.value
        let dvSpeed = this.mapper.properties.player.team[0].dvSpeed.value
        let dvSpecial = this.mapper.properties.player.team[0].dvSpecial.value
        let mod_atk = this.mapper.properties.battle.yourPokemon.modStageAttack.value
        let mod_def = this.mapper.properties.battle.yourPokemon.modStageDefense.value
        let mod_spA = this.mapper.properties.battle.yourPokemon.modStageSpecial.value
        let mod_spD = this.mapper.properties.battle.yourPokemon.modStageSpecial.value
        let mod_spe = this.mapper.properties.battle.yourPokemon.modStageSpeed.value
        let mod_acc = this.mapper.properties.battle.yourPokemon.modStageAccuracy.value
        let mod_eva = this.mapper.properties.battle.yourPokemon.modStageEvasion.value
        let battle_atk = this.mapper.properties.battle.yourPokemon.attack.value
        let battle_def = this.mapper.properties.battle.yourPokemon.defense.value
        let battle_spA = this.mapper.properties.battle.yourPokemon.special.value
        let battle_spD = this.mapper.properties.battle.yourPokemon.special.value
        let battle_spe = this.mapper.properties.battle.yourPokemon.speed.value
        //patch properties (these are going to be used by new software in the future; ROM patch required)
        let patch_frameCount = this.mapper.properties.patch.time?.frameCount?.value ?? 0
        let patch_oWFrameCount = this.mapper.properties.patch.time?.oWFrameCount?.value ?? 0
        let patch_battleFrameCount = this.mapper.properties.patch.time?.battleFrameCount?.value ?? 0
        let patch_menuFrameCount = this.mapper.properties.patch.time?.menuFrameCount?.value ?? 0
        let patch_introsFrameCount = this.mapper.properties.patch.time?.introsFrameCount?.value ?? 0
        let patch_saveCount = this.mapper.properties.patch.saves?.saveCount?.value ?? 0
        let patch_reloadCount = this.mapper.properties.patch.saves?.reloadCount?.value ?? 0
        let patch_clockResetCount = this.mapper.properties.patch.saves?.clockResetCount?.value ?? 0
        let patch_stepsCount = this.mapper.properties.patch.steps?.stepsCount.value ?? 0
        let patch_stepsCountWalk = this.mapper.properties.patch.steps?.stepsCountWalk.value ?? 0
        let patch_stepsCountBike = this.mapper.properties.patch.steps?.stepsCountBike.value ?? 0
        let patch_stepsCountSurf = this.mapper.properties.patch.steps?.stepsCountSurf.value ?? 0
        let patch_bonks = this.mapper.properties.patch.steps?.bonks.value ?? 0
        let patch_battles = this.mapper.properties.patch.battles?.trainerBattles.value + this.mapper.properties.patch.battles?.wildBattles.value ?? 0
        let patch_trainerBattles = this.mapper.properties.patch.battles?.trainerBattles.value ?? 0
        let patch_wildBattles = this.mapper.properties.patch.battles?.wildBattles.value ?? 0
        let patch_battlesFled = this.mapper.properties.patch.battles?.battlesFled.value ?? 0
        let patch_failedRuns = this.mapper.properties.patch.battles?.failedRuns.value ?? 0
        let patch_totalDamageDealt = this.mapper.properties.patch.battle_info.damage?.totalDamageDealt?.value ?? 0
        let patch_actualDamageDealt = this.mapper.properties.patch.battle_info.damage?.actualDamageDealt?.value ?? 0
        let patch_totalDamageTaken = this.mapper.properties.patch.battle_info.damage?.totalDamageTaken?.value ?? 0
        let patch_actualDamageTaken = this.mapper.properties.patch.battle_info.damage?.actualDamageTaken?.value ?? 0
        let patch_ownMovesHit = this.mapper.properties.patch.battle_info.hits?.ownMovesHit?.value ?? 0
        let patch_ownMovesMissed = this.mapper.properties.patch.battle_info.hits?.ownMovesMissed?.value ?? 0
        let patch_enemyMovesHit = this.mapper.properties.patch.battle_info.hits?.enemyMovesHit?.value ?? 0
        let patch_enemyMovesMissed = this.mapper.properties.patch.battle_info.hits?.enemyMovesMissed?.value ?? 0
        let patch_ownMovesSE = this.mapper.properties.patch.battle_info.hits?.ownMovesSE?.value ?? 0
        let patch_ownMovesNVE = this.mapper.properties.patch.battle_info.hits?.ownMovesNVE?.value ?? 0
        let patch_enemyMovesSE = this.mapper.properties.patch.battle_info.hits?.enemyMovesSE?.value ?? 0
        let patch_enemyMovesNVE = this.mapper.properties.patch.battle_info.hits?.enemyMovesNVE?.value ?? 0
        let patch_criticalsDealt = this.mapper.properties.patch.battle_info.hits?.criticalsDealt?.value ?? 0
        let patch_oHKOsDealt = this.mapper.properties.patch.battle_info.hits?.oHKOsDealt?.value ?? 0
        let patch_criticalsTaken = this.mapper.properties.patch.battle_info.hits?.criticalsTaken?.value ?? 0
        let patch_oHKOsTaken = this.mapper.properties.patch.battle_info.hits?.oHKOsTaken?.value ?? 0
        let patch_wasConfused = this.mapper.properties.patch.battle_info.status?.wasConfused?.value ?? 0
        let patch_enemyBecameConfused = this.mapper.properties.patch.battle_info.status?.enemyBecameConfused?.value ?? 0
        let patch_wasParalyzed = this.mapper.properties.patch.battle_info.status?.wasParalyzed?.value ?? 0
        let patch_enemyWasParalyzed = this.mapper.properties.patch.battle_info.status?.enemyWasParalyzed?.value ?? 0
        let patch_wasBurned = this.mapper.properties.patch.battle_info.status?.wasBurned?.value ?? 0
        let patch_enemyWasBurned = this.mapper.properties.patch.battle_info.status?.enemyWasBurned?.value ?? 0
        let patch_wasFrozen = this.mapper.properties.patch.battle_info.status?.wasFrozen?.value ?? 0
        let patch_enemyWasFrozen = this.mapper.properties.patch.battle_info.status?.enemyWasFrozen?.value ?? 0
        let patch_wasPoisoned = this.mapper.properties.patch.battle_info.status?.wasPoisoned?.value ?? 0
        let patch_enemyWasPoisoned = this.mapper.properties.patch.battle_info.status?.enemyWasPoisoned?.value ?? 0
        let patch_wasPoisonedBadly = this.mapper.properties.patch.battle_info.status?.wasPoisonedBadly?.value ?? 0
        let patch_enemyWasPoisonedBadly = this.mapper.properties.patch.battle_info.status?.enemyWasPoisonedBadly?.value ?? 0
        let patch_fellAsleep = this.mapper.properties.patch.battle_info.status?.fellAsleep?.value ?? 0
        let patch_enemyFellAsleep = this.mapper.properties.patch.battle_info.status?.enemyFellAsleep?.value ?? 0
        let patch_playerTurnsConfused = this.mapper.properties.patch.battle_info.status?.playerTurnsConfused?.value ?? 0
        let patch_enemyTurnsConfused = this.mapper.properties.patch.battle_info.status?.enemyTurnsConfused?.value ?? 0
        let patch_playerTurnsConfusedHitSelf = this.mapper.properties.patch.battle_info.status?.playerTurnsConfusedHitSelf?.value ?? 0
        let patch_enemyTurnsConfusedHitSelf = this.mapper.properties.patch.battle_info.status?.enemyTurnsConfusedHitSelf?.value ?? 0
        let patch_playerTurnsParalyzed = this.mapper.properties.patch.battle_info.status?.playerTurnsParalyzed?.value ?? 0
        let patch_enemyTurnsParalyzed = this.mapper.properties.patch.battle_info.status?.enemyTurnsParalyzed?.value ?? 0
        let patch_playerTurnsParalyzedFully = this.mapper.properties.patch.battle_info.status?.playerTurnsParalyzedFully?.value ?? 0
        let patch_enemyTurnsParalyzedFully = this.mapper.properties.patch.battle_info.status?.enemyTurnsParalyzedFully?.value ?? 0
        let patch_PlayerTurnsAsleep = this.mapper.properties.patch.battle_info.status.PlayerTurnsAsleep.value ?? 0
        let patch_EnemyTurnsAsleep = this.mapper.properties.patch.battle_info.status.EnemyTurnsAsleep.value ?? 0
        let patch_playerHpHealed = 0 //not working in yellow; there is no ROM implementation of this
        let patch_enemyHpHealed = 0 //not working in yellow; there is no ROM implementation of this
        let patch_playerPokemonFainted = this.mapper.properties.patch.battle_info?.playerPokemonFainted?.value ?? 0
        let patch_enemyPokemonFainted = this.mapper.properties.patch.battle_info?.enemyPokemonFainted?.value ?? 0
        let patch_experienceGained = this.mapper.properties.patch.battle_info?.experienceGained?.value ?? 0
        let patch_switchout = this.mapper.properties.patch.battle_info?.switchout?.value ?? 0
        let patch_moneyMade = this.mapper.properties.patch.money?.moneyMade?.value ?? 0
        let patch_moneySpent = this.mapper.properties.patch.money?.moneySpent?.value ?? 0
        let patch_moneyLost = this.mapper.properties.patch.money?.moneyLost?.value ?? 0
        let patch_itemsPickedUp = this.mapper.properties.patch.items?.itemsPickedUp?.value ?? 0
        let patch_itemsBought = this.mapper.properties.patch.items?.itemsBought?.value ?? 0
        let patch_itemsSold = this.mapper.properties.patch.items?.itemsSold?.value ?? 0
        let patch_ballsThrown = this.mapper.properties.patch.catching?.ballsThrown?.value ?? 0
        let patch_pokemonCaughtInBalls = this.mapper.properties.patch.catching?.pokemonCaughtInBalls ?? 0
        let patch_movesLearnt = this.mapper.properties.patch.movesLearnt ?? 0

        //definitions for what split data is logged to file
        let simple_data = [
            player_name, pokemon, trainer_name, real_time_hmmss, 
            resets, blackouts, level, game_time, battle_duration, 
            move1, move2, move3, move4
        ]
        let full_data = [
            date_string, time_string, player_name, pokemon, trainer_name, 
            trainer_id, location, total_pokemon, real_time_total, 
            real_time_hmmss, real_time_file_label, resets, blackouts, failures, 
            level, game_time, battle_duration, move1, move2, move3, move4, 
            saves, steps, bonks, trainerBattles, wildBattles, battleTurns, 
            playerTurns, enemyTurns, itemsInBag, money, rivalTeam,
            statusCondition, type1, type2, experience,
            runIdentifier, this.starterName, trainerName,
            startTime, realTime, gameTime, level, this.playerResets,
            RTHours, RTMinutes, RTSeconds, RTMilliseconds,
            move1, move2, move3, move4, move1pp, move2pp, move3pp, move4pp, move1ppUp, move2ppUp, move3ppUp, move4ppUp,
            hp, maxHp, atk, def, spA, spD, spe,
            statExp_hp, statExp_atk, statExp_def, statExp_spA, statExp_spD, statExp_spe,
            dvAttack, dvDefense, dvSpeed, dvSpecial,
            mod_atk, mod_def, mod_spA, mod_spD, mod_spe, mod_acc, mod_eva,
            battle_atk, battle_def, battle_spA, battle_spD, battle_spe,
            patch_frameCount, patch_oWFrameCount, patch_battleFrameCount, patch_menuFrameCount, patch_introsFrameCount,
            patch_saveCount, patch_reloadCount, patch_clockResetCount,
            patch_stepsCount, patch_stepsCountWalk, patch_stepsCountBike, patch_stepsCountSurf, patch_bonks,
            patch_battles, patch_trainerBattles, patch_wildBattles, patch_battlesFled, patch_failedRuns,
            patch_totalDamageDealt, patch_actualDamageDealt, patch_totalDamageTaken, patch_actualDamageTaken,
            patch_ownMovesHit, patch_ownMovesMissed, patch_enemyMovesHit, patch_enemyMovesMissed, 
            patch_ownMovesSE, patch_ownMovesNVE, patch_enemyMovesSE, patch_enemyMovesNVE, 
            patch_criticalsDealt, patch_oHKOsDealt, patch_criticalsTaken, patch_oHKOsTaken,
            patch_wasConfused, patch_enemyBecameConfused, patch_wasParalyzed, patch_enemyWasParalyzed, 
            patch_wasBurned, patch_enemyWasBurned, patch_wasFrozen, patch_enemyWasFrozen,
            patch_wasPoisoned, patch_enemyWasPoisoned, patch_wasPoisonedBadly, patch_enemyWasPoisonedBadly,
            patch_fellAsleep, patch_enemyFellAsleep, patch_playerTurnsConfused, patch_playerTurnsConfusedHitSelf, 
            patch_playerTurnsParalyzed, patch_playerTurnsParalyzedFully, patch_enemyTurnsConfused, patch_enemyTurnsConfusedHitSelf, 
            patch_enemyTurnsParalyzed, patch_enemyTurnsParalyzedFully, patch_PlayerTurnsAsleep, patch_EnemyTurnsAsleep,
            patch_playerHpHealed, patch_enemyHpHealed, 
            patch_playerPokemonFainted, patch_enemyPokemonFainted, patch_experienceGained, patch_switchout,
            patch_moneyMade, patch_moneySpent, patch_moneyLost,
            patch_itemsPickedUp, patch_itemsBought, patch_itemsSold,
            patch_ballsThrown, patch_pokemonCaughtInBalls,
            patch_movesLearnt,
            //new properties
            blackouts, this.attempt_number, failures, rivalTeam
        ]
        let deprecated_data = [
            runIdentifier, this.starterName, trainerName,
            startTime, realTime, gameTime, level, this.playerResets,
            RTHours, RTMinutes, RTSeconds, RTMilliseconds,
            move1, move2, move3, move4,
            atk, def, spA, spD, spe,
            mod_atk, mod_def, mod_spA, mod_spD, mod_spe, mod_acc, mod_eva,
            battle_atk, battle_def, battle_spA, battle_spD, battle_spe,
            patch_frameCount, patch_oWFrameCount, patch_battleFrameCount, patch_menuFrameCount, patch_introsFrameCount,
            patch_saveCount, patch_reloadCount, patch_clockResetCount,
            patch_stepsCount, patch_stepsCountWalk, patch_stepsCountBike, patch_stepsCountSurf, patch_bonks,
            patch_battles, patch_trainerBattles, patch_wildBattles, patch_battlesFled, patch_failedRuns,
            patch_totalDamageDealt, patch_actualDamageDealt, patch_totalDamageTaken, patch_actualDamageTaken,
            patch_ownMovesHit, patch_ownMovesMissed, patch_enemyMovesHit, patch_enemyMovesMissed, 
            patch_ownMovesSE, patch_ownMovesNVE, patch_enemyMovesSE, patch_enemyMovesNVE, 
            patch_criticalsDealt, patch_oHKOsDealt, patch_criticalsTaken, patch_oHKOsTaken,
            patch_wasConfused, patch_enemyBecameConfused, patch_wasParalyzed, patch_enemyWasParalyzed, 
            patch_wasBurned, patch_enemyWasBurned, patch_wasFrozen, patch_enemyWasFrozen,
            patch_wasPoisoned, patch_enemyWasPoisoned, patch_wasPoisonedBadly, patch_enemyWasPoisonedBadly,
            patch_fellAsleep, patch_enemyFellAsleep, patch_playerTurnsConfused, patch_playerTurnsConfusedHitSelf, 
            patch_playerTurnsParalyzed, patch_playerTurnsParalyzedFully, patch_enemyTurnsConfused, patch_enemyTurnsConfusedHitSelf, 
            patch_enemyTurnsParalyzed, patch_enemyTurnsParalyzedFully,
            patch_playerHpHealed, patch_enemyHpHealed, 
            patch_playerPokemonFainted, patch_enemyPokemonFainted, patch_experienceGained, patch_switchout,
            patch_moneyMade, patch_moneySpent, patch_moneyLost,
            patch_itemsPickedUp, patch_itemsBought, patch_itemsSold,
            patch_ballsThrown, patch_pokemonCaughtInBalls,
            patch_movesLearnt,
            //new properties
            blackouts, this.attempt_number, failures, rivalTeam
        ]
        
        let simple_data_str = simple_data.join(",") + "\n";
        let full_data_str = full_data.join(",") + "\n";
        let deprecated_data_str = deprecated_data.join(",") + "\n";
        this.simple_data_str = simple_data_str // assign within Data so it can be recalled on future loops
        this.full_data_str = full_data_str // assign within Data so it can be recalled on future loops
        this.deprecated_data_str = deprecated_data_str // assign within Data so it can be recalled on future loops
        this.simple_data = simple_data // assign within Data so it can be recalled on future loops
        if (this.collect_split_data == true && (this.mapper.properties.meta.state.value == "Battle" || this.mapper.properties.meta.state.value == "From Battle")) {
            this.current_splits.push({
                trainer: trainer_name, 
                time:    real_time_hmmss,
            })
        }
    }
}
function format_trainer_name(trainer_class, trainer_number) {
    const game = this.mapper.properties.meta.gameName.value
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
    if (trainer_class == "ROCKET"       && this.mapper.properties.battle.trainer.number == 5)   { return "Cerulean Rocket" }
    if (trainer_class == "YOUNGSTER"    && this.mapper.properties.battle.trainer.number == 1)   { return "Youngster Ben" }
    if (trainer_class == "LASS"         && this.mapper.properties.battle.trainer.number == 10)  { return "Oddish Lass" } 
    if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 1)   { return "Pecking Lass" } 
    if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 3)   { return "Sandy" } 
    if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 5)   { return "Wrapping Lass" } 
    if (trainer_class == "SUPER NERD"   && this.mapper.properties.battle.trainer.number == 2)   { return "Fossil Nerd" }
    if (trainer_class == "POKEMANIAC"   && this.mapper.properties.battle.trainer.number == 7)   { return "Slowbone" }
    if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 10)  { return "Status-Condition-Jr-Trainer" }
    if (trainer_class == "HIKER"        && this.mapper.properties.battle.trainer.number == 9)   { return "Selfdestructing Hiker" }
    if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 18)  { return "Finisher" }
    if (trainer_class == "ROCKET"       && this.mapper.properties.battle.trainer.number == 38)  { return "Hypno Rocket" }
    if (trainer_class == "CHANNELER"    && this.mapper.properties.battle.trainer.number == 10)  { return "Agatha Jr" }
    else return this.capitalization_format(trainer_class)
}
function logData(gameName, gameName_Path, str, file_name, starterName, log_type, testStatus, refilming_mode, refilmed_attempt, refilmed_finish) {
    const dirPath = refilming_mode ? `./splits/${gameName_Path}/${starterName}/refilmed/attempts/` : `./splits/${gameName_Path}/${starterName}/attempts/`;
    const testStatusText = testStatus ? "test_run_" : "";
    let attempt_number = refilming_mode ? refilmed_attempt : file_name;
    let filePath = path.join(dirPath, `${gameName}-${testStatusText}${starterName}-${attempt_number}-simple.csv`);
    let header = "player_name,pokemon,trainer_name,real_time_hmmss,resets,blackouts,failures,level,game_time,battle_duration,move1,move2,move3,move4\n";
    if (log_type == "Simple") {
        header = "player_name,pokemon,trainer_name,real_time_hmmss,resets,blackouts,level,game_time," +
        "battle_duration,move1,move2,move3,move4\n";
    }
    else if (log_type == "Full") {
        filePath = path.join(dirPath, `${gameName}-${testStatusText}${starterName}-${attempt_number}-full.csv`);
        header = "date_string,time_string,player_name,pokemon,trainer_name,trainer_id,location,total_pokemon," +
            "real_time_total,real_time_hmmss,real_time_file_label,resets,blackouts,failures,level,game_time,battle_duration," + 
            "move1,move2,move3,move4,move1pp,move2pp,move3pp,move4pp,move1ppUp,move2ppUp,move3ppUp,move4ppUp," +
            "saves,steps,bonks,trainerBattles,wildBattles,battleTurns,playerTurns,enemyTurns," +
            "itemsInBag,money,rivalTeam," +
            "statusCondition,type1,type2,experience," +
            "ROM,Species,Trainer,Start Time,Real Time,Game Time,Level,Resets," +
            "RTHours,RTMinutes,RTSeconds,RTMilliseconds,Move 1,Move 2,Move 3,Move 4," +
            "Hp,Max HP,Attack,Defense,Sp. Attack,Sp. Defense,Speed,Attack DV,Defense DV,Speed DV,Special DV," +
            "StatExp HP,StatExp Attack,StatExp Def,StatExp Sp. Attack,StatExp Sp. Defense,StatExp Speed," +
            "Attack Stage,Defense Stage,Sp. Attack Stage,Sp. Defense Stage,Speed Stage,Accuracy Stage,Evasion Stage," +
            "Battle Attack,Battle Defense,Battle Sp. Attack,Battle Sp. Defense,Battle Speed," +
            "Frame Count,Overworld Frame Count,Battle Frame Count,Menu Frame Count,Intro Frame Count," +
            "Save Count,Reload Count,Clock Reset Count,Steps Count,Steps Count Walk,Steps Count Bike,Steps Count Surf,Bonks," + 
            "Battles,Trainer Battles,Wild Battles,Battles Fled,Failed Runs," +
            "Total Damage Dealt,Actual Damage Dealt,Total Damage Taken,Actual Damage Taken," +
            "Own Moves Hit,Own Moves Missed,Enemy Moves Hit,Enemy Moves Missed," +
            "Own Moves Super Effective,Own Moves Not Very Effective,Enemy Moves Super Effective,Enemy Moves Not Very Effective," +
            "Criticals Dealt,OHKOs Dealt,Criticals Taken,OHKOs Taken," +
            "Was Confused,Enemy Became Confused,Was Paralyzed,Enemy Was Paralyzed,Was Burned,Enemy Was Burned," +
            "Was Frozen,Enemy Was Frozen,Was Poisoned,Enemy Was Poisoned,Was Badly Poisoned,Enemy Was Badly Poisoned," +
            "Fell Asleep,Enemy Fell Asleep,Player Turns Confused,Player Turns Confused Hit Self,Player Turns Paralyzed," +
            "Player Turns Paralyzed Fully,Enemy Turns Confused,Enemy Turns Confused Hit Self,Enemy Turns Paralyzed," +
            "Enemy Turns Paralyzed Fully, Player Turns Asleep, Enemy Turns Asleep,Player HP Healed,Enemy HP Healed," +
            "Player Pokemon Fainted,Enemy Pokemon Fainted," +
            "Experience Gained,Switchouts," +
            "Money Made,Money Spent,Money Lost," +
            "Items Picked Up,Items Bought,Items Sold," +
            "Balls Thrown,Pokemon Caught In Balls,Moves Learnt," +
            "Blackouts,Attempt Number,Failures, Rival's Team\n";
    }
    else if (log_type == "Deprecated") {
        filePath = path.join(dirPath, `${gameName}-${testStatusText}${starterName}-${attempt_number}.csv`);
        header = "ROM,Species,Trainer,Start Time,Real Time,Game Time,Level,Resets," +
            "RTHours,RTMinutes,RTSeconds,RTMilliseconds,Move 1,Move 2,Move 3,Move 4," +
            "Attack,Defense,Sp. Attack,Sp. Defense,Speed," +
            "Attack Stage,Defense Stage,Sp. Attack Stage,Sp. Defense Stage,Speed Stage,Accuracy Stage,Evasion Stage," +
            "Battle Attack,Battle Defense,Battle Sp. Attack,Battle Sp. Defense,Battle Speed," +
            "Frame Count,Overworld Frame Count,Battle Frame Count,Menu Frame Count,Intro Frame Count," +
            "Save Count,Reload Count,Clock Reset Count,Steps Count,Steps Count Walk,Steps Count Bike,Steps Count Surf,Bonks," + 
            "Battles,Trainer Battles,Wild Battles,Battles Fled,Failed Runs," +
            "Total Damage Dealt,Actual Damage Dealt,Total Damage Taken,Actual Damage Taken," +
            "Own Moves Hit,Own Moves Missed,Enemy Moves Hit,Enemy Moves Missed," +
            "Own Moves Super Effective,Own Moves Not Very Effective,Enemy Moves Super Effective,Enemy Moves Not Very Effective," +
            "Criticals Dealt,OHKOs Dealt,Criticals Taken,OHKOs Taken," +
            "Was Confused,Enemy Became Confused,Was Paralyzed,Enemy Was Paralyzed,Was Burned,Enemy Was Burned," +
            "Was Frozen,Enemy Was Frozen,Was Poisoned,Enemy Was Poisoned,Was Badly Poisoned,Enemy Was Badly Poisoned," +
            "Fell Asleep,Enemy Fell Asleep,Player Turns Confused,Player Turns Confused Hit Self,Player Turns Paralyzed," +
            "Player Turns Paralyzed Fully,Enemy Turns Confused,Enemy Turns Confused Hit Self,Enemy Turns Paralyzed," +
            "Enemy Turns Paralyzed Fully,Player HP Healed,Enemy HP Healed," +
            "Player Pokemon Fainted,Enemy Pokemon Fainted," +
            "Experience Gained,Switchouts," +
            "Money Made,Money Spent,Money Lost," +
            "Items Picked Up,Items Bought,Items Sold," +
            "Balls Thrown,Pokemon Caught In Balls,Moves Learnt," +
            //new properties
            "Blackouts,Attempt Number,Failures, Rival's Team\n"
    }
    else if (log_type == "Battle Summary") {
        filePath = path.join(dirPath, `${gameName}-${testStatusText}${starterName}-${attempt_number}-battleSummary.csv`);
        header = "Unknown"
    }
    fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (!fs.existsSync(filePath)) {
            fs.writeFile(filePath, header, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    fs.appendFile(filePath, str, (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                }
            });
        } else {
            fs.appendFile(filePath, str, (err) => {
                if (err) {
                    console.error(err);
                }
            });   
        }
    });
}
function logCopy(gameName, gameName_Path, file_name, starterName, finished_run_count, refilming_mode, refilmed_attempt, refilmed_finish) {
    var dirPathAttempts = refilming_mode ? `./splits/${gameName_Path}/${starterName}/refilmed/attempts/` : `./splits/${gameName_Path}/${starterName}/attempts/`
    var dirPathFinishes = refilming_mode ? `./splits/${gameName_Path}/${starterName}/refilmed/finishes/` : `./splits/${gameName_Path}/${starterName}/finishes/`
    let attempt_number = refilming_mode ? refilmed_attempt : file_name;
    let finish_number = refilming_mode ? refilmed_attempt : finished_run_count;
    console.log("LogCopy Variables", gameName, gameName_Path, file_name, starterName, finished_run_count, dirPathAttempts, dirPathFinishes, attempt_number, finish_number)
    fs.mkdir(dirPathFinishes, { recursive: true }, (err) => {
        fs.copyFile(
            path.join(dirPathAttempts, `${gameName}-${starterName}-${attempt_number}-simple.csv`), 
            path.join(dirPathFinishes, `${gameName}-${starterName}-${finish_number}-simple.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.copyFile(
            path.join(dirPathAttempts, `${gameName}-${starterName}-${attempt_number}-full.csv`), 
            path.join(dirPathFinishes, `${gameName}-${starterName}-${finish_number}-full.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.copyFile(
            path.join(dirPathAttempts, `${gameName}-${starterName}-${attempt_number}.csv`), 
            path.join(dirPathFinishes, `${gameName}-${starterName}-${finish_number}.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
}