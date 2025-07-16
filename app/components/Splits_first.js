const template = /*html*/`
    <div>
        <table  class="splits_table" style="height: 960px;" cellspacing="0">
            <tbody>
                <tr :style="{'background-color': \`var(--\${starting_type_fix[1]})\`, 'outline': '2px solid #000'}">
                    <td style="font-size: 18px; padding-left: 3px">Split</td>
                    <td style="font-size: 18px; width: 180px;  text-align: left; padding-left: 3px;"></td>
                    <td style="font-size: 18px; width: 10px;  text-align: left; padding-left: 3px;"></td>
                    <td style="font-size: 18px; width: 10px;  text-align: left; padding-left: 3px;"></td>
                    <td style="font-size: 18px; width: 110px; text-align: right; padding-right: 3px;">Time</td>
                </tr>
                <tr v-for="split in compare_splits">
                    <td class="scaled_icon" style="font-size: 20px; width: 40px;  text-align: left;"><img :src="'images/split_images/' + trainer_name_lookup.basic[split.trainer]?.trainer + '.png'"></td>
                    <td style="font-size: 20px; width: 180px; text-align: left; padding-left: 3px;">{{trainer_name_lookup.detailed[split.trainer]?.trainer}}</td>
                    <td style="font-size: 20px; width: 10px;  text-align: left; padding-left: 3px;"></td>
                    <td style="font-size: 20px; width: 10px;  text-align: left; padding-left: 3px;"></td>
                    <td style="font-size: 20px; width: 110px; text-align: right; padding-right: 3px;">{{split.current_time}}</td>
                </tr>
            </tbody>
        </table>
        <div class="colored-image ds" :style="'filter: saturate(' + ui_saturation + ')'" style="--url: url(images/ui/movepool.svg)"></div>
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
    ],
}