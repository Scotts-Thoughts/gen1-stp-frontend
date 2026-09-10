<template>
    <div>
        <div class="movesetLabel labelMoves">moves</div>
        <div class="movesetLabel labelPwr">pwr.</div>
        <div class="movesetLabel labelAcc">acc.</div>
        <div class="movesetLabel labelPP">pp</div>
        <div class="movesetContainer" v-if="meta.gameState != 'No Pokemon'">
            <!-- Out of PP on every move: the game forces Struggle. -->
            <div v-if="struggle_check">
                <img class="movesetStyling iconStyling move1icon" :src="'images/elements/type-icons/normal.png'" />
                <div class="movesetStyling moveStyling move1">Struggle</div>
                <div class="movesetStyling powerStyling move1">{{ type_effectiveness(dynamic_mon, 'move1', game_properties.battle.enemyPokemon, true) || "-" }}</div>
                <div class="movesetStyling accuracyStyling move1">{{ moveAccuracyEvasionDynamic('Struggle') || "-" }}<span style="font-size: 20px;">%</span></div>
                <div class="movesetStyling ppStyling move1">-</div>
            </div>
            <template v-else>
                <div v-for="move in pkmnMoves">
                    <div v-if="game_properties.player.team[0].level.value > 0 && game_properties.player.team[0][move].value != null">
                        <img :class="'movesetStyling iconStyling ' + move + 'icon'" :src="moveTypeIcon(get_backport_move(move))" />
                        <div :class="'movesetStyling moveStyling ' + move">
                            {{ display_name(get_backport_move(move)) }}
                        </div>
                        <div :class="'movesetStyling powerStyling ' + move"
                            :key="type_effectiveness(dynamic_mon, move, game_properties.battle.enemyPokemon)"
                        >
                            {{ type_effectiveness(dynamic_mon, move, game_properties.battle.enemyPokemon) || "-" }}
                        </div>
                        <div :class="'movesetStyling accuracyStyling ' + move">
                            {{ moveAccuracyEvasionDynamic(get_backport_move(move)) || "-" }}
                            <span style="font-size: 20px;">%</span>
                        </div>
                        <div :class="'movesetStyling ppStyling ' + move">
                            {{ move_pp(move) }}
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { useMetaStore } from "~/stores/metaStore.ts";
import { GameState } from "~/stores/types/GameState";
import { stageModifiersData } from "~/data/stage-modifiers.ts";
import typeEffectiveness from "~/data/type-effectiveness.ts";
import PokeData from "~/logic/PokeData.ts";
import { capitalize_words, move_name } from "../../methods/text_functions";
import { defineComponent, inject } from "vue";
import { GameHookProperty } from "~/packages/gameHookMapperClient";

/**
 * Backported species use move slots that the mapper reports as STRUGGLE (or nothing). The raw byte of the move
 * tells which backported move it actually is.
 */
const BACKPORT_MOVE_BYTES: Record<string, Record<number, string>> = {
    "Scream Tail":    { 165: 'Play Rough', 166: 'Struggle' },
    "Testmoth":       { 165: 'Moth-Beam', 166: 'Moth-Bolt', 167: 'Moth-Flame', 168: 'Moth-Blast', 169: 'Struggle' },
    "Alolan Marowak": { 165: 'Shadow Bone' },
    "Mimikyu":        { 165: 'Shadow Claw', 166: 'Play Rough' },
    "Flutter Mane":   { 165: 'Dazzling Gleam', 166: 'Shadow Ball' },
};

