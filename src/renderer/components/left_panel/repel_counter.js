import { defineComponent } from "vue";
import { useSpeciesMetricsStore } from "../../stores/useSpeciesMetricsStore.js";
import { useOverlaySettingsStore } from "../../stores/useOverlaySettingsStore.js";
import { GameState, useMetaStore } from "../../stores/metaStore.js";
const template = /*html*/`
    <div v-if="display">
        <transition name="fade">
            <div v-if="metrics.faultsMode != 'Both'">
                <div class="tinted-box" :style="boxStyle"></div>
                <div class="repelLabel">repel steps</div>
                <div class="popUpsStyle repelSteps">{{ repelCount }}</div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="metrics.faultsMode == 'Both'">
                <div class="tinted-box" :style="boxStyle"></div>
                <div class="repelLabel_1">repel steps</div>
                <div class="popUpsStyle repelSteps_1">{{ repelCount }}</div>
            </div>
        </transition>
    </div>
`

export default defineComponent({
    template,
    inject: [ "game_properties" ],
    data() {
        return { 
            meta: useMetaStore(),
            settigns: useOverlaySettingsStore(), 
            metrics: useSpeciesMetricsStore() 
        }
    },
    computed: {
        display() {
            return this.settigns.pop_ups.repel.enabled
                && this.meta.gameState === GameState.overworld 
                && this.repelCount > 0;
        },
        repelCount() {
            return this.game_properties.overworld.repelCount.value;
        },
        boxStyle() {
            return this.metrics.faultsMode != 'Both'
                ? "--url: url(../images/ui/repel.svg)"
                : "--url: url(../images/ui/repel_2.svg)"
        }
    }
});