<template>
    <div>
        <div class="battle_summary_label">{{battle_summary_header}}</div>
        <table class="splits_table_old" cellspacing="0">
            <tbody>
                <tr :style="{'background-color': `var(--${starter_type_2})`, 'outline': '2px solid #000'}">
                    <td style="font-size: 16px; text-align: left; padding-left: 3px">Split</td>
                    <td style="font-size: 16px; width: 110px; text-align: right;">{{runConfig.config.labels.split_previous}}</td>
                    <td style="font-size: 16px; width: 110px; text-align: right;">{{runConfig.config.labels.split_current}}</td>
                    <td style="font-size: 16px; width: 68px;  text-align: right; padding-right: 3px;">Diff</td>
                </tr>
                <tr v-for="split in compare_splits">
                    <td style="font-size: 16px; width: 80px;  text-align: left; padding-left: 3px;">{{trainer_name_lookup.basic[split.trainer]?.trainer}}</td>
                    <td style="font-size: 16px; width: 110px; text-align: right;">{{split.previous_time}}</td>
                    <td style="font-size: 16px; width: 110px; text-align: right;">{{split.current_time}}</td>
                    <td style="font-size: 16px; width: 68px;  text-align: right; padding-right: 3px;" :style="split_diff_color(split.difference)">{{split.difference}}</td>
                </tr>
            </tbody>
        </table>
        <table class="battle_summary_table" cellspacing="0">
            <tbody>
                <tr :style="{'background-color': `var(--${starter_type_2})`, 'outline': '2px solid #000'}">
                    <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">Metric</td>
                    <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">Value</td>
                </tr>
                <tr>
                    <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">Battle Duration<br>(real-time)</td>
                    <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">{{battle.statistics.battle_duration ? battle.statistics.battle_duration : "-"}}</td>
                </tr>
                <tr>
                    <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">Experience Per Second</td>
                    <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">{{battle.statistics.exp_per_second != 0 ? battle.statistics.exp_per_second : "-"}}</td>
                </tr>
                <tr v-for="stat in global_stats">
                    <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">{{stat.name}}</td>
                    <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">{{battle.statistics[stat.data_name] != 0 ? battle.statistics[stat.data_name] : "-"}}</td>
                </tr>
                <tr :class="`background-${starter_type_2}`" style="outline: 1px solid #000">
                    <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">Player:</td>
                    <td></td>
                </tr>
                <tr v-for="stat in player_stats">
                    <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">{{stat.name}}</td>
                    <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">{{battle.statistics[stat.data_name] != 0 ? battle.statistics[stat.data_name] : "-"}}</td>
                </tr>
                <tr :class="`background-${starter_type_2}`" style="outline: 1px solid #000">
                    <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">Enemy:</td>
                    <td></td>
                </tr>
                <tr v-for="stat in enemy_stats">
                    <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">{{stat.name}}</td>
                    <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">{{battle.statistics[stat.data_name] != 0 ? battle.statistics[stat.data_name] : "-"}}</td>
                </tr>
            </tbody>
        </table>
        <div class="tinted-box" style="--url: url(../images/ui/ui_splits.svg)"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { battle_summary } from "~/autosplitter/battle_summary";
import PokeData from "~/logic/PokeData";
import { useMetaStore } from "~/stores/metaStore";
import { useBattleStore } from "~/stores/useBattleStore";
import { useGameSpeciesData } from "~/stores/useGameSpeciesData";
export default defineComponent({
    props: [
        "compare_splits",
        "trainer_name_lookup",
        "battle_summary_header",
    ],
    data() {
        return {
            runConfig: useGameSpeciesData(),
            battle: useBattleStore(),
            meta: useMetaStore(),
            global_stats: battle_summary.global,
            player_stats: battle_summary.player,
            enemy_stats: battle_summary.enemy,
        }
    },
    methods: {
        split_diff_color(difference: string) {
            if (difference === "-")          { return "color: black" }
            if (difference === "+0:00")      { return "color: black" }
            if (difference.charAt(0) == "+") { return "color: red" }
            if (difference.charAt(0) == "-") { return "color: green" }
            return "";
        },
    },
    computed: {
        starter_type_2() {
            return PokeData.getSpecies(this.meta.starter).type_2.toLowerCase();
        }
    }
});
</script>