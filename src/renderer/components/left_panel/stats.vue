<template>
    <div class="statsContainer"> 
        <div class="critrate">Crit rate: {{ crit_rate }}%</div>
        <div>
            <div class="statsheader">{{stats_header}} </div>
            <div class="expLabelGen1">Exp:</div>
            <div v-for="stat in stat_object" class="stat">
                <div v-if="stat.name != 'Hp' && meta.gameState == 'Battle'" class="stat_label mod_style">{{ mod_stage_label(game_properties.battle.yourPokemon['modStage'+stat.mod_path]) }}</div>
                <div :style="{ opacity: statLabelOpacity()[stat.name]}" class="stat_label">{{stat.label}}</div>
                
                <div v-if="display_mode == 'Base Stats'"   class="stat_value">{{base_stats(stat.base_stat_key)}}</div>
                <div v-if="display_mode == 'Averages'"     class="stat_value">{{average_stats(stat.base_stat_key).mean}}</div>
                <div v-if="display_mode == 'Medians'"      class="stat_value">{{average_stats(stat.base_stat_key).median}}</div>
                <div v-if="display_mode == 'DVs'"          class="stat_value dv">{{get_dv(stat.name)}}/15</div>
                <div v-if="display_mode == 'EVs'"          class="stat_value stat_exp">{{game_properties.player.team[0]['statExp' + stat.name].value}}</div>
                <div v-if="display_mode == 'Automatic'"    class="stat_value">{{get_stat(stat.name)}}</div>
                
                <div v-if="display_mode == 'Vitamins'"     class="stat_value stat_multi_line devs2"           ><span style="opacity: .7;">{{stat.vitamin}}</span></div>
                <div v-if="display_mode == 'Vitamins'"     class="stat_value stat_multi_line percentage_evs2" style="font-size: 21px;"><span style="font-size: 31px;">{{usable_vitamins(game_properties.player.team[0][stat.statExpPath].value)}}</span><span style="font-size: 15px;">/10</span></div>
                <div v-if="display_mode == 'Vitamins'"     class="stat_value stat_multi_line ev_stats_gained2">{{game_properties.player.team[0]['statExp' + stat.name].value}}<span style="font-size: 13px;">/65535</span></div>
                
                <div v-if="display_mode == 'Detailed EVs'" class="stat_value stat_multi_line devs"           >{{game_properties.player.team[0]['statExp' + stat.name].value}}/65535</div>
                <div v-if="display_mode == 'Detailed EVs'" class="stat_value stat_multi_line percentage_evs" >{{decimalToPercentage(game_properties.player.team[0]['statExp' + stat.name].value / 65535) }}%</div>
                <div v-if="display_mode == 'Detailed EVs'" class="stat_value stat_multi_line ev_stats_gained">Stats: {{Math.floor(Math.sqrt(game_properties.player.team[0]['statExp' + stat.name].value) / 4)}}</div>
                
                <div v-if="display_mode == 'Badge Boosts'" class="stat_value stat_multi_line devs"           >Stat: {{game_properties.player.team[0][stat.path].value}}</div>
                <div v-if="display_mode == 'Badge Boosts'" class="stat_value stat_multi_line percentage_evs" >Boost: {{get_bb_stat(stat.name)}}</div>
                <div v-if="display_mode == 'Badge Boosts'" class="stat_value stat_multi_line ev_stats_gained">+{{(get_stat(stat.name) - game_properties.player.team[0][stat.path].value) / game_properties.player.team[0][stat.path].value*100}}%</div>
            </div>
        </div>
        <div class="exp_growthRate">{{ growthRate }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import PokeData from "~/logic/PokeData";
import { useOverlaySettingsStore } from "~/stores/useOverlaySettingsStore";
import { StatsPanelMode } from "~/stores/types/StatsPanelMode";
import { useMetaStore } from "~/stores/metaStore";
import { GameState } from "~/stores/types/GameState";
import { GameHookProperty } from "~/packages/gameHookMapperClient";
import { BaseStats, GrowthRate } from "~/logic/PokeDataTypes";

type StatObject = {
    /** 
     * Name of the stat. Used as a partial path for some poke-a-byte properties.
     * Also used for identification in various calculations made in the component. 
     */
    name: "Hp" | "Speed" | "Attack" | "Special" | "Defense", 
    /** Label displayed for the stat. */
    label: string, 
    /** Partial path for the poke-a-byte property holding the stats value. */
    path: string, 
    /** Key of the stat in the {@link BaseStats} object from the pokedex data (see also {@link PokeData.getSpecies}) */
    base_stat_key: keyof BaseStats, 
    /** Partial path for the poke-a-byte property holding the stats stage modifier. */
    mod_path: string, 
    /** Partial path for the poke-a-byte property holding the stat experience value. */
    statExpPath: string,
    /** Name of the vitamin that boosts the stats stat experience. */
    vitamin: string
};

export default defineComponent({
    data() {
        return {
            /** Provided by the `frontend` component. */
            game_properties: inject<Record<string, GameHookProperty>>("game_properties", {}),
            meta: useMetaStore(),
            settings: useOverlaySettingsStore(),
            stat_object: [
                { name: "Hp",      label: "HP",   path: "maxHp",   base_stat_key: "hp" ,            mod_path: "Hp",      statExpPath: "statExpHp",      vitamin: "HP Up",  }, 
                { name: "Speed",   label: "Spe.", path: "speed",   base_stat_key: "speed",          mod_path: "Speed",   statExpPath: "statExpSpeed",   vitamin: "Carbos", }, 
                { name: "Attack",  label: "Atk.", path: "attack",  base_stat_key: "attack",         mod_path: "Attack",  statExpPath: "statExpAttack",  vitamin: "Protein",}, 
                { name: "Special", label: "Spc.", path: "special", base_stat_key: "special_attack", mod_path: "Special", statExpPath: "statExpSpecial", vitamin: "Calcium",}, 
                { name: "Defense", label: "Def.", path: "defense", base_stat_key: "defense",        mod_path: "Defense", statExpPath: "statExpDefense", vitamin: "Iron",   }, 
            ] as StatObject[],
        }
    },
    computed: {
        display_mode(): StatsPanelMode {
            return this.settings.left_panel.stats.mode;
        },
        /** Provides the criticial hit rate of the current pokemon. */
        crit_rate() {
            var baseSpeed = PokeData.getSpecies(this.meta.currentSpecies)?.base_stats.speed;
            if (baseSpeed) {
                return Math.round((Math.floor(baseSpeed/2)/256) * 10000) / 100
            } else {
                return 0;
            }
        },
        stats_header(): string {
            switch (this.settings.left_panel.stats.mode) {
                case "Base Stats":   return 'Base Stats'
                case "DVs":          return `${this.meta.starter}'s DVs`
                case "EVs":          return 'Stat Experience'
                case "Detailed EVs": return 'Detailed Stat Experience'
                case "Automatic":    {
                    if (this.meta.gameState === GameState.no_pokemon) {
                        return `Base Stats`
                    }
                    return `Level ${this.game_properties.player.team[0].level.value}`
                }
                case "Badge Boosts": return 'Badge Boosts'
                case "Averages":     return 'Gen1 Average Stats'
                case "Medians":      return 'Gen1 Median Stats'
                case "Vitamins":     return 'Vitamins'
                default:             return 'Base Stats'
            }
        },
        /** Provides the growth rate of the current pokemon. */
        growthRate(): GrowthRate {
            return PokeData.getSpecies(this.meta.currentSpecies).growth_rate;
        },
    },
    methods: {
        /** Get the specified base stat of the currently selected starter. */
        base_stats(statPath: keyof BaseStats) {
            return PokeData.getSpecies(this.meta.starter).base_stats[statPath];
        },
        /** Calculate the number of vitamins that can still be used for the given stat experience value. */
        usable_vitamins(stat_experience: number) { 
            // stat exp ranges from 0 - 65535
            const vitaminsUsed = stat_experience / 2560;
            return Math.max(0, Math.ceil(10 - vitaminsUsed));
        },
        /** Calculate the mean ("average") and median of the given state for all pokemon species in the current game. */
        average_stats(stat_key: keyof BaseStats): { mean: number, median: number } {
            let sum = 0;
            let count = 0;
            let values: number[] = [];
            
            var completeDex = PokeData.getAllSpecies();
            for (let pokemon of Object.values(completeDex)) {
                let stat = pokemon.base_stats[stat_key];
                sum += stat;
                count++;
                values.push(stat);
            }
            
            values.sort((a, b) => a - b);
            let median: number;
            let midIndex = Math.floor(values.length / 2);
            
            if (values.length % 2 === 0) {
                median = (values[midIndex - 1] + values[midIndex]) / 2;
            } else {
                median = values[midIndex];
            }
            return {
                mean: Math.round(sum / count),
                median : Math.round(median),
            };
        },
        /** Calculate the HP determinate value based on the values of the other DVs. */
        hp_dv(attack: number, defense: number, speed: number, special: number): number {
            return (((attack % 2) * 8) + ((defense % 2) * 4) + ((speed % 2) * 2) + ((special % 2) * 1))
        },
        get_dv(stat_name) {
            let dv_atk = this.game_properties.player.team[0].dvAttack.value
            let dv_def = this.game_properties.player.team[0].dvDefense.value
            let dv_spc = this.game_properties.player.team[0].dvSpecial.value
            let dv_spe = this.game_properties.player.team[0].dvSpeed.value
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
            if (this.meta.gameState == GameState.overworld || this.meta.gameState == GameState.to_battle) {
                switch (stat_name) {
                    case "Hp":      return this.game_properties.player.team[0].maxHp.value
                    case "Attack":  return this.badge_boost(this.game_properties.player.badges.badge1.value, this.game_properties.player.team[0].attack.value)
                    case "Defense": return this.badge_boost(this.game_properties.player.badges.badge3.value, this.game_properties.player.team[0].defense.value)
                    case "Special": return this.badge_boost(this.game_properties.player.badges.badge7.value, this.game_properties.player.team[0].special.value)
                    case "Speed":   return this.badge_boost(this.game_properties.player.badges.badge5.value, this.game_properties.player.team[0].speed.value)
                }
            }
            if (this.meta.gameState == GameState.in_battle || this.meta.gameState == GameState.from_battle) {
                switch (stat_name) {
                    case "Hp":      return this.game_properties.battle.yourPokemon.maxHp.value
                    case "Attack":  return this.game_properties.battle.yourPokemon.attack.value
                    case "Defense": return this.game_properties.battle.yourPokemon.defense.value
                    case "Special": return this.game_properties.battle.yourPokemon.special.value
                    case "Speed":   return this.game_properties.battle.yourPokemon.speed.value
                }
            }
            if (this.meta.gameState === GameState.no_pokemon) {
                const dexData = PokeData.getSpecies(this.meta.starter);
                switch (stat_name) {
                    case "Hp":      return dexData.base_stats.hp
                    case "Attack":  return dexData.base_stats.attack
                    case "Defense": return dexData.base_stats.defense
                    case "Special": return dexData.base_stats.special_attack
                    case "Speed":   return dexData.base_stats.speed
                }
            }
        },
        get_bb_stat(stat_name): number | "N/A" {
            let boosting_badge = false
            let badge_boost_modifier = 0.125
            //assign stats and badges
            if (this.meta.gameState !== GameState.no_pokemon) {
                switch (stat_name) {
                    case "Hp":              return 'N/A';
                    case "Attack":          { 
                        boosting_badge = this.game_properties.player.badges.badge1.value
                        switch (boosting_badge) {
                            case true:  return Math.floor(this.game_properties.player.team[0].attack.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                    case "Defense":         { 
                        boosting_badge = this.game_properties.player.badges.badge6.value
                        switch (boosting_badge) {
                            case true:  return Math.floor(this.game_properties.player.team[0].defense.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                    case "Speed":           { 
                        boosting_badge = this.game_properties.player.badges.badge3.value
                        switch (boosting_badge) {
                            case true:  return Math.floor(this.game_properties.player.team[0].speed.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                    case "Special":  { 
                        boosting_badge = this.game_properties.player.badges.badge7.value
                        switch (boosting_badge) {
                            case true:  return Math.floor(this.game_properties.player.team[0].special.value * badge_boost_modifier)
                            case false: return 0
                        }
                    }
                }
            }
            if (this.meta.gameState === GameState.no_pokemon) {
                switch (stat_name) {
                    case "Hp":              return 0
                    case "Attack":          return 0
                    case "Defense":         return 0
                    case "Special Attack":  return 0
                    case "Special Defense": return 0
                    case "Speed":           return 0
                }
            }
            return 0;
        },
        badge_boost(badge: boolean, stat: number): number {
            return badge ? Math.floor(stat * 1.125) : stat;
        },
        decimalToPercentage(decimal: number): number {
            return Math.round(decimal * 100);
        },
        statLabelOpacity() {
            let default_opacity = .63
            let faded_opacity = .1
            const result = {
                Hp:      default_opacity,
                Attack:  default_opacity,
                Defense: default_opacity,
                Speed:   default_opacity,
                Special: default_opacity,
            }
            if (this.meta.gameState == GameState.in_battle) {
                if (this.game_properties.battle.yourPokemon.modStageAttack.value != '0') {
                    result.Attack = faded_opacity;
                }
                if (this.game_properties.battle.yourPokemon.modStageDefense.value != '0') {
                    result.Defense = faded_opacity;
                }
                if (this.game_properties.battle.yourPokemon.modStageSpeed.value != '0') {
                    result.Speed = faded_opacity;
                }
                if (this.game_properties.battle.yourPokemon.modStageSpecial.value != '0') {
                    result.Special = faded_opacity;
                }
            }
            return result;                
        },
        /** Converts the mod stage value to `" "` for 0 or null or a signed number string otherwise. */
        mod_stage_label(property: GameHookProperty): string {
            if (!property || property.value === "0") {
                return " ";
            }
            if (parseInt(property.value) > 0) {
                return "+" + property.value;
            }
            return property.value;
        },
    },
    mounted() {
        this.game_properties.overworld.map.change((new_property: GameHookProperty, old_property: GameHookProperty) => {
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
                    this.settings.setStatsPanelMode(StatsPanelMode.vitamins);
                    break
                case "Route 16": {
                    if (old_property.value == "Route 16 - House") {
                        this.settings.setStatsPanelMode(StatsPanelMode.vitamins);
                        break
                    }
                }
                default:
                    this.settings.setStatsPanelMode(StatsPanelMode.automatic);
                    break
            }
        })
    }
});
</script>