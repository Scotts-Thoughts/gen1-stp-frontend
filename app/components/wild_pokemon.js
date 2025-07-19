const moveData = require("../data/g1MoveData")

const template = /*html*/ `
<div v-if="state == 'Battle' || state == 'From Battle'">
    <div class="trainerLabel">{{"Wild " + wild_pkmn_name(wild_mon.species.value)}}</div>
    <div class="colored-image ds saturation" :style="battle_pokemon_crop()" style="--url: url(images/ui/opponent.svg);"></div>
    <div class="enemyGraphic">
        <div class="ePkmnStyle ePkmn1">
            <!-- Art -->
            <img v-if="mapper.properties.meta.gameName == 'Yellow'"            class="ePkmnSprite" :style="get_enemy_pkmn_styles(wild_mon).faint" :src="'images/pokemon/' + wild_mon.species.value + '.png'"/>
            <img v-else-if="mapper.properties.meta.gameName == 'Red and Blue'" class="ePkmnSprite" :style="get_enemy_pkmn_styles(wild_mon).faint" :src="'images/pokemon/Red_and_Blue/' + wild_mon.species.value + '.png'"/>
            
            <!-- UI Elements -->
            <img class="canvas" :class="svgColorClass(speed_comparison(wild_mon.speed).comparison, wild_mon)" :src="'images/ui/speed_comp/0.svg'"/>
            <img class="enemyStatsArea opacityTransition" :style="get_enemy_pkmn_styles(wild_mon).faint_stats_background" :src="'images/stats/0.svg'"/>
            
            <!-- Types -->
            <img                                       class="ePkmnTypeIcons ePkmnType_1 ds opacityTransition" :style="enemy_pkmn_faint_types(wild_mon)" :src="'images/elements/type-icons/' + enemyType1(0).toLowerCase() + '.png'"/>
            <img v-if="enemyType1(0) != enemyType2(0)" class="ePkmnTypeIcons ePkmnType_2 ds opacityTransition" :style="enemy_pkmn_faint_types(wild_mon)" :src="'images/elements/type-icons/' + enemyType2(0).toLowerCase() + '.png'"/>
            <img v-if="enemyType3(0) == 'Ghost'"       class="ePkmnTypeIcons ePkmnType_3 ds opacityTransition" :style="enemy_pkmn_faint_types(wild_mon)" :src="images/elements/type-icons/ghost.png"/>
            
            <!-- Species & Level -->
            <div class="ePkmnSpecies opacityTransition" :style="get_enemy_pkmn_styles(wild_mon).species">{{wild_mon.species.value}}</div>
            <div class="ePkmnLevel opacityTransition"   :style="get_enemy_pkmn_styles(wild_mon).species">Lv:{{wild_mon.level.value}}</div>
            
            <!-- Moves -->
            <div v-for="move_index in moves = [0, 1, 2, 3]">
                <img v-if="wild_mon['move' + (move_index + 1)]?.value != null" 
                    :class="'ds eMoveIconStyle moveIcon' + (move_index + 1) + ' opacityTransition'" 
                    :style="enemy_pkmn_faint_types(wild_mon)" 
                    :src="'images/elements/type-icons/' + (g1MoveData[move_name(wild_mon['move' + (move_index + 1)]?.value)]?.Type?.toLowerCase() || 'normal') + '.png'" 
                />
                <div :class="'ePkmnMoveStyle ePkmnMove' + (move_index + 1) + ' opacityTransition'" 
                    :style="get_enemy_pkmn_styles(wild_mon).text">
                    {{move_name(wild_mon['move' + (move_index + 1)]?.value)}}
                </div>
            </div>

            <!-- Stat Labels -->
            <div class="ePkmnStatLabelStyle ePkmnLabelHp   opacityTransition" :style="stat_mod(0).style"                                           >HP</div>
            <div class="ePkmnStatLabelStyle ePkmnLabelAtk  opacityTransition" :style="stat_mod(wild_mon.modEnemyStageAttack.value).style" >Atk.</div>
            <div class="ePkmnStatLabelStyle ePkmnLabelDef  opacityTransition" :style="stat_mod(wild_mon.modEnemyStageDefense.value).style">Def.</div>
            <div class="ePkmnStatLabelStyle ePkmnLabelSpc  opacityTransition" :style="stat_mod(wild_mon.modEnemyStageSpecial.value).style">Spc.</div>
            <div class="ePkmnStatLabelStyle ePkmnLabelSpe  opacityTransition" :style="stat_mod(wild_mon.modEnemyStageSpeed.value).style"  >Spe.</div>
            <div class="ePkmnStatLabelStyle ePkmnLabelCrit opacityTransition" :style="stat_mod(0).style"                                           >Crit.</div>

            <!-- Stats -->
            <div class="ePkmnStatsStyle ePkmnHp   opacityTransition" :style="get_enemy_pkmn_styles(wild_mon).text">{{wild_mon.maxHp.value}}</div>
            <div class="ePkmnStatsStyle ePkmnAtk  opacityTransition" :style="get_enemy_pkmn_styles(wild_mon).text">{{wild_mon.attack.value}}</div>
            <div class="ePkmnStatsStyle ePkmnDef  opacityTransition" :style="get_enemy_pkmn_styles(wild_mon).text">{{wild_mon.defense.value}}</div>
            <div class="ePkmnStatsStyle ePkmnSpc  opacityTransition" :style="get_enemy_pkmn_styles(wild_mon).text">{{wild_mon.speed.value}}</div>
            <div class="ePkmnStatsStyle ePkmnSpe  opacityTransition" :style="get_enemy_pkmn_styles(wild_mon).text">{{wild_mon.special.value}}</div>
            <div class="ePkmnStatsStyle ePkmnCrit opacityTransition" :style="get_enemy_pkmn_styles(wild_mon).text">{{enemy_crit_rate(wild_mon)}}%</div>
        
            <!-- Modifiers -->
            <div v-for="mod in modifiers = [
                ['modEnemyStageAttack',  'Atk',],
                ['modEnemyStageDefense', 'Def',],
                ['modEnemyStageSpecial', 'Spc',],
                ['modEnemyStageSpeed',   'Spd',],
                ]">
                <div v-show="(enemyState == 'Pokemon' || enemyState == 'Pokemon Sent Out' || enemyState == 'Fainting') && wild_mon[mod[0]].value != '0'" 
                :class="'ePkmnModsStyle ePkmnMod' + mod[1]">
                    {{stat_mod(wild_mon[mod[0]].value).mod}}
                </div>
            </div>
            <!-- Speed Comparison -->
            <div>
                <transition name="fade">
                    <div v-show="speed_comparison_toggle == true" :style="get_enemy_pkmn_styles(wild_mon).text" class="speed_comparison">{{speed_comparison(wild_mon.speed).comparison}}</div>
                </transition>
            </div>
        </div>
    </div> 
</div>
`

