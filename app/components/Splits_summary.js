const template = /*html*/`
    <div>
        <div class="battle_summary_label">{{battle_summary_header}}</div>
        <table class="splits_table_old" cellspacing="0">
            <tbody>
                <tr :style="{'background-color': \`var(--\${starting_type_fix[1]})\`, 'outline': '2px solid #000'}">
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
            </tbody>
        </table>
        <table class="battle_summary_table" cellspacing="0">
            <tbody>
                <tr :style="{'background-color': \`var(--\${starting_type_fix[1]})\`, 'outline': '2px solid #000'}">
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
                <tr :class="\`background-\${starting_type_fix[1]}\`" style="outline: 1px solid #000">
                    <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">Player:</td>
                    <td></td>
                </tr>
                <tr v-for="stat in battle_summary.player">
                    <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">{{stat.name}}</td>
                    <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">{{this[stat.data_name] != 0 ? this[stat.data_name] : "-"}}</td>
                </tr>
                <tr :class="\`background-\${starting_type_fix[1]}\`" style="outline: 1px solid #000">
                    <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">Enemy:</td>
                    <td></td>
                </tr>
                <tr v-for="stat in battle_summary.enemy">
                    <td style="font-size: 16px; width: 184px;  text-align: left; padding-left: 3px;">{{stat.name}}</td>
                    <td style="font-size: 16px; width: 184px; text-align: right; padding-right: 3px;">{{this[stat.data_name] != 0 ? this[stat.data_name] : "-"}}</td>
                </tr>
            </tbody>
        </table>
        <div class="colored-image ds saturation" style="--url: url(ui/ui_splits.svg)"></div>
    </div>
`

module.exports = {
    template,
    props: [
        "starting_type_fix",
        "compare_splits",
        "trainer_name_lookup",
        "battle_summary_header",
        "previous_label",
        "current_label",
        "battle_duration",
        "exp_per_second",
        "battle_summary",
        "battle_summary_frames",
        "battle_summary_battle_number",
        "battle_summary_exp_gained",
        "battle_summary_turns",
        "battle_summary_player_turns",
        "battle_summary_enemy_turns",
        "battle_summary_player_hits",
        "battle_summary_player_misses",
        "battle_summary_player_crits",
        "battle_summary_player_ohkos",
        "battle_summary_enemy_hits",
        "battle_summary_enemy_misses",
        "battle_summary_enemy_crits",
        "battle_summary_enemy_ohkos",
        "battle_summary_player_Sx",
        "battle_summary_player_4x",
        "battle_summary_player_2x",
        "battle_summary_player_1x",
        "battle_summary_player_Hx",
        "battle_summary_player_Qx",
        "battle_summary_player_0x",
        "battle_summary_player_con",
        "battle_summary_player_par",
        "battle_summary_player_brn",
        "battle_summary_player_frz",
        "battle_summary_player_psn",
        "battle_summary_player_bpn",
        "battle_summary_player_slp",
        "battle_summary_enemy_Sx",
        "battle_summary_enemy_4x",
        "battle_summary_enemy_2x",
        "battle_summary_enemy_1x",
        "battle_summary_enemy_Hx",
        "battle_summary_enemy_Qx",
        "battle_summary_enemy_0x",
        "battle_summary_enemy_con",
        "battle_summary_enemy_par",
        "battle_summary_enemy_brn",
        "battle_summary_enemy_frz",
        "battle_summary_enemy_psn",
        "battle_summary_enemy_bpn",
        "battle_summary_enemy_slp",
    ],
    methods: {
        split_diff_color(difference_string) {
            if (difference_string === "-")          { return "color: black" }
            if (difference_string === "+0:00")      { return "color: black" }
            if (difference_string.charAt(0) == "+") { return "color: red" }
            if (difference_string.charAt(0) == "-") { return "color: green" }
        },
    }
}