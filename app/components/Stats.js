const template = /*html*/`
    <div class="statsContainer"> 
        <div :class="ui_stat_arrangement_modifier + 'critrate'">Crit rate: {{ g1CritRate(g1PokemonData[starterName]) }}%</div>
        <div>
            <div class="statsheader">{{stats_header}}</div>
            <div class="expLabelGen1">Exp:</div>
            <div v-for="stat in stat_object">
                <div v-if="stat.name != 'HP' && state == 'Battle'">
                    <div :class="'mod_style '+ui_stat_arrangement_modifier+'mod_'+stat.mod_abrv" style="font-family: play;">{{ stageModifiers(this.mapper?.properties?.battle?.yourPokemon['modStage'+stat.mod_path]) }}</div>
                </div>
                <div :style="{ opacity: statLabelOpacity()[stat.name]}" :class="'stat_label_style stat_row_' + stat[ui_stat_arrangement_modifier + 'label_row'] + ' stat_column_' + stat.label_column">{{stat.label}}</div>
                <div v-if="stats_display == 'Base Stats'"   :class="'stat_value_style stat_row_' + stat[ui_stat_arrangement_modifier + 'value_row'] + ' stat_column_' + stat.value_column">{{pokedex_yellow[starterName].base_stats[stat.base_stat_path]}}</div>
                <div v-if="stats_display == 'Averages'"     :class="'stat_value_style stat_row_' + stat[ui_stat_arrangement_modifier + 'value_row'] + ' stat_column_' + stat.value_column">{{average_median_stats(stat.base_stat_path).average}}</div>
                <div v-if="stats_display == 'Medians'"      :class="'stat_value_style stat_row_' + stat[ui_stat_arrangement_modifier + 'value_row'] + ' stat_column_' + stat.value_column">{{average_median_stats(stat.base_stat_path).median}}</div>
                <div v-if="stats_display == 'DVs'"          :class="'stat_value_style stat_row_' + stat[ui_stat_arrangement_modifier + 'value_row'] + ' stat_column_' + stat.value_column + ' dv'">{{get_dv(stat.name)}}/15</div>
                <div v-if="stats_display == 'EVs'"          :class="'stat_value_style stat_row_' + stat[ui_stat_arrangement_modifier + 'value_row'] + ' stat_column_' + stat.value_column + ' stat_exp'">{{mapper.properties.player.team[0]['statExp' + stat.name].value}}</div>
                <div v-if="stats_display == 'Automatic'"    :class="'stat_value_style stat_row_' + stat[ui_stat_arrangement_modifier + 'value_row'] + ' stat_column_' + stat.value_column">{{get_stat(stat.name)}}</div>
                
                <div v-if="stats_display == 'Detailed EVs'" :class="'stat_value_style stat_row_details_' + stat[ui_stat_arrangement_modifier + 'value_row'] + ' stat_column_' + stat.value_column + ' devs'"           >{{mapper.properties.player.team[0]['statExp' + stat.name].value}}/65535</div>
                <div v-if="stats_display == 'Detailed EVs'" :class="'stat_value_style stat_row_details_' + stat[ui_stat_arrangement_modifier + 'value_row'] + ' stat_column_' + stat.value_column + ' percentage_evs'" >{{decimalToPercentage(mapper.properties.player.team[0]['statExp' + stat.name].value / 65535) }}%</div>
                <div v-if="stats_display == 'Detailed EVs'" :class="'stat_value_style stat_row_details_' + stat[ui_stat_arrangement_modifier + 'value_row'] + ' stat_column_' + stat.value_column + ' ev_stats_gained'">Stats: {{Math.floor(Math.sqrt(mapper.properties.player.team[0]['statExp' + stat.name].value) / 4)}}</div>
                
                <div v-if="stats_display == 'Badge Boosts'" :class="'stat_value_style stat_row_details_' + stat[ui_stat_arrangement_modifier + 'value_row'] + ' stat_column_' + stat.value_column + ' devs'"           >Stat: {{mapper.properties.player.team[0][stat.path].value}}</div>
                <div v-if="stats_display == 'Badge Boosts'" :class="'stat_value_style stat_row_details_' + stat[ui_stat_arrangement_modifier + 'value_row'] + ' stat_column_' + stat.value_column + ' percentage_evs'" >Boost: {{get_bb_stat(stat.name)}}</div>
                <div v-if="stats_display == 'Badge Boosts'" :class="'stat_value_style stat_row_details_' + stat[ui_stat_arrangement_modifier + 'value_row'] + ' stat_column_' + stat.value_column + ' ev_stats_gained'">Increase: {{(get_stat(stat.name) - mapper.properties.player.team[0][stat.path].value) / mapper.properties.player.team[0][stat.path].value}}%</div>
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
        "starter",
        "stats_display",
        "pokedex_old",
        "pokedex_yellow",
        "display_badge_boosts",
        "dynamic_mon",
    ],
    data() {
        return {
            starterName: this.starter,
            g1PokemonData: this.pokedex_old,
            s1dynamicReset: this.dynamic_mon,
            stat_object: [
                {abrv: "HP",  name: "Hp",      label: "HP",   path: "maxHp",   base_stat_path: "hp",             mod_path: "Hp",      mod_abrv: "hp",  hp_spe_label_row: 1, hp_spd_label_row: 1, label_column: 1, hp_spe_value_row: 1, hp_spd_value_row: 1, value_column: 2,}, 
                {abrv: "Atk", name: "Attack",  label: "Atk.", path: "attack",  base_stat_path: "attack",         mod_path: "Attack",  mod_abrv: "atk", hp_spe_label_row: 2, hp_spd_label_row: 2, label_column: 1, hp_spe_value_row: 2, hp_spd_value_row: 2, value_column: 2,}, 
                {abrv: "Def", name: "Defense", label: "Def.", path: "defense", base_stat_path: "defense",        mod_path: "Defense", mod_abrv: "def", hp_spe_label_row: 3, hp_spd_label_row: 3, label_column: 1, hp_spe_value_row: 3, hp_spd_value_row: 3, value_column: 2,}, 
                {abrv: "Spc", name: "Special", label: "Spc.", path: "special", base_stat_path: "special_attack", mod_path: "Special", mod_abrv: "spc", hp_spe_label_row: 2, hp_spd_label_row: 2, label_column: 3, hp_spe_value_row: 2, hp_spd_value_row: 2, value_column: 4,}, 
                {abrv: "Spe", name: "Speed",   label: "Spe.", path: "speed",   base_stat_path: "speed",          mod_path: "Speed",   mod_abrv: "spe", hp_spe_label_row: 3, hp_spd_label_row: 1, label_column: 3, hp_spe_value_row: 3, hp_spd_value_row: 1, value_column: 4,}, 
            ],
            ui_stat_arrangement_modifier: "hp_spd_", //deprecated, remove
        }
    },
    computed: {
        stats_header() {
            const stat_type = this.stats_display
            const state     = this.state
            switch (stat_type) {
                case "Base Stats":   return `Base Stats`
                case "DVs":          return `${this.starterName}'s DVs`
                case "EVs":          return `Stat Experience`
                case "Detailed EVs": return `Detailed Stat Experience`
                case "Automatic":    {
                    if (state == 'Base Stats') {
                        return `Base Stats`
                    }
                    return `Level ${this.mapper.properties.player.team[0].level.value}`
                }
                case "Badge Boosts": return `Badge Boosts`
                case "Averages":     return `Gen1 Average Stats`
                case "Medians":      return `Gen1 Median Stats`
            }
        },
        growthRate() {
            var species = this.s1dynamicReset.species.value == 'Backport' ? this.starterName : this.s1dynamicReset.species.value
            // debugger
            return this.g1PokemonData[species ?? this.starterName].growth_rate
        },
    },
    methods: {
        g1CritRate(pkmnData) {
            var baseSpeed = pkmnData?.base_spd
            if (baseSpeed) {
                return Math.round((Math.floor(baseSpeed/2)/256) * 10000) / 100
            }
            else {
                return this.g1PokemonData[this.starterName].crit_rate
            }
        },
        average_median_stats(stat_label) {
            let sum = 0;
            let count = 0;
            let values = [];
            
            for (let pokemon of Object.values(this.pokedex_yellow)) {
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
                switch (stat_name) {
                    case "Hp":      return this.pokedex_yellow[this.starterName].base_stats.hp
                    case "Attack":  return this.pokedex_yellow[this.starterName].base_stats.attack
                    case "Defense": return this.pokedex_yellow[this.starterName].base_stats.defense
                    case "Special": return this.pokedex_yellow[this.starterName].base_stats.special_attack
                    case "Speed":   return this.pokedex_yellow[this.starterName].base_stats.speed
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
            if (this.display_badge_boosts == false) { return stat }
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
        stageModifiers(y) {
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
    }
}