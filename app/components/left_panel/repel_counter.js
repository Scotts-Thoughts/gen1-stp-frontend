const Storage = require("../../logic/Storage.js");
const PubSub = require("../../logic/PubSub");

const template = /*html*/`
    <transition name="fade">
        <div v-if="show_repel_counter == true && state == 'Overworld' && mapper.properties.overworld.repelCount.value > 0 && top_left_ui_selector != 'Both'">
            <div class="colored-image saturation" :style="boxStyle"></div>
            <div class="repelLabel">repel steps</div>
            <div class="popUpsStyle repelSteps">{{ mapper.properties.overworld.repelCount.value }}</div>
        </div>
    </transition>
    <transition name="fade">
        <div v-if="show_repel_counter == true && state == 'Overworld' && mapper.properties.overworld.repelCount.value > 0 && top_left_ui_selector == 'Both'">
            <div class="colored-image saturation" :style="boxStyle"></div>
            <div class="repelLabel_1">repel steps</div>
            <div class="popUpsStyle repelSteps_1">{{ mapper.properties.overworld.repelCount.value }}</div>
        </div>
    </transition>
`

module.exports = {
    template,
    props: [
        "mapper",
        "state",
        "show_repel_counter",
        "top_left_ui_selector",
    ],
    computed: {
        boxStyle() {
            return this.top_left_ui_selector != 'Both'
                ? "--url: url(images/ui/repel.svg)"
                : "--url: url(images/ui/repel_2.svg)"
        }
    }
}