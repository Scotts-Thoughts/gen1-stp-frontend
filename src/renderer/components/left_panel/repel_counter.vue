
<template>
    <div v-if="display">
        <transition name="fade">
            <div v-if="metrics.faultsMode != 'Both'">
                <div class="tinted-box" :style="boxStyle"></div>
                <div class="repelLabel">repel steps</div>
                <div class="popUpsStyle repelSteps">{{ game_properties.overworld.repelCount.value }}</div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="metrics.faultsMode == 'Both'">
                <div class="tinted-box" :style="boxStyle"></div>
                <div class="repelLabel_1">repel steps</div>
                <div class="popUpsStyle repelSteps_1">{{ game_properties.overworld.repelCount.value }}</div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { useSpeciesMetricsStore } from "~/stores/useSpeciesMetricsStore.js";
import { FaultMode } from "~/stores/types/FaultMode";
import { useOverlaySettingsStore } from "~/stores/useOverlaySettingsStore.js";
import { useMetaStore } from "~/stores/metaStore.js";
import { GameState } from "~/stores/types/GameState";
import {  GameHookProperty } from "~/packages/gameHookMapperClient";
export default defineComponent({
    data() {
        return { 
            game_properties: inject<Record<string, GameHookProperty>>("game_properties", {}),
            meta: useMetaStore(),
            settings: useOverlaySettingsStore(), 
            metrics: useSpeciesMetricsStore() 
        }
    },
    computed: {
        display() {
            return this.settings.pop_ups.repel.enabled
                && this.meta.gameState === GameState.overworld 
                && this.game_properties.overworld.repelCount.value > 0;
        },
        boxStyle() {
            return this.metrics.faultsMode != FaultMode.both
                ? "--url: url(../images/ui/repel.svg)"
                : "--url: url(../images/ui/repel_2.svg)"
        }
    }
});
</script>