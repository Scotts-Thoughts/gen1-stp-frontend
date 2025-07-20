const stageModifiersData = require("../../data/stage-modifiers");
const typeEffectiveness = require("../../data/type-effectiveness");
const PokeData = require("../../logic/PokeData");

const template = /*html*/`
    <div>
        <div class="movesetLabel labelMoves">moves</div>
        <div class="movesetLabel labelPwr"  >pwr.</div>
        <div class="movesetLabel labelAcc"  >acc.</div>
        <div class="movesetLabel labelPP"   >pp</div>
        <div class="movesetContainer">
            <div v-for="move in pkmnMoves" v-if="state != 'No Pokemon'">
                <div v-if="mapper.properties.player.team[0].level > 0 && mapper.properties.player.team[0][move].value != null">
                    <img :class="'movesetStyling iconStyling ' + move + 'icon'" 
                        :src="moveTypeIcon(get_backport_move(move))" />
                    <div v-show="mapper.properties.player.team[0][move].value != null" :class="'movesetStyling moveStyling ' + move">
                        {{ move_name(capitalization_format(get_backport_move(move))) }}
                    </div>
                    <div v-show="mapper.properties.player.team[0][move].value != null" :class="'movesetStyling powerStyling ' + move" :key="type_effectiveness(dynamic_mon,move,mapper.properties.battle.enemyPokemon)">
                        {{ type_effectiveness(dynamic_mon,move,mapper.properties.battle.enemyPokemon) || "-" }}
                    </div>
                    <div v-show="mapper.properties.player.team[0][move].value != null" :class="'movesetStyling accuracyStyling ' + move">
                        {{ moveAccuracyEvasionDynamic(get_backport_move(move)) || "-"}}<span style="font-size: 20px;">%</span>
                    </div>
                    <div v-show="mapper.properties.player.team[0][move].value != null" :class="'movesetStyling ppStyling ' + move">
                        {{ mapper.properties.player.team[0][move + "pp"] }}
                    </div>
                </div>
            </div>
        </div>
    </div>
`

