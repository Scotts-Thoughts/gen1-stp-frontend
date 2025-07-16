const template = /*html*/`
    <div>
        <div class="battle_summary_label">{{battle_summary_header}}</div>
        <table class="splits_table_old" cellspacing="0">
            <tr :style="{'background-color': \`var(--\${ui_type_color_modifier}\${starting_type_fix[1]})\`, 'outline': '2px solid #000'}">
                <td style="font-size: 16px; text-align: left; padding-left: 3px">Split</td>
                <td style="font-size: 16px; width: 110px; text-align: right;">{{previous_label}}</td>
                <td style="font-size: 16px; width: 110px; text-align: right;">{{current_label}}</td>
                <td style="font-size: 16px; width: 68px;  text-align: right; padding-right: 3px;">Diff</td>
            </tr>
            <tr v-for="split in compare_splits">
                <td style="font-size: 16px; width: 80px;  text-align: left; padding-left: 3px;">{{trainer_name_lookup.basic[split.trainer]?.trainer}}</td>
                <td style="font-size: 16px; width: 110px; text-align: right;">{{split.previous_time}}</td>
                <td style="font-size: 16px; width: 110px; text-align: right;">{{split.current_time}}</td>
                <td style="font-size: 16px; width: 68px;  text-align: right; padding-right: 3px;" :style="split_diff_color(split.difference)">{{split.difference}}</td>
            </tr>
        </table>
        <table class="battle_summary_table" cellspacing="0">
            <tr :style="{'background-color': \`var(--\${ui_type_color_modifier}\${starting_type_fix[1]})\`, 'outline': '2px solid #000'}">
                <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">Metric</td>
                <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">Value</td>
            </tr>
            <tr>
                <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">Battle Duration<br>(real-time)</td>
                <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">{{this.battle_duration != 0 ? this.battle_duration : "-"}}</td>
            </tr>
            <tr>
                <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">Experience Per Second</td>
                <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">{{this.exp_per_second != 0 ? this.exp_per_second : "-"}}</td>
            </tr>
            <tr v-for="stat in battle_summary.global">
                <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">{{stat.name}}</td>
                <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">{{this[stat.data_name] != 0 ? this[stat.data_name] : "-"}}</td>
            </tr>
            <tr :style="{'background-color': \`var(--\${ui_type_color_modifier}\${starting_type_fix[1]})\`, 'outline': '1px solid #000'}"><td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">Player:</td><td></td></tr>
            <tr v-for="stat in battle_summary.player">
                <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">{{stat.name}}</td>
                <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">{{this[stat.data_name] != 0 ? this[stat.data_name] : "-"}}</td>
            </tr>
            <tr :style="{'background-color': \`var(--\${ui_type_color_modifier}\${starting_type_fix[1]})\`, 'outline': '1px solid #000'}"><td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">Enemy:</td><td></td></tr>
            <tr v-for="stat in battle_summary.enemy">
                <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">{{stat.name}}</td>
                <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">{{this[stat.data_name] != 0 ? this[stat.data_name] : "-"}}</td>
            </tr>
        </table>
        <div class="colored-image ds" :style="'filter: saturate(\${ui_saturation})'" style="--url: url(ui/ui_splits.svg)"></div>
    </div>
`

module.exports = {
    template,
    props: [
        "ui_type_color_modifier",
        "starting_type_fix",
        "compare_splits",
        "trainer_name_lookup",
        "ui_saturation",
        "battle_summary_header",
        "previous_label",
        "current_label",
        "battle_duration",
        "exp_per_second",
        "battle_summary",
    ],
}