const PokeData = require("../../logic/PokeData")

const template = /*html*/`
    <div class="statsContainer"> 
        <div class="critrate">Crit rate: {{ crit_rate }}%</div>
        <div>
            <div class="statsheader">{{stats_header}}</div>
            <div class="expLabelGen1">Exp:</div>
            <div v-for="stat in stat_object" class="stat">
                <div v-if="stat.name != 'HP' && state == 'Battle'" class="stat_label mod_style">{{ stringify_stage_modifiers(this.mapper?.properties?.battle?.yourPokemon['modStage'+stat.mod_path]) }}</div>
                <div :style="{ opacity: statLabelOpacity()[stat.name]}" class="stat_label">{{stat.label}}</div>
                
                <div v-if="stats_display == 'Base Stats'"   class="stat_value">{{pokedex_yellow[starterName].base_stats[stat.base_stat_path]}}</div>
                <div v-if="stats_display == 'Averages'"     class="stat_value">{{average_median_stats(stat.base_stat_path).average}}</div>
                <div v-if="stats_display == 'Medians'"      class="stat_value">{{average_median_stats(stat.base_stat_path).median}}</div>
                <div v-if="stats_display == 'DVs'"          class="stat_value dv">{{get_dv(stat.name)}}/15</div>
                <div v-if="stats_display == 'EVs'"          class="stat_value stat_exp">{{mapper.properties.player.team[0]['statExp' + stat.name].value}}</div>
                <div v-if="stats_display == 'Automatic'"    class="stat_value">{{get_stat(stat.name)}}</div>
                
                <div v-if="stats_display == 'Vitamins'"     class="stat_value stat_multi_line devs2"           ><span style="opacity: .7;">{{stat.vitamin}}</span></div>
                <div v-if="stats_display == 'Vitamins'"     class="stat_value stat_multi_line percentage_evs2" style="font-size: 21px;"><span style="font-size: 31px;">{{usable_vitamins(mapper.properties.player.team[0][stat.statExpPath].value)}}</span><span style="font-size: 15px;">/10</span></div>
                <div v-if="stats_display == 'Vitamins'"     class="stat_value stat_multi_line ev_stats_gained2">{{mapper.properties.player.team[0]['statExp' + stat.name].value}}<span style="font-size: 13px;">/65535</span></div>
                
                <div v-if="stats_display == 'Detailed EVs'" class="stat_value stat_multi_line devs"           >{{mapper.properties.player.team[0]['statExp' + stat.name].value}}/65535</div>
                <div v-if="stats_display == 'Detailed EVs'" class="stat_value stat_multi_line percentage_evs" >{{decimalToPercentage(mapper.properties.player.team[0]['statExp' + stat.name].value / 65535) }}%</div>
                <div v-if="stats_display == 'Detailed EVs'" class="stat_value stat_multi_line ev_stats_gained">Stats: {{Math.floor(Math.sqrt(mapper.properties.player.team[0]['statExp' + stat.name].value) / 4)}}</div>
                
                <div v-if="stats_display == 'Badge Boosts'" class="stat_value stat_multi_line devs"           >Stat: {{mapper.properties.player.team[0][stat.path].value}}</div>
                <div v-if="stats_display == 'Badge Boosts'" class="stat_value stat_multi_line percentage_evs" >Boost: {{get_bb_stat(stat.name)}}</div>
                <div v-if="stats_display == 'Badge Boosts'" class="stat_value stat_multi_line ev_stats_gained">+{{(get_stat(stat.name) - mapper.properties.player.team[0][stat.path].value) / mapper.properties.player.team[0][stat.path].value*100}}%</div>
            </div>
        </div>
        <div class="exp_growthRate">{{ growthRate }}</div>
    </div>
`

