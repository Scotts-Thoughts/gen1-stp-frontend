const g1MoveData = require("../data/g1MoveData");
const trainers = require("../data/trainers");
const { get_enemy_pkmn_styles } = require("../methods/enemy");
const template = /*html*/`
<div>
    <div class="trainerLabel">{{capitalization_format(fixTrainerName(batt.trainer.class.value, batt.trainer.number))}}</div>
    <div class="colored-image ds saturation" :style="battle_pokemon_crop()" style="--url: url(images/ui/opponent.svg);"></div>
    <div class="enemyGraphic">
        <div v-for="x in pkmnSlots">
            <div v-if="mapper.properties.battle.trainer.totalPokemon > x" :class="'ePkmnStyle ePkmn' + (x + 1)">
                <img v-if="mapper.properties.meta.gameName == 'Yellow'" class="ePkmnSprite" :style="get_enemy_pkmn_styles(batt.trainer.team[x]).faint" :src="'images/pokemon/' + mapper.properties.battle.trainer.team[x]?.species + '.png'"/>
                <img v-else-if="mapper.properties.meta.gameName == 'Red and Blue'" class="ePkmnSprite" :style="get_enemy_pkmn_styles(batt.trainer.team[x]).faint" :src="'images/pokemon/Red_and_Blue/' + mapper.properties.battle.trainer.team[x]?.species + '.png'"/>
                <div class="ePkmnSpecies opacityTransition" :style="get_enemy_pkmn_styles(batt.trainer.team[x]).species">{{mapper.properties.battle.trainer.team[x]?.species}}</div>
                <div class="ePkmnLevel opacityTransition" :style="get_enemy_pkmn_styles(batt.trainer.team[x]).species">Lv:{{mapper.properties.battle.trainer.team[x]?.level}}</div>
                <img class="ePkmnTypeIcons ePkmnType_1 ds opacityTransition" :style="enemy_pkmn_faint_types(batt.trainer.team[x])" :src="'images/elements/type-icons/' + enemyType1(x).toLowerCase() + '.png'"/>
                <img v-if="enemyType1(x) != enemyType2(x)" :style="enemy_pkmn_faint_types(batt.trainer.team[x])" class="ePkmnTypeIcons ePkmnType_2 ds opacityTransition" :src="'images/elements/type-icons/' + enemyType2(x).toLowerCase() + '.png'"/>
                <img v-if="enemyType3(x) == 'Ghost'" :style="enemy_pkmn_faint_types(batt.trainer.team[x])" class="ePkmnTypeIcons ePkmnType_3 ds opacityTransition" :src="images/elements/type-icons/ghost.png"/>
                
                <!-- Moves -->
                <img class="canvas" :class="svgColorClass(speed_comparison(x, mapper.properties.battle.trainer.team[x]?.speed).comparison, batt.trainer.team[x])" :src="'images/ui/speed_comp/' + x + '.svg'"/>
                <img 
                    class="enemyStatsArea opacityTransition" 
                    :style="get_enemy_pkmn_styles(batt.trainer.team[x]).faint_stats_background" 
                    :src="'images/stats/' + x + '.svg'"
                />

                <div v-for="move_index in moves = [0, 1, 2, 3]">
                    <img v-if="mapper.properties.battle.trainer.team[x]['move' + (move_index + 1)]?.value != null" 
                        :class="'ds eMoveIconStyle moveIcon' + (move_index + 1) + ' opacityTransition'" 
                        :style="enemy_pkmn_faint_types(batt.trainer.team[x])" 
                        :src="'images/elements/type-icons/' + g1MoveData[move_name(mapper.properties.battle.trainer.team[x]['move' + (move_index + 1)]?.value)]?.Type?.toLowerCase() + '.png'" 
                    />
                    <div :class="'ePkmnMoveStyle ePkmnMove' + (move_index + 1) + ' opacityTransition'" 
                        :style="get_enemy_pkmn_styles(batt.trainer.team[x]).text">
                        {{move_name(mapper.properties.battle.trainer.team[x]['move' + (move_index + 1)]?.value)}}
                    </div>
                </div>

                <!-- Stats -->
                <div class="ePkmnStatLabelStyle ePkmnLabelHp   opacityTransition" :style="stat_mod(0, x).style"                                           >HP</div>
                <div class="ePkmnStatLabelStyle ePkmnLabelAtk  opacityTransition" :style="stat_mod(batt.enemyPokemon.modEnemyStageAttack.value, x).style" >Atk.</div>
                <div class="ePkmnStatLabelStyle ePkmnLabelDef  opacityTransition" :style="stat_mod(batt.enemyPokemon.modEnemyStageDefense.value, x).style">Def.</div>
                <div class="ePkmnStatLabelStyle ePkmnLabelSpc  opacityTransition" :style="stat_mod(batt.enemyPokemon.modEnemyStageSpecial.value, x).style">Spc.</div>
                <div class="ePkmnStatLabelStyle ePkmnLabelSpe  opacityTransition" :style="stat_mod(batt.enemyPokemon.modEnemyStageSpeed.value, x).style"  >Spe.</div>
                <div class="ePkmnStatLabelStyle ePkmnLabelCrit opacityTransition" :style="stat_mod(0, x).style"                                           >Crit.</div>

                <div class="ePkmnStatsStyle ePkmnHp   opacityTransition" :style="get_enemy_pkmn_styles(batt.trainer.team[x]).text">{{mapper.properties.battle.trainer.team[x]?.maxHp}}</div>
                <div class="ePkmnStatsStyle ePkmnAtk  opacityTransition" :style="get_enemy_pkmn_styles(batt.trainer.team[x]).text">{{activeSlot(x,batt.enemyPokemon.partyPos.value,"attack",mapper.properties.battle.trainer.team[x]?.attack,"enemyPokemon")}}</div>
                <div class="ePkmnStatsStyle ePkmnDef  opacityTransition" :style="get_enemy_pkmn_styles(batt.trainer.team[x]).text">{{activeSlot(x,batt.enemyPokemon.partyPos.value,"defense",mapper.properties.battle.trainer.team[x]?.defense,"enemyPokemon")}}</div>
                <div class="ePkmnStatsStyle ePkmnSpc  opacityTransition" :style="get_enemy_pkmn_styles(batt.trainer.team[x]).text">{{activeSlot(x,batt.enemyPokemon.partyPos.value,"speed",mapper.properties.battle.trainer.team[x]?.speed,"enemyPokemon")}}</div>
                <div class="ePkmnStatsStyle ePkmnSpe  opacityTransition" :style="get_enemy_pkmn_styles(batt.trainer.team[x]).text">{{activeSlot(x,batt.enemyPokemon.partyPos.value,"special",mapper.properties.battle.trainer.team[x]?.special,"enemyPokemon")}}</div>
                <div class="ePkmnStatsStyle ePkmnCrit opacityTransition" :style="get_enemy_pkmn_styles(batt.trainer.team[x]).text">{{enemy_crit_rate(mapper.properties.battle.trainer.team[x])}}%</div>
            
                <!-- Modifiers -->
                <div v-for="mod in modifiers = [
                    ['modEnemyStageAttack',  'Atk',],
                    ['modEnemyStageDefense', 'Def',],
                    ['modEnemyStageSpecial', 'Spc',],
                    ['modEnemyStageSpeed',   'Spd',],
                    ]">
                    <div v-show="(enemyState == 'Pokemon' || enemyState == 'Pokemon Sent Out' || enemyState == 'Fainting') && batt.enemyPokemon.partyPos.value == x && batt.enemyPokemon[mod[0]].value != '0'" 
                    :class="'ePkmnModsStyle ePkmnMod' + mod[1]">
                        {{stat_mod(batt.enemyPokemon[mod[0]].value, x).mod}}
                    </div>
                </div>
                <div>
                    <transition name="fade">
                        <div v-show="speed_comparison_toggle == true" :style="get_enemy_pkmn_styles(batt.trainer.team[x]).text" class="speed_comparison">{{speed_comparison(x, mapper.properties.battle.trainer.team[x]?.speed).comparison}}</div>
                    </transition>
                </div>
            </div>
        </div>
    </div> 
    <div v-if="(trainer_artwork() != null && state != 'Base Stats' && state != 'Overworld' && state != 'From Battle') && mapper.properties.battle.type.value == 'Trainer' && right_panel == 'Automatic'" style="position: absolute;" key=1>
        <img class="canvas" :src="trainer_artwork()"/>
    </div>
</div>
`

