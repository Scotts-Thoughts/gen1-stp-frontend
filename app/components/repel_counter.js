const template = /*html*/`
    <transition name="fade">
        <div v-if="show_repel_counter == true && state == 'Overworld' && mapper.properties.overworld.repelCount.value > 0 && blackouts_resets != 'Both'">
            <div class="colored-image" :style="'filter: saturate(\${ui_saturation})'" style="--url: url(images/ui/repel.svg)"></div>
            <div class="repelLabel">repel steps</div>
            <div class="popUpsStyle repelSteps">{{ mapper.properties.overworld.repelCount.value }}</div>
        </div>
    </transition>
    <transition name="fade">
        <div v-if="show_repel_counter == true && state == 'Overworld' && mapper.properties.overworld.repelCount.value > 0 && blackouts_resets == 'Both'">
            <div class="colored-image" :style="'filter: saturate(\${ui_saturation})'" style="--url: url(images/ui/repel_2.svg)"></div>
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
        "ui_saturation",
        "show_repel_counter",
        "blackouts_resets",
    ]
}