/** Moves that always score a critical hit for pokemon with a high enough base speed. */
const HIGH_CRIT_MOVES = ["RAZOR LEAF", "CRABHAMMER", "SLASH", "KARATE CHOP", "AEROBLAST", "SHADOW CLAW"];

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
        /** The players pokemon: the battle structure while in battle, the party structure otherwise. */
        dynamic_mon(): any {
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
                const pokedex_data = PokeData.findSpecies(this.meta.starter) ?? { species: this.meta.starter };
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
        /** True when every move is out of PP, in which case the game only lets the player use Struggle. */
        struggle_check(): boolean {
            if (this.meta.gameState == 'No Pokemon') {
                return false;
            }
            const mon = this.dynamic_mon;
            if (!mon?.move1pp || mon.move1?.value == null) {
                return false;
            }
            return this.pkmnMoves.every(move => (mon[move + "pp"]?.value ?? 0) == 0);
        },
    },
    methods: {
        capitalize_words,
        move_name,
        /** Display name of a move, e.g. "THUNDERBOLT" -> "Thunderbolt". */
        display_name(move_name_string: string | null): string {
            return this.move_name(this.capitalize_words(move_name_string ?? ""), this.meta.starter);
        },
        /** Remaining PP of a move slot. In battle the battle structure is used so the value updates live. */
        move_pp(move: string): string | number {
            return this.dynamic_mon?.[move + "pp"]?.value
                ?? this.game_properties.player.team[0][move + "pp"]?.value
                ?? "";
        },
        moveTypeIcon(move_name_string: string | null): string {
            const move = PokeData.findMove(this.move_name(move_name_string, this.meta.starter));
            return `images/elements/type-icons/${(move?.type ?? "Normal").toLowerCase()}.png`;
        },
        get_backport_move_name(move_name: string | null, starter: string, byte_value: number | undefined): string | null {
            if (move_name == 'STRUGGLE' || move_name == null) {
                const mapped = byte_value != null ? BACKPORT_MOVE_BYTES[starter]?.[byte_value] : undefined;
                return mapped ?? move_name;
            }
            return move_name
        },
        get_backport_move(slot: string): string | null {
            if (!this.dynamic_mon[slot]) {
                return null;
            }
            const move = this.dynamic_mon[slot].value;
            const byte = this.dynamic_mon[slot].bytes?.[0];
            return this.get_backport_move_name(move, this.meta.starter, byte);
        },

        type_effectiveness(pkmnData: any, moveNumber: string, enemyData: any, struggle: boolean = false): string | number {
            if (!struggle && !pkmnData?.[moveNumber]) {
                return "";
            }
            const move_name = struggle
                ? "Struggle"
                : this.get_backport_move_name(pkmnData[moveNumber].value, this.meta.starter, pkmnData[moveNumber].bytes?.[0]);

            if (move_name == null) { return "" } //stop the function if there is no move in that slot
            if (move_name == 'Doom Desire') { return 120 }

            const moveData = PokeData.findMove(this.move_name(move_name, this.meta.starter));
            if (!moveData) { return "-" }
            if (this.typeCalcs != true) {
                return this.movePower(move_name) ?? "";
            }

            var move_type = moveData.type
            var move_info = typeEffectiveness.find(x => x.moveType === move_type)
            var move_power = this.movePower(move_name)
            var move_category: string = moveData.category
            var attacker_type1 = pkmnData.type1?.value
            var attacker_type2 = pkmnData.type2?.value
            var defender_type1 = enemyData?.type1?.value
            var defender_type2 = enemyData?.type2?.value
            var multiplier_stab = 1
            var multiplier_type1 = move_info ? (move_info[defender_type1] ?? 1) : 1
            var multiplier_type2 = 1
            var multiplier_type3 = 1
            var screen_reflect = 1
            var screen_lightscreen = 1

            //Pumpkaboo TrickOrTreat
            if (this.meta.starter == 'Pumpkaboo' && move_type == 'Ghost' && this.game_properties.patch?.backport?.prop_2?.value == 8) {
                multiplier_type3 = 2
            }

            //update variables
            if (move_type == attacker_type1 || move_type == attacker_type2) { multiplier_stab = 1.5 }
            if (this.meta.starter == 'Dhelmise' && move_name == 'ANCHOR SHOT') { multiplier_stab = 1.5 }
            if (defender_type1 != defender_type2) {
                multiplier_type2 = move_info ? (move_info[defender_type2] ?? 1) : 1;
            }
            if (move_type == "Normal" || move_type == "Fighting" || move_type == "Flying" || move_type == "Bug" || move_type == "Poison" || move_type == "Ghost" || move_type == "Ground" || move_type == "Rock" || move_type == "Steel") {
                move_category = "Physical"
            }
            if (move_type == "Fire" || move_type == "Water" || move_type == "Grass" || move_type == "Electric" || move_type == "Psychic" || move_type == "Ice" || move_type == "Dragon" || move_type == "Dark") {
                move_category = "Special"
            }
            if (enemyData?.effects?.reflect?.value == true && move_category == "Physical") { screen_reflect = 0.5 }
            if (enemyData?.effects?.lightScreen?.value == true && move_category == "Special") { screen_lightscreen = 0.5 }

            // return if further updates aren't required
            // returns "-" if the move has no power:
            if (move_power == null) { return "-" }
            // returns the move's base power if not in battle:
            if (this.meta.gameState != GameState.in_battle) {
                return Math.floor(move_power * multiplier_stab)
            }

            //calculate the move's effective power
            return Math.floor(move_power * multiplier_stab * multiplier_type1 * multiplier_type2 * multiplier_type3 * screen_reflect * screen_lightscreen)
        },
        movePower(y: string | null): number | null { //y = move1.value
            if (y) {
                const state = this.game_properties.meta.state.value
                const move = PokeData.findMove(this.move_name(y, this.meta.starter));
                if (!move) {
                    return null;
                }
                if (move.power === 0) {
                    return 0;
                }
                if (this.showCritMultiplierInEP == true && HIGH_CRIT_MOVES.includes(y.toUpperCase())) {
                    const level = this.game_properties.player.team[0].level.value
                    const critModifier = (2 * level + 5) / (level + 5) // This part of the function is currently an approximation
                    const power = move.power
                    const baseSpeed = PokeData.findSpecies(this.meta.starter)?.base_stats.speed ?? 0;
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
                    let rage_fist_counter = this.game_properties.patch?.backport?.prop_1?.value ?? 0
                    let rage_fist_power = 50 + (50 * rage_fist_counter)
                    if (rage_fist_power > 350) { return 350 }
                    else { return rage_fist_power }
                }
                return move.power
            }
            return null
        },
        moveAccuracyEvasionDynamic(move: string | null): string | number {
            if (!move) {
                return "";
            }
            const moveObject = PokeData.findMove(this.move_name(move, this.meta.starter));
            if (!moveObject) {
                return "";
            }
            if (this.meta.gameState != GameState.in_battle && this.meta.gameState != GameState.from_battle) {
                return moveObject.accuracy ?? "-";
            }
            const accuracyStageMods = stageModifiersData.find(x => x.modType === "accuracy")
            const currentAccuracyModStage = this.game_properties?.battle?.yourPokemon.modStageAccuracy.value
            const evasionStageMods = stageModifiersData.find(x => x.modType === "evasion")
            const currentEvasionModStage = this.game_properties?.battle?.enemyPokemon.modEnemyStageEvasion.value
            if (moveObject.accuracy === null) {
                return `-`
            }
            if (accuracyStageMods && evasionStageMods) {
                return Math.floor(moveObject.accuracy * accuracyStageMods[currentAccuracyModStage] * evasionStageMods[currentEvasionModStage])
            }
            return moveObject.accuracy
        },
    }
});
</script>