module.exports = {
    template,
    props: [
        "mapper",
        "capitalization_format",
        "move_name",
        "speed_comparison_toggle",
        "battle_pokemon_crop",
        "enemy_pkmn_faint_types",
        "g1PokemonData",
        "starterName",
        "enemyState",
        "state",
        "right_panel",
    ],
    data() {
        return {
            pkmnSlots: [0, 1, 2, 3, 4, 5],
            // we have to put this in the data for use in the template, but we also don't want vue to track this object.
            // Accoridng to search engine results, Object.freeze() is the solution.
            g1MoveData: Object.freeze(g1MoveData.gen1), 
        }
    },
    computed: {
        batt() {
            return this.mapper.properties.battle
        },
    },
    methods: {
        get_enemy_pkmn_styles,
        speed_comparison(enemy_slot, enemy_speed_incoming) {
            const state          = this.mapper.properties.meta.state.value
            const trainer        = this.mapper.properties.battle.trainer.class.value
            const trainer_number = this.mapper.properties.battle.trainer.number.value
            const gameName       = this.mapper.properties.meta.gameName.value;
            let data = trainers[gameName];
            let enemy_hp = this.mapper.properties.battle.trainer.team[enemy_slot].hp.value
            let player_speed   = this.mapper.properties.battle.yourPokemon.speed.value
            let enemy_speed = enemy_speed_incoming
            if (state == 'To Battle') {
                enemy_speed = data[`${trainer} ${trainer_number}`].pokemon[enemy_slot].spd
                player_speed = this.mapper.properties.player.team[0].speed.value
            }
            let object = {
                comparison: "Outspeeds",
                color: "background-color: rgba(255, 63, 63, 0.6)",
            }
            if (player_speed > enemy_speed) {
                object.comparison = "Outsped"
                object.color      = "background-color: rgba(28, 255, 58, 0.4)"
            }
            else if (player_speed == enemy_speed) {
                object.comparison = "Speed-tie"
                object.color      = "background-color: rgba(255, 255, 0, 0.5)"
            }
            if (enemy_hp == 0) {
                object.color      = "background-color: rgba(28, 255, 58, 0.5); opacity: 0.0; filter: grayscale(100%)"
            }
            return object
        },
        svgColorClass(speed_comparison, enemy_data) {
            const isFainted = enemy_data.hp.value
            if (isFainted == 0) {
                return 'grey-svg';
            }
            if (speed_comparison === 'Outsped') {
                return 'blue-svg';
            } 
            else if (speed_comparison === 'Speed-tie') {
                return 'yellow-svg';
            }
            return 'red-svg';
        },
        fixTrainerName(trainerName, trainerNumber) {
            const gameName = this.mapper.properties.meta.gameName;
            const rival1Teams = [
                "rival 1's team", 
                "rival 1A's team", 
                "rival 2's team"];
            const rival2Teams = [
                "rival 3's team",
                "rival 4's team",
                "rival 4's team",
                "rival 4's team",
                "rival 5's team",
                "rival 5's team",
                "rival 5's team",
                "rival 6's team",
                "rival 6's team",
                "rival 6's team",
            ];
          
            if (gameName == "Yellow") {
              if (trainerName == "RIVAL1") {
                return rival1Teams[trainerNumber - 1];
              } 
              else if (trainerName == "RIVAL2") {
                return rival2Teams[trainerNumber - 1];
              } 
              else if (trainerName == "RIVAL3") {
                return "champion's team";
              } 
              else {
                return trainerName.toLowerCase() + "'s team";
              }
            } 
            else if (gameName == "Red and Blue") {
              if (trainerName == "RIVAL1" && (trainerNumber == 1 || trainerNumber == 2 || trainerNumber == 3)) {
                return "rival1's team";
              } 
              else if (trainerName == "RIVAL1" && (trainerNumber == 4 || trainerNumber == 5 || trainerNumber == 6)) {
                return "rival1a's team";
              }
              else if (trainerName == "RIVAL1" && (trainerNumber == 7 || trainerNumber == 8 || trainerNumber == 9)) {
                return "rival2's team";
              }
              else if (trainerName == "RIVAL2" && (trainerNumber == 1 || trainerNumber == 2 || trainerNumber == 3)) {
                return "rival3's team";
              } 
              else if (trainerName == "RIVAL2" && (trainerNumber == 4 || trainerNumber == 5 || trainerNumber == 6)) {
                return "rival4's team";
              } 
              else if (trainerName == "RIVAL2" && (trainerNumber == 7 || trainerNumber == 8 || trainerNumber == 9)) {
                return "rival5's team";
              } 
              else if (trainerName == "RIVAL2" && (trainerNumber == 10 || trainerNumber == 11 || trainerNumber == 12)) {
                return "rival6's team";
              } 
              else if (trainerName == "RIVAL3") {
                return "champion's team";
              } 
              else {
                return trainerName.toLowerCase() + "'s team";
              }
            }
        },
        enemyType1(slotNumber) {
            const pkmn_species = this.mapper.properties.battle.trainer.team[slotNumber].species.value
            if (pkmn_species == null) { 
                return "Normal"
            }
            return this.g1PokemonData[pkmn_species].type1
        },
        enemyType2(slotNumber) {
            const pkmn_species = this.mapper.properties.battle.trainer.team[slotNumber].species.value
            const type_1 = this.enemyType1(slotNumber)
            if (pkmn_species == null) { 
                return "Normal"
            }
            const type_2 = this.g1PokemonData[pkmn_species].type2
            if (type_1 == type_2 && this.starterName == 'Pumpkaboo' && this.mapper.properties.patch.backport.prop_2.value == 8 && this.mapper.properties.battle.enemyPokemon.partyPos.value == slotNumber) {
                return 'Ghost'
            }
            return type_2
        },
        enemyType3(slotNumber) {
            const pkmn_species = this.mapper.properties.battle.trainer.team[slotNumber].species.value
            const type1 = this.g1PokemonData[pkmn_species].type1
            const type2 = this.g1PokemonData[pkmn_species].type2
            if (type2 != null && type1 != type2 && this.starterName == 'Pumpkaboo' && this.mapper.properties.patch.backport.prop_2.value == 8 && this.mapper.properties.battle.enemyPokemon.partyPos.value == slotNumber) {
                return 'Ghost'
            }
            else {
                return "Normal"
            }
        },
        stat_mod(modifer, slot) {
            let mod = modifer
            let mod_string = ""
            let style_string = ""

            if (mod == 0) {
                style_string = 'opacity: .7;'
            }
            if (mod > 0) {
                mod_string = `+${mod}`
                style_string = 'opacity: .1;'
            }
            if (mod < 0) {
                mod_string = mod
                style_string = 'opacity: .1;'
            }

            if (this.mapper.properties.battle.trainer.team[slot].hp.value == 0) {
                style_string = 'opacity: .3;'
            }
            if (slot != this.mapper.properties.battle.enemyPokemon.partyPos.value && this.mapper.properties.battle.trainer.team[slot].hp.value > 0) {
                style_string = 'opacity: .7;'
            }

            let object = {
                mod: mod_string,
                style: style_string,
            }
            // return { mod: -1, style: 'opacity: .7;' }
            // console.log(object)
            return object
        },
        // STAGE MULTIPLIERS
        //edge case management (prevent flickering of the stat values due to overlay stage multipliers being applied on Pokemon that are not yet in battle)
        //determine which Pokemon is currently in battle and display only their stage multipliers
        activeSlot(activePkmn, currentSlot, statLabel, stat, side) {
            if (this.enemyState == "Fainted" || this.state == "From Battle") {
                return stat 
            }
            else if (this.enemyState == "Pokemon" || this.enemyState == "Pokemon Sent Out" || this.enemyState == "Fainting") {
                if (activePkmn == currentSlot && this.state == "Battle") {
                    return this.mapper.properties.battle[side][statLabel].value
                }
                else { 
                    return stat
                }
            }
            else {
                return stat
            }
        },
        enemy_crit_rate(pkmnData) {
            const species = pkmnData?.species.value
            const base_speed = this.g1PokemonData[species]?.base_spd
            if (base_speed) {
                return Math.round(Math.round((Math.floor(base_speed/2)/256) * 10000) / 100)
            }
        },
        trainer_artwork() { //pick the trainer graphic based on the trainer class and number
            const trainerClass = this.mapper.properties.battle.trainer.class
            const trainerNumber = this.mapper.properties.battle.trainer.number
            if (this.mapper.properties.meta.gameName.value == "Yellow") {
                switch (`${trainerClass}_${trainerNumber}`) {
                    case "LT.SURGE_1":      return "images/trainers/ltsurge.png";
                    case "SABRINA_1":       return "images/trainers/sabrina.png";
                    case "BLAINE_1":        return "images/trainers/blaine.png";
                    case "RIVAL1_1":        return "images/trainers/RIVAL1.png";
                    case "RIVAL1_2":        return "images/trainers/RIVAL1.png";
                    case "RIVAL1_3":        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_4":        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_5":        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_6":        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_7":        return "images/trainers/RIVAL2.png";
                    case "RIVAL2_1":        return "images/trainers/RIVAL2.png";
                    case "ROCKET_42":       return "images/trainers/JESSIE_JAMES_1.png";
                    case "ROCKET_44":       return "images/trainers/JESSIE_JAMES_2.png";
                    case "ROCKET_45":       return "images/trainers/JESSIE_JAMES_2.png";
                    case "JR TRAINER F_5":  return "images/trainers/JR TRAINER F_5.png";
                    case "YOUNGSTER_1":     return "images/trainers/BEN.png";
                    case "POKEMANIAC_7":    return "images/trainers/POKEMANIAC_7.png";
                    case "SUPER NERD_2":    return "images/trainers/FOSSIL_NERD.png";
                    case "LASS_10":         return "images/trainers/ODDISH_LASS.png";
                    case "FISHER_7":        return "images/trainers/SIKE.png";
                    case "JR TRAINER F_10": return "images/trainers/JR TRAINER F_10.png";
                    case "ROCKET_5":        return "images/trainers/dig_rocket.png";
                    case "ROCKET_38":       return "images/trainers/ROCKET_38.png";
                    case "HIKER_9":         return "images/trainers/HIKER_9.png";
                    case "LASS_3":          return "images/trainers/LASS_3.png";
                    case "JR TRAINER F_1":  return "images/trainers/GOLDEEN.png";
                    case "ROCKET_25":       return "images/trainers/HYPNO_SANDWICH.png";
                    case "JR TRAINER F_3":  return "images/trainers/JR TRAINER F_3.png";
                    case "CHANNELER_10":    return "images/trainers/AGATHAJR.png";
                    case "BROCK_1":         return "images/trainers/brock.png";
                    case "MISTY_1":         return "images/trainers/misty.png";
                    case "ERIKA_1":         return "images/trainers/erika.png";
                    case "KOGA_1":          return "images/trainers/koga.png";
                    case "LORELEI_1":       return "images/trainers/lorelei.png";
                    case "BRUNO_1":         return "images/trainers/bruno.png";
                    case "AGATHA_1":        return "images/trainers/agatha.png";
                    case "LANCE_1":         return "images/trainers/lance.png";
                    case "HIKER_2":         return "images/trainers/elixir_hiker.png";
                    default:                return null;
                }
            }
            if (this.mapper.properties.meta.gameName.value == "Red and Blue") {
                switch (`${trainerClass}_${trainerNumber}`) {
                    case "LT.SURGE_1":      return "images/trainers/Red_and_Blue/ltsurge.png";
                    case "SABRINA_1":       return "images/trainers/Red_and_Blue/sabrina.png";
                    case "BLAINE_1":        return "images/trainers/Red_and_Blue/blaine.png";
                    case "RIVAL1_1":        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_2":        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_3":        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_4":        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_5":        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_6":        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_7":        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL1_8":        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL1_9":        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL2_1":        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL2_2":        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL2_3":        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "JR TRAINER F_5":  return "images/trainers/Red_and_Blue/JR TRAINER F_5.png";
                    case "YOUNGSTER_1":     return "images/trainers/Red_and_Blue/BEN.png";
                    case "POKEMANIAC_7":    return "images/trainers/Red_and_Blue/POKEMANIAC_7.png";
                    case "SUPER NERD_2":    return "images/trainers/Red_and_Blue/FOSSIL_NERD.png";
                    case "LASS_10":         return "images/trainers/Red_and_Blue/ODDISH_LASS.png";
                    case "JR TRAINER F_10": return "images/trainers/Red_and_Blue/JR TRAINER F_10.png";
                    case "ROCKET_5":        return "images/trainers/dig_rocket.png";
                    case "ROCKET_38":       return "images/trainers/Red_and_Blue/ROCKET_38.png";
                    case "HIKER_9":         return "images/trainers/Red_and_Blue/HIKER_9.png";
                    case "LASS_3":          return "images/trainers/Red_and_Blue/LASS_3.png";
                    case "JR TRAINER F_1":  return "images/trainers/Red_and_Blue/GOLDEEN.png";
                    case "ROCKET_25":       return "images/trainers/Red_and_Blue/HYPNO_SANDWICH.png";
                    case "JR TRAINER F_3":  return "images/trainers/Red_and_Blue/JR TRAINER F_3.png";
                    case "CHANNELER_10":    return "images/trainers/Red_and_Blue/AGATHAJR.png";
                    case "BROCK_1":         return "images/trainers/Red_and_Blue/brock.png";
                    case "MISTY_1":         return "images/trainers/Red_and_Blue/misty.png";
                    case "ERIKA_1":         return "images/trainers/Red_and_Blue/erika.png";
                    case "KOGA_1":          return "images/trainers/Red_and_Blue/koga.png";
                    case "LORELEI_1":       return "images/trainers/lorelei.png";
                    case "BRUNO_1":         return "images/trainers/bruno.png";
                    case "AGATHA_1":        return "images/trainers/agatha.png";
                    case "LANCE_1":         return "images/trainers/lance.png";
                    case "ROCKET_1":        return "images/trainers/Red_and_Blue/mtmoon_rocket_boss.png";
                    case "HIKER_2":         return "images/trainers/Red_and_Blue/elixir_hiker.png";
                    default:                return null;
                }
            }
        }
    },
}