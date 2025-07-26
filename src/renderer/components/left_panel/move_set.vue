<template>
    <div>
        <div class="movesetLabel labelMoves">moves</div>
        <div class="movesetLabel labelPwr">pwr.</div>
        <div class="movesetLabel labelAcc">acc.</div>
        <div class="movesetLabel labelPP">pp</div>
        <div class="movesetContainer">
            <div v-for="move in pkmnMoves" v-if="meta.gameState != 'No Pokemon'">
                <div v-if="game_properties.player.team[0].level.value > 0 && game_properties.player.team[0][move].value != null">
                    <img :class="'movesetStyling iconStyling ' + move + 'icon'" :src="moveTypeIcon(get_backport_move(move))" />
                    <div v-show="game_properties.player.team[0][move].value != null" :class="'movesetStyling moveStyling ' + move">
                        {{ move_name(capitalize_words(get_backport_move(move))) }}
                    </div>
                    <div v-show="game_properties.player.team[0][move].value != null"
                        :class="'movesetStyling powerStyling ' + move"
                        :key="type_effectiveness(dynamic_mon, move, game_properties.battle.enemyPokemon)"
                    >
                        {{ type_effectiveness(dynamic_mon, move, game_properties.battle.enemyPokemon) || "-" }}
                    </div>
                    <div v-show="game_properties.player.team[0][move].value != null" :class="'movesetStyling accuracyStyling ' + move">
                        {{ moveAccuracyEvasionDynamic(get_backport_move(move)) || "-" }}
                        <span style="font-size: 20px;">%</span>
                    </div>
                    <div v-show="game_properties.player.team[0][move].value != null" :class="'movesetStyling ppStyling ' + move">
                        {{ game_properties.player.team[0][move + "pp"] }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { GameState, useMetaStore } from "~/stores/metaStore.ts";
import { stageModifiersData } from "~/data/stage-modifiers.ts";
import typeEffectiveness from "~/data/type-effectiveness.ts";
import PokeData from "~/logic/PokeData.ts";
import { capitalize_words, move_name } from "../../methods/text_functions";
import { defineComponent, inject } from "vue";
import { GameHookProperty } from "~/packages/gameHookMapperClient";

export default defineComponent({
    data() {
        return {
            /** Provided by the `frontend` component. */
            game_properties: inject<Record<string, GameHookProperty>>("game_properties", {}),
            meta: useMetaStore(),
            typeCalcs: true, // Calculates effective power based on the pokemon in battle, if false returns the move's base power with no modifications
            showCritMultiplierInEP: true, // Shows crit multiplier in the effective power if the Pokemon will always score a critical hit with the given move
            pkmnMoves: ["move1", "move2", "move3", "move4"],
        }
    },
    computed: {
        dynamic_mon() {
            var species = ""
            if (this.meta.gameState == 'Battle') {
                const battle_data = this.game_properties?.battle?.yourPokemon
                species = battle_data.species.value
                if (species == null || species == undefined) {
                    species = this.meta.starter
                }
                if (this.game_properties.player.team[0].species.value == "Backport") {
                    species = this.meta.starter
                }
                return {
                    ...battle_data,
                    species: { value: species }
                }
            }
            else if (this.meta.gameState == 'No Pokemon' || this.game_properties?.player?.team[0].species.value == null) {
                const pokedex_data = PokeData.getSpecies(this.meta.starter);
                if (this.game_properties.player.team[0]?.species.value == "Backport") {
                    species = this.meta.starter
                }
                return {
                    ...pokedex_data,
                    species: { value: pokedex_data.species },
                }
            }
            else {
                const party_data = this.game_properties?.player?.team[0]
                species = party_data.species.value
                if (species == null || species == undefined) {
                    species = this.meta.starter
                }
                if (this.game_properties.player.team[0].species.value == "Backport") {
                    species = this.meta.starter
                }
                return {
                    ...party_data,
                    species: { value: species }
                }
            }
        },
    },
    methods: {
        capitalize_words,
        move_name,
        moveTypeIcon(move_name_string) {
            if (move_name_string != null && move_name_string != undefined) {
                var moveName = this.move_name(move_name_string)
                var move = PokeData.getMove(moveName);
                var moveType = move.type.toLowerCase()
                return `images/elements/type-icons/${moveType}.png`
            }
            return ""
        },
        get_backport_move_name(move_name, starter, byte_value) {
            if (move_name == 'STRUGGLE' || move_name == null) {
                switch (starter) {
                    case "Scream Tail": {
                        switch (byte_value) {
                            case (165): return 'Play Rough'
                            case (166): return 'Struggle'
                        }
                    }
                    case "Testmoth": {
                        switch (byte_value) {
                            case (165): return 'Moth-Beam'
                            case (166): return 'Moth-Bolt'
                            case (167): return 'Moth-Flame'
                            case (168): return 'Moth-Blast'
                            case (169): return 'Struggle'
                        }
                    }
                    default: return move_name
                }
            }
            return move_name
        },
        get_backport_move(slot) {
            if (!this.dynamic_mon[slot]) {
                return null;
            }
            const move = this.dynamic_mon[slot].value;
            const byte = this.dynamic_mon[slot].bytes[0];
            const return_value = this.get_backport_move_name(move, this.meta.starter, byte);
            return return_value
        },

        type_effectiveness(pkmnData, moveNumber, enemyData) { //pkmnData = team[0] etc
            if (!pkmnData[moveNumber]) {
                return "";
            }
            if (this.typeCalcs == true) {
                const move_name = this.get_backport_move_name(
                    pkmnData[moveNumber].value,
                    this.meta.starter,
                    pkmnData[moveNumber].bytes
                )

                if (move_name == null) { return "" } //stop the function if there is no move in that slot
                if (move_name == 'Doom Desire') { return 120 }

                var move_type = PokeData.getMove(move_name).type
                var move_info = typeEffectiveness.find(x => x.moveType === move_type)
                var move_power = this.movePower(move_name)
                var move_category = PokeData.getMove(move_name).category
                var attacker_type1 = pkmnData.type1.value
                var attacker_type2 = pkmnData.type2.value
                var defender_type1 = enemyData.type1.value
                var defender_type2 = enemyData.type2.value
                var multiplier_stab = 1
                var multiplier_type1 = move_info ? move_info[defender_type1] : 1
                var multiplier_type2 = 1
                var multiplier_type3 = 1
                var screen_reflect = 1
                var screen_lightscreen = 1

                //Pumpkaboo TrickOrTreat
                if (this.meta.starter == 'Pumpkaboo' && move_type == 'Ghost' && this.game_properties.patch.backport.prop_2.value == 8) {
                    multiplier_type3 = 2
                }

                //update variables
                if (move_type == attacker_type1 || move_type == attacker_type2) { multiplier_stab = 1.5 }
                // console.log(move_name)
                if (this.meta.starter == 'Dhelmise' && move_name == 'ANCHOR SHOT') { multiplier_stab = 1.5 }
                const type_2_effectiveness = typeEffectiveness.find(x => x.moveType === move_type);
                if (defender_type1 != defender_type2) {
                    multiplier_type2 = type_2_effectiveness ? type_2_effectiveness[defender_type2] : 1;
                }
                if (move_type == "Normal" || move_type == "Fighting" || move_type == "Flying" || move_type == "Bug" || move_type == "Poison" || move_type == "Ghost" || move_type == "Ground" || move_type == "Rock" || move_type == "Steel") {
                    move_category = "Physical"
                }
                if (move_type == "Fire" || move_type == "Water" || move_type == "Grass" || move_type == "Electric" || move_type == "Psychic" || move_type == "Ice" || move_type == "Dragon" || move_type == "Dark") {
                    move_category = "Special"
                }
                if (enemyData.effects.reflect.value == true && move_category == "Physical") { screen_reflect = 0.5 }
                if (enemyData.effects.lightScreen.value == true && move_category == "Special") { screen_lightscreen = 0.5 }

                // return if further updates aren't required
                // returns "-" if the move has no power:
                if (move_power == null) { return "-" }
                // returns the move's base power if not in battle:
                if (this.meta.gameState != GameState.in_battle) {
                    return Math.floor(move_power * multiplier_stab)
                }

                //calculate the move's effective power
                return Math.floor(move_power * multiplier_stab * multiplier_type1 * multiplier_type2 * multiplier_type3 * screen_reflect * screen_lightscreen)
            } else {
                return this.movePower(pkmnData[moveNumber].value) ?? "";
            }
        },
        movePower(y) { //y = move1.value
            if (y) {
                const state = this.game_properties.meta.state.value
                // var move = this.gen1moves.find(x => x.Move.toLowerCase() === y.toLowerCase())
                var move = PokeData.getMove(this.move_name(y));
                if (move.power === 0) {
                    return 0;
                }
                if (this.showCritMultiplierInEP == true && (y.toUpperCase() == "RAZOR LEAF" || y.toUpperCase() == "CRABHAMMER" || y.toUpperCase() == "SLASH" || y.toUpperCase() == "KARATE CHOP" || y.toUpperCase() == "AEROBLAST")) {
                    const level = this.game_properties.player.team[0].level.value
                    const critModifier = (2 * level + 5) / (level + 5) // This part of the function is currently an approximation
                    const power = move.power
                    const pokemon = PokeData.getSpecies(this.meta.starter);
                    const baseSpeed = pokemon.base_stats.speed;
                    // test to see if the Pokemon always crits
                    if (baseSpeed > 64 && power) { // if the Pokemon has 63 or less base speed it will crit less often
                        return power * critModifier
                    }
                    else {
                        return power
                    }
                }
                else if (y.toUpperCase() == "RAGE FIST") {
                    if (state != 'Battle') {
                        return 50
                    }
                    let rage_fist_counter = this.game_properties.patch.backport.prop_1.value
                    let rage_fist_power = 50 + (50 * rage_fist_counter)
                    if (rage_fist_power > 350) { return 350 }
                    else { return rage_fist_power }
                }
                else if (move) { return move.power }
            }
            return null
        },
        moveAccuracyEvasionDynamic(move) {
            if (move) {
                const move_name = this.move_name(move);
                const moveObject = PokeData.getMove(move_name);
                if (this.meta.gameState != GameState.in_battle && this.meta.gameState != GameState.from_battle) {
                    return moveObject.accuracy;
                }
                const accuracyStageMods = stageModifiersData.find(x => x.modType === "accuracy")
                const currentAccuracyModStage = this.game_properties?.battle?.yourPokemon.modStageAccuracy.value
                const evasionStageMods = stageModifiersData.find(x => x.modType === "evasion")
                const currentEvasionModStage = this.game_properties?.battle?.enemyPokemon.modEnemyStageEvasion.value
                if (accuracyStageMods && evasionStageMods) {
                    if (moveObject.accuracy === null) {
                        return `-`
                    }
                    else {
                        return Math.floor(moveObject.accuracy * accuracyStageMods[currentAccuracyModStage] * evasionStageMods[currentEvasionModStage])
                    }
                } else {
                    return moveObject.accuracy
                }
            }
            else return ""
        },
        
    }
});
</script>