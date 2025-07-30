import { defineComponent } from "vue";
import PokeData from "~/logic/PokeData";
import { useMetaStore } from "~/stores/metaStore";

const template = /*html*/`
    <div>
        <table  class="splits_table" style="height: 960px;" cellspacing="0">
            <tbody>
                <tr :style="{'background-color': \`var(--\${starter_type_2})\`, 'outline': '2px solid #000'}">
                    <td style="font-size: 18px; padding-left: 3px">Split</td>
                    <td style="font-size: 18px; width: 180px;  text-align: left; padding-left: 3px;"></td>
                    <td style="font-size: 18px; width: 10px;  text-align: left; padding-left: 3px;"></td>
                    <td style="font-size: 18px; width: 10px;  text-align: left; padding-left: 3px;"></td>
                    <td style="font-size: 18px; width: 110px; text-align: right; padding-right: 3px;">Time</td>
                </tr>
                <tr v-for="split in first_splits">
                    <td class="scaled_icon" style="font-size: 20px; width: 40px;  text-align: left;"><img :src="'images/split_images/' + trainer_name_lookup.basic[split.trainer]?.trainer + '.png'"></td>
                    <td style="font-size: 20px; width: 180px; text-align: left; padding-left: 3px;">{{trainer_name_lookup.detailed[split.trainer]?.trainer}}</td>
                    <td style="font-size: 20px; width: 10px;  text-align: left; padding-left: 3px;"></td>
                    <td style="font-size: 20px; width: 10px;  text-align: left; padding-left: 3px;"></td>
                    <td style="font-size: 20px; width: 110px; text-align: right; padding-right: 3px;">{{split.current_time}}</td>
                </tr>
            </tbody>
        </table>
        <div class="tinted-box" style="--url: url(../images/ui/movepool.svg)"></div>
    </div>
`

export default defineComponent({
    template,
    props: [
        "current_splits",
        "trainer_name_lookup",
    ],
    inject: ["game_properties"],
    data() {
        return { meta: useMetaStore() };
    },
    computed: {
        first_splits() {
            const game = this.game_properties.meta.gameName.value;
            const optional = ["Rival1a-Route 22"];
            const completedSplits = this.current_splits
                .filter(split => split_trainers[game].includes(split.trainer))
                .map(split => { return { trainer: split.trainer, current_time: split.time } });
            const upcomingSplits = split_trainers[game]
                .filter(trainer => !optional.includes(trainer))
                .filter(trainer => !completedSplits.some(split => split.trainer === trainer))
                .map(x => ({ trainer: x, current_time: "-" }));
            return [
                ...completedSplits,
                ...upcomingSplits
            ];
        },
        starter_type_2() {
            return PokeData.getSpecies(this.meta.starter)?.type_2.toLowerCase();
        }
    }
});