module.exports = {
    template,
    props: [
        "mapper",
        "state",
        "starterName",
        "g1PokemonData",
        "enemyState",
        "battle_pokemon_crop",
        "move_name",
        "get_enemy_pkmn_styles",
        "enemy_pkmn_faint_types",
        "speed_comparison_toggle",
    ],
    data() {
        return {
            enemyModColour:  ["0", "background: #d84444;"],
            // we have to put this in the data for use in the template, but we also don't want vue to track this object.
            // Accoridng to search engine results, Object.freeze() is the solution.
            g1MoveData: Object.freeze(moveData.gen1), 
        }
    },
    methods: {
        wild_pkmn_name(species_string) {
            if (species_string == null || species_string == undefined) { return "" }
            species_string = species_string.toLowerCase()
            const speciesMappings = {
              "nidoranm":     "Nidoran M",
              "nidoranf":     "Nidoran F",
              "mr. mime":     "Mr. Mime",
              "farfetch'd":   "Farfetch'd",
            };
            const formattedMove = speciesMappings[species_string];
            // console.log(formattedMove, species_string)
            return formattedMove || this.capitalization_format(species_string);
        },
        capitalization_format(str) {
            if (str == null) { return "" }
            return str.toLowerCase().replace(/(^|\s|\-|\.)(\w)/g, function(match, p1, p2) {
              return p1 + p2.toUpperCase();
            });
        },
        enemyMods(modValue) {
            if (this.state != "Battle") { return this.enemyModColour }
            var neutral = ["0", "background: #a1a1a1;"]
            var raised = [modValue, "background: #d84444;"]
            var lowered = [modValue, "background: #21c500"]
            if (modValue < 0) { 
                this.enemyModColour = raised 
                return raised
            }
            if (modValue > 0) { 
                this.enemyModColour = lowered 
                return lowered
            }
            return this.enemyModColour 
        },
        speed_comparison(enemy_speed_incoming) {
            let enemy_hp = this.mapper.properties.battle.enemyPokemon.hp.value
            let player_speed   = this.mapper.properties.battle.yourPokemon.speed.value
            let enemy_speed = enemy_speed_incoming.value
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
        enemyType1(slotNumber) {
            const pkmn_species = this.mapper.properties.battle.enemyPokemon.species.value
            if (pkmn_species == null) { 
                return "Normal"
            }
            return this.g1PokemonData[pkmn_species].type1
        },
        enemyType2(slotNumber) {
            const pkmn_species = this.mapper.properties.battle.enemyPokemon.species.value
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
            const pkmn_species = this.mapper.properties.battle.enemyPokemon?.species.value
            const type1 = this.g1PokemonData[pkmn_species]?.type1 || "Normal"
            const type2 = this.g1PokemonData[pkmn_species]?.type2 || "Normal"
            if (type2 != null && type1 != type2 && this.starterName == 'Pumpkaboo' && this.mapper.properties.patch.backport.prop_2.value == 8 && this.mapper.properties.battle.enemyPokemon.partyPos.value == slotNumber) {
                return 'Ghost'
            }
            else {
                return "Normal"
            }
        },
        stat_mod(modifer) {
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

            let object = {
                mod: mod_string,
                style: style_string,
            }
            // return { mod: -1, style: 'opacity: .7;' }
            // console.log(object)
            return object
        },
        enemy_crit_rate(pkmnData) {
            const species = pkmnData?.species.value
            const base_speed = this.g1PokemonData[species]?.base_spd
            if (base_speed) {
                return Math.round(Math.round((Math.floor(base_speed/2)/256) * 10000) / 100)
            }
        },
    },
    computed: {
        wild_mon() {
            return this.mapper.properties.battle.enemyPokemon
        }
    }
}

