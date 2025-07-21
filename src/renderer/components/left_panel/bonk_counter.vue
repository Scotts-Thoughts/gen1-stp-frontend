
<template>
    <div v-if="enabled">
        <div v-if="mode === 'Bonks'">
            <transition name="fade">
                <div v-if="metrics.faultsMode != 'Both'">
                    <div class="tinted-box"  style="--url: url(../images/ui/bonks.svg)"></div>
                    <div class="bonksLabel">bonks</div>
                    <div class="popUpsStyle bonksValue">{{ bonks }}</div>
                </div>
            </transition>
            <transition name="fade">
                <div v-if="metrics.faultsMode == 'Both'">
                    <div class="tinted-box"  style="--url: url(../images/ui/bonks_2.svg)"></div>
                    <div class="bonksLabel_1">bonks</div>
                    <div class="popUpsStyle bonksValue_1">{{ bonks }}</div>
                </div>
            </transition>
        </div>
        <div v-else-if="mode === 'Item Count'">
            <transition name="fade">
                <div v-if="metrics.faultsMode != 'Both'">
                    <div class="tinted-box"  style="--url: url(../images/ui/bonks.svg)"></div>
                    <div class="bonksLabel">item count</div>
                    <div class="popUpsStyle bonksValue">{{ game_properties?.player.itemCount.value }}</div>
                </div>
            </transition>
            <transition name="fade">
                <div v-if="metrics.faultsMode == 'Both'">
                    <div class="tinted-box" style="--url: url(../images/ui/bonks_2.svg)"></div>
                    <div class="bonksLabel_1">item count</div>
                    <div class="popUpsStyle bonksValue_1">{{ game_properties?.player.itemCount.value }}</div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script lang="js">
import { defineComponent } from "vue";
import { useOverlaySettingsStore } from "../../stores/useOverlaySettingsStore.js";
import { useSpeciesMetricsStore } from "../../stores/useSpeciesMetricsStore.js";
import { GameState, useMetaStore } from "../../stores/metaStore.js";
export default defineComponent({
    inject: ["game_properties"],
    data() {
        return { 
            meta: useMetaStore(),
            settings: useOverlaySettingsStore(),
            metrics: useSpeciesMetricsStore() 
        }
    },
    computed: {
        enabled() {
            return this.meta.gameState === GameState.overworld && this.settings.pop_ups.bonks.enabled;
        },
        mode() {
            return this.settings.pop_ups.bonks.mode;
        },
        bonks() {
            return this.game_properties.patch.steps.bonks.value;
        }
    }
});
</script>