module.exports = {
    template,
    props: [
        "mapper",
        "state",
        "starterName",
        "stats_display",
        "dynamic_mon",
    ],
    data() {
        return {
            s1dynamicReset: this.dynamic_mon,
            stat_object: [
                { name: "Hp",      label: "HP",   path: "maxHp",   base_stat_path: "hp",             mod_path: "Hp",      statExpPath: "statExpHp",      vitamin: "HP Up",  }, 
                { name: "Speed",   label: "Spe.", path: "speed",   base_stat_path: "speed",          mod_path: "Speed",   statExpPath: "statExpSpeed",   vitamin: "Carbos", }, 
                { name: "Attack",  label: "Atk.", path: "attack",  base_stat_path: "attack",         mod_path: "Attack",  statExpPath: "statExpAttack",  vitamin: "Protein",}, 
                { name: "Special", label: "Spc.", path: "special", base_stat_path: "special_attack", mod_path: "Special", statExpPath: "statExpSpecial", vitamin: "Calcium",}, 
                { name: "Defense", label: "Def.", path: "defense", base_stat_path: "defense",        mod_path: "Defense", statExpPath: "statExpDefense", vitamin: "Iron",   }, 
            ],
        }
    },
    computed: {
        crit_rate() {
            return this.calculate_crit_rate(PokeData.getSpecies(this.starterName));
        },
        stats_header() {
            const stat_type = this.stats_display
            const state     = this.state
            switch (stat_type) {
                case "No Pokemon":   return 'Base Stats'
                case "DVs":          return `${this.starterName}'s DVs`
                case "EVs":          return 'Stat Experience'
                case "Detailed EVs": return 'Detailed Stat Experience'
                case "Automatic":    {
                    if (state == 'Base Stats') {
                        return `Base Stats`
                    }
                    return `Level ${this.mapper.properties.player.team[0].level.value}`
                }
                case "Badge Boosts": return 'Badge Boosts'
                case "Averages":     return 'Gen1 Average Stats'
                case "Medians":      return 'Gen1 Median Stats'
                case "Vitamins":     return 'Vitamins'
            }
        },
        growthRate() {
            var species = this.s1dynamicReset.species.value == 'Backport' 
            ? this.starterName 
            : this.s1dynamicReset.species.value;
            // debugger
            return PokeData.getSpecies(species ?? this.starterName).growth_rate
        },
    },
    methods: {
        base_stats(statPath) {
            return PokeData.getSpecies(this.starterName).base_stats[statPath];
        },
        usable_vitamins(stat_experience) { //stat exp ranges from 0 - 65535
            const vitaminsUsed = stat_experience / 2560;
            const usable_vitamins = Math.ceil(10 - vitaminsUsed);
            return usable_vitamins < 0 ? 0 : usable_vitamins;
        },
        calculate_crit_rate(pkmnData) {
            var baseSpeed = pkmnData?.base_stats.speed;
            if (baseSpeed) {
                return Math.round((Math.floor(baseSpeed/2)/256) * 10000) / 100
            }
            else {
                return PokeData.getSpecies(this.starterName).crit_rate
            }
        },
        average_median_stats(stat_label) {
            let sum = 0;
            let count = 0;
            let values = [];
            
            var completeDex = PokeData.getAllSpecies();
            for (let pokemon of Object.values(completeDex)) {
                // console.log(stat_label)
                let stat = pokemon[`base_stats`][stat_label];
                sum += stat;
                count++;
                values.push(stat);
            }
            
            let average = sum / count;
            
            values.sort((a, b) => a - b);
            let median;
            let midIndex = Math.floor(values.length / 2);
            
            if (values.length % 2 === 0) {
                median = (values[midIndex - 1] + values[midIndex]) / 2;
            } else {
                median = values[midIndex];
            }
            return {
                average: Math.round(average),
                median : Math.round(median),
            };
        },
        hp_dv(atk, def, spd, spc) {
            return (((atk % 2) * 8) + ((def % 2) * 4) + ((spd % 2) * 2) + ((spc % 2) * 1))
        },
        get_dv(stat_name) {
            const state = this.state
            let dv_atk = this.mapper.properties.player.team[0].dvAttack.value
            let dv_def = this.mapper.properties.player.team[0].dvDefense.value
            let dv_spc = this.mapper.properties.player.team[0].dvSpecial.value
            let dv_spe = this.mapper.properties.player.team[0].dvSpeed.value
            switch (stat_name) {
                case "Hp":
                    return this.hp_dv(dv_atk, dv_def, dv_spe, dv_spc)
                case "Attack":
                    return dv_atk
                case "Defense":
                    return dv_def
                case "Special":
                    return dv_spc
                case "Speed":
                    return dv_spe
            }
        },
        get_stat(stat_name) {
            const state = this.state
            if (state == `Overworld` || state == `To Battle`) {
                switch (stat_name) {
                    case "Hp":      return this.mapper.properties.player.team[0].maxHp.value
                    case "Attack":  return this.badge_boost(this.mapper.properties.player.badges.badge1.value, this.mapper.properties.player.team[0].attack.value)
                    case "Defense": return this.badge_boost(this.mapper.properties.player.badges.badge3.value, this.mapper.properties.player.team[0].defense.value)
                    case "Special": return this.badge_boost(this.mapper.properties.player.badges.badge7.value, this.mapper.properties.player.team[0].special.value)
                    case "Speed":   return this.badge_boost(this.mapper.properties.player.badges.badge5.value, this.mapper.properties.player.team[0].speed.value)
                }
            }
            if (state == `Battle` || state == `From Battle`) {
                switch (stat_name) {
                    case "Hp":      return this.mapper.properties.battle.yourPokemon.maxHp.value
                    case "Attack":  return this.mapper.properties.battle.yourPokemon.attack.value
                    case "Defense": return this.mapper.properties.battle.yourPokemon.defense.value
                    case "Special": return this.mapper.properties.battle.yourPokemon.special.value
                    case "Speed":   return this.mapper.properties.battle.yourPokemon.speed.value
                }
            }
            if (state == `Base Stats`) {
                const dexData = PokeData.getSpecies(this.starterName);
                switch (stat_name) {
                    case "Hp":      return dexData.base_stats.hp
                    case "Attack":  return dexData.base_stats.attack
                    case "Defense": return dexData.base_stats.defense
                    case "Special": return dexData.base_stats.special_attack
                    case "Speed":   return dexData.base_stats.speed
                }
            }
        },
        get_bb_stat(stat_name) {
            const state = this.state
            let boosting_badge = false
            let badge_boost_modifier = 0.125
            //assign stats and badges
            if (state != `Base Stats`) {
                switch (stat_name) {
                    case "Hp":              return 'N/A';
                    case "Attack":          { 
                        boosting_badge = this.mapper.properties.player.badges.badge1.value
                        switch (boosting_badge) {
                            case true:  return Math.floor(this.mapper.properties.player.team[0].attack.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                    case "Defense":         { 
                        boosting_badge = this.mapper.properties.player.badges.badge6.value
                        switch (boosting_badge) {
                            case true:  return Math.floor(this.mapper.properties.player.team[0].defense.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                    case "Speed":           { 
                        boosting_badge = this.mapper.properties.player.badges.badge3.value
                        switch (boosting_badge) {
                            case true:  return Math.floor(this.mapper.properties.player.team[0].speed.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                    case "Special":  { 
                        boosting_badge = this.mapper.properties.player.badges.badge7.value
                        switch (boosting_badge) {
                            case true:  return Math.floor(this.mapper.properties.player.team[0].special.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                }
            }
            if (state == `Base Stats`) {
                switch (stat_name) {
                    case "Hp":              return 0
                    case "Attack":          return 0
                    case "Defense":         return 0
                    case "Special Attack":  return 0
                    case "Special Defense": return 0
                    case "Speed":           return 0
                }
            }
        },
        badge_boost(badge, stat) {
            return badge ? Math.floor(stat * 1.125) : stat;
        },
        decimalToPercentage(decimal) {
            return Math.round(decimal * 100);
        },
        statLabelOpacity() {
            let default_opacity = .63
            let faded_opacity = .1
            let mod_atk = this.mapper.properties.battle.yourPokemon.modStageAttack.value != '0'  && this.state == 'Battle' ? faded_opacity : default_opacity
            let mod_def = this.mapper.properties.battle.yourPokemon.modStageDefense.value != '0' && this.state == 'Battle' ? faded_opacity : default_opacity
            let mod_spc = this.mapper.properties.battle.yourPokemon.modStageSpecial.value != '0' && this.state == 'Battle' ? faded_opacity : default_opacity
            let mod_spe = this.mapper.properties.battle.yourPokemon.modStageSpeed.value != '0'   && this.state == 'Battle' ? faded_opacity : default_opacity
            let object = {
                "Hp":      default_opacity,
                "Attack":  mod_atk,
                "Defense": mod_def,
                "Speed":   mod_spe,
                "Special": mod_spc,
            }
            return object
        },
        stringify_stage_modifiers(y) {
            if (y === null) {
                return " "
            }
            else
                if (y > 0) {
                    return "+" + y.toString()
                }
                else
                    if (y < 0) {
                        return y.toString()
                    }
                    else
                        return " "
        },
    },
    mounted() {
        this.mapper.properties.overworld.map.change((new_property, old_property) => {
            switch (new_property.value) {
                case "Celadon City - Department Store - 1F":
                case "Celadon City - Department Store - 2F":
                case "Celadon City - Department Store - 3F":
                case "Celadon City - Department Store - 4F":
                case "Celadon City - Department Store - 5F":
                case "Celadon City - Department Store - Roof":
                case "Celadon City - Department Store - Elevator":
                case "Cinnabar Mansion":
                case "Safari Zone (Center)":
                case "Safari Zone (East)":
                case "Safari Zone (North)":
                case "Safari Zone (West)":
                case "Safari Zone - Secret House":
                    this.$parent.stats_display = "Vitamins"
                    break
                case "Route 16": {
                    if (old_property.value == "Route 16 - House") {
                        this.$parent.stats_display = "Vitamins"
                        break
                    }
                }
                default:
                    this.$parent.stats_display = "Automatic"
                    break
            }
        })
    }
}