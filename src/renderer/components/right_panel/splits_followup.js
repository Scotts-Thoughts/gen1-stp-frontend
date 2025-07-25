import { defineComponent } from "vue";
import PokeData from "~/logic/PokeData";
import { useMetaStore } from "~/stores/metaStore";

const template = /*html*/`
    <div>
        <table style="height: 960px;" class="splits_table" cellspacing="0">
            <tbody>
                <tr :style="{'background-color': \`var(--\${starter_type_2})\`, 'outline': '2px solid #000'}">
                    <td style="font-size: 18px; padding-left: 3px">Split</td>
                    <td style="font-size: 18px; width: 80px;  text-align: left; padding-left: 3px;"></td>
                    <td style="font-size: 18px; width: 110px; text-align: right;">{{previous_label}}</td>
                    <td style="font-size: 18px; width: 110px; text-align: right;">{{current_label}}</td>
                    <td style="font-size: 18px; width: 68px;  text-align: right; padding-right: 3px;">Diff</td>
                </tr>
                <tr v-for="split in compare_splits">
                    <td class="scaled_icon" style="font-size: 18px; width: 40px;  text-align: left;"><img :src="'images/split_images/' + trainer_name_lookup.basic[split.trainer]?.trainer + '.png'"></td>
                    <td style="font-size: 18px; width: 80px;  text-align: left; padding-left: 3px;">{{trainer_name_lookup.basic[split.trainer]?.trainer}}</td>
                    <td style="font-size: 18px; width: 110px; text-align: right;">{{split.previous_time}}</td>
                    <td style="font-size: 18px; width: 110px; text-align: right;">{{split.current_time}}</td>
                    <td style="font-size: 18px; width: 68px;  text-align: right; padding-right: 3px;" :style="split_diff_color(split.difference)">{{split.difference}}</td>
                </tr>
            </tbody>
        </table>
        <div class="tinted-box" style="--url: url(../images/ui/movepool.svg)"></div>
    </div>
`

export default defineComponent({
    template,
    props: [
        "compare_splits",
        "trainer_name_lookup",
        "previous_label",
        "current_label",
    ],
    data() {
        return { meta: useMetaStore() };
    },
    methods: {
        split_diff_color(difference_string) {
            if (difference_string === "-")          { return "color: black" }
            if (difference_string === "+0:00")      { return "color: black" }
            if (difference_string.charAt(0) == "+") { return "color: red" }
            if (difference_string.charAt(0) == "-") { return "color: green" }
        },
    },
    computed: {
        starter_type_2() {
            return PokeData.getSpecies(this.meta.starter).type_2.toLowerCase();
        }
    }
});