module.exports = {
    template,
    props: [
        "starter",
        "mapper",
        "state",
        "move_name",
        "dynamic_mon",
        "capitalization_format",
    ],
    data() {
        return {
            typeCalcs             : true, // Calculates effective power based on the pokemon in battle, if false returns the move's base power with no modifications
            showCritMultiplierInEP: true, // Shows crit multiplier in the effective power if the Pokemon will always score a critical hit with the given move
            starterName: this.starter,
            pkmnMoves: ["move1","move2","move3","move4"],
        }
    },
    methods: {
        moveTypeIcon(move_name_string) {
            if (move_name_string != null && move_name_string != undefined) {
                var moveName = this.move_name(move_name_string)
                var move = PokeData.getMove(moveName);
                var moveType = move.type.toLowerCase()
                return `images/elements/type-icons/${moveType}.png`
            }
            return null
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
            else return move_name
        },
        get_backport_move(slot) {
            if (!this.dynamic_mon[slot]) {
                return null;
            }
            const move = this.dynamic_mon[slot].value
            const byte = this.dynamic_mon[slot].bytes[0]
            const starter = this.starterName
            const return_value = this.get_backport_move_name(move, starter, byte)
            return return_value
        },

        type_effectiveness(pkmnData, moveNumber, enemyData) { //pkmnData = team[0] etc
            if (!pkmnData[moveNumber]) {
                return;
            }
            if (this.typeCalcs == true) {
                const move_name = this.get_backport_move_name(
                    pkmnData[moveNumber].value, 
                    this.starterName, 
                    pkmnData[moveNumber].bytes
                )

                if (move_name == null) { return "" } //stop the function if there is no move in that slot
                if (move_name == 'Doom Desire') { return 120 }

                var move_type            = PokeData.getMove(move_name).type
                var move_info            = typeEffectiveness.find(x => x.moveType === move_type)
                var move_power           = this.movePower(move_name)
                var move_category        = PokeData.getMove(move_name).category
                var attacker_type1       = pkmnData.type1.value
                var attacker_type2       = pkmnData.type2.value
                var defender_type1       = enemyData.type1.value
                var defender_type2       = enemyData.type2.value
                var multiplier_stab      = 1
                var multiplier_type1     = move_info[defender_type1]
                var multiplier_type2     = 1
                var multiplier_type3     = 1
                var screen_reflect       = 1
                var screen_lightscreen   = 1
                
                //Pumpkaboo TrickOrTreat
                if (this.starterName == 'Pumpkaboo' && move_type == 'Ghost' && this.mapper.properties.patch.backport.prop_2.value == 8) {
                    multiplier_type3 = 2
                }

                //update variables
                if (move_type == attacker_type1 || move_type == attacker_type2) { multiplier_stab = 1.5 }
                // console.log(move_name)
                if (this.starterName == 'Dhelmise' && move_name == 'ANCHOR SHOT') { multiplier_stab = 1.5 }
                if (defender_type1 != defender_type2)                                          { multiplier_type2 = typeEffectiveness.find(x => x.moveType === move_type)[defender_type2] }
                if (move_type == "Normal" || move_type == "Fighting" || move_type == "Flying" || move_type == "Bug" || move_type == "Poison" || move_type == "Ghost" || move_type == "Ground" || move_type == "Rock" || move_type == "Steel") {
                    move_category = "Physical" }
                if (move_type == "Fire" || move_type == "Water" || move_type == "Grass" || move_type == "Electric" || move_type == "Psychic" || move_type == "Ice" || move_type == "Dragon" || move_type == "Dark") {
                    move_category = "Special" }
                if (enemyData.effects.reflect.value == true && move_category == "Physical")    { screen_reflect = 0.5 }
                if (enemyData.effects.lightScreen.value == true && move_category == "Special") { screen_lightscreen = 0.5 }

                //return if further updates aren't required
                if (move_power == "-")                { return move_power } //returns "-" if the move has no power
                if (this.state != `Battle`) { return Math.floor(move_power * multiplier_stab) } //returns the move's base power if not in battle

                //calculate the move's effective power
                return Math.floor(move_power * multiplier_stab * multiplier_type1 * multiplier_type2 * multiplier_type3 * screen_reflect * screen_lightscreen)
            } else { 
                return this.movePower(pkmnData[moveNumber].value);
            }
        },
        movePower(y) { //y = move1.value
            if (y) {
                const state = this.mapper.properties.meta.state.value
                // var move = this.gen1moves.find(x => x.Move.toLowerCase() === y.toLowerCase())
                var move = PokeData.getMove(this.move_name(y));
                if (move.power === 0) {
                    return 0;
                }
                if (this.showCritMultiplierInEP == true && (y.toUpperCase() == "RAZOR LEAF" || y.toUpperCase() == "CRABHAMMER" || y.toUpperCase() == "SLASH" || y.toUpperCase() == "KARATE CHOP" || y.toUpperCase() == "AEROBLAST")) {
                    const level = this.mapper.properties.player.team[0].level.value
                    const critModifier = (2*level+5)/(level+5) // This part of the function is currently an approximation
                    const power = move.power
                    const pokemon = PokeData.getSpecies(this.starterName);
                    const baseSpeed = pokemon.base_stats.speed;
                    // test to see if the Pokemon always crits
                    if (baseSpeed > 64) { // if the Pokemon has 63 or less base speed it will crit less often
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
                    let rage_fist_counter = this.mapper.properties.patch.backport.prop_1.value
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
                var move_name = this.move_name(move);
                var moveObject = PokeData.getMove(move_name);
                var moveAccuracy = moveObject.accuracy
                var accuracyStageMods = stageModifiersData.find(x => x.modType === "accuracy")
                var currentAccuracyModStage = this.mapper?.properties?.battle?.yourPokemon.modStageAccuracy.value
                var evasionStageMods = stageModifiersData.find(x => x.modType === "evasion")
                var currentEvasionModStage = this.mapper?.properties?.battle?.enemyPokemon.modEnemyStageEvasion.value
                if (this.state == `Battle` || this.state == `From Battle`) {
                    if (moveAccuracy == `-`) {
                        return `-`
                    }
                    else {
                        return Math.floor(moveAccuracy * accuracyStageMods[currentAccuracyModStage] * evasionStageMods[currentEvasionModStage])
                    }
                }
                else {
                    return moveAccuracy
                }
            }
            else return ""
        },
    }
}