<template>
<div>
    <div v-show="top_left_ui_selector != 'Both'" class="tinted-box" style="--drop-shadow: 0px 0px 1px #000000; --url: url(images/ui/timer_2.svg)"></div>
    <div v-show="top_left_ui_selector == 'Both'" class="tinted-box" style="--drop-shadow: 0px 0px 1px #000000; --url: url(images/ui/timer.svg)"></div>

    <div v-show="top_left_ui_selector == 'None'"      class="genericLabels resetsLabel_1">faults</div>
    <div v-show="top_left_ui_selector == 'Resets'"    class="genericLabels resetsLabel_1">resets</div>
    <div v-show="top_left_ui_selector == 'Blackouts'" class="genericLabels blackoutLabel_1">blackouts</div>
    <div v-show="top_left_ui_selector == 'Both'">
        <div class="genericLabels resetsLabel">resets</div>
        <div class="genericLabels blackoutLabel">blackouts</div>
    </div>

    <div v-show="top_left_ui_selector == 'None' || top_left_ui_selector == 'Resets'">
        <transition name="fade">
            <div class="faults_style resets_1" :style="{ 'font-size': font_size(reset_count) + 'px' }"><div id="reset_counter">{{reset_count}}</div></div>
        </transition>
    </div>
    <div v-show="top_left_ui_selector == 'Blackouts'">
        <transition name="fade">
            <div class="faults_style blackouts_1" :style="{ 'font-size': font_size(blackout_count) + 'px' }" id="reset_counter">{{blackout_count}}</div>
        </transition>
    </div>
    <div v-show="top_left_ui_selector == 'Both'">
        <transition name="fade">
            <div class="faults_style resets"><div :style="{ 'font-size': font_size(reset_count) + 'px' }" id="reset_counter">{{reset_count}}</div></div>
        </transition>
        <transition name="fade">
            <div class="faults_style blackouts" :style="{ 'font-size': font_size(blackout_count) + 'px' }" id="reset_counter">{{blackout_count}}</div>
        </transition>
    </div>
</div>
</template>

<script>
import PubSub from "~/logic/PubSub";
import { sendObsChapterMarker } from "~/logic/obs";
import { useSpeciesMetricsStore } from "~/stores/useSpeciesMetricsStore.js";
import { FaultMode } from "~/stores/types/FaultMode";
import { defineComponent } from "vue";
import { useMetaStore } from "~/stores/metaStore.js";
import { useGameSpeciesData } from "~/stores/useGameSpeciesData.js";
import { useEmulatorStatsStore } from "~/stores/useEmulatorStatsStore";
export default defineComponent({
    inject: [ "game_properties" ],
    data() {
        return {
            meta: useMetaStore(),
            metrics: useSpeciesMetricsStore(),
            runConfig: useGameSpeciesData(),
            emulator: useEmulatorStatsStore(),
        }
    },
    computed: {
        reset_count() {
            return this.runConfig.advanced.shuckie_counters ? this.emulator.playerResets : this.metrics.resets;
        },
        blackout_count() {
            return this.runConfig.advanced.shuckie_counters ? this.emulator.blackoutCounter : this.metrics.blackouts;
        },
        top_left_ui_selector() {
            const allow_none = true // Toggle that allows for the UI to display no border if there are no faults
            const resets = this.reset_count;
            const blackouts = this.blackout_count;
            let mode;
            if (blackouts == 0 && resets == 0)       { mode = FaultMode.none; }
            else if (blackouts == 0 && resets > 0)   { mode = FaultMode.resets; }
            else if (blackouts > 0 && resets == 0)   { mode = FaultMode.blackouts; }
            else                                      { mode = FaultMode.both; }
            if (!allow_none && mode === FaultMode.none) {
                return FaultMode.resets;
            }
            return mode;
        },
    },
    methods: {
        clear_playthrough_data() {
            this.metrics.update("resets", 0);
            this.metrics.update("blackouts", 0);
            this.metrics.update("blackout_pending", false);
        },
        reset_occurred() {
            this.metrics.update("blackout_pending", false);
            this.metrics.update("resets", this.metrics.resets + 1);
            sendObsChapterMarker('RESET');
            if (this.runConfig.advanced.shuckie_counters) {
                this.emulator.incrementCounter("playerResets");
            }
        },
        check_blackout([newProp, oldProp]) {
            if (newProp?.value == "Overworld" && oldProp?.value == "Battle" && this.metrics.blackout_pending == true) {
                this.metrics.update("blackout_pending", false);
                if (this.runConfig.advanced.count_blackouts) {
                    sendObsChapterMarker('BLACKOUT');
                    this.metrics.update("blackouts", this.metrics.blackouts + 1);
                    if (this.runConfig.advanced.shuckie_counters) {
                        this.emulator.incrementCounter("blackout_counter");
                    }
                }
            }
            else if (newProp?.value == "Overworld") {
                this.metrics.update("blackout_pending", false);
            }
        },
        new_run_started() {
            if (this.runConfig.advanced.no_attempt == true) {
                return
            }
            this.metrics.update("resets", 0);
            this.metrics.update("blackouts", 0);
        },
        font_size(value) {
            var faultDisplayLength = value.toString().length;
			if (faultDisplayLength > 3) {
				return 44
			}
			if (faultDisplayLength > 2) {
				return 65
			}
			return 75;
        },
    },
    created() {
        PubSub.subscribe("@run/cleared", this.clear_playthrough_data);
        PubSub.subscribe("@run/reset_occurred", this.reset_occurred);
        PubSub.subscribe("@run/check_blackout", this.check_blackout);
        PubSub.subscribe("@run/new_run_started", this.new_run_started);
    },
    mounted() {
        this.game_properties.player.team[0].hp.change((newProp, oldProp) => {
            if (newProp.value == 0 && this.game_properties.meta.state.value == 'Battle') {
                this.metrics.update("blackout_pending", true);
            }
        })
    },
    unmounted() {
        PubSub.unsubscribe("@run/cleared", this.clear_playthrough_data);
        PubSub.unsubscribe("@run/reset_occurred", this.reset_occurred);
        PubSub.unsubscribe("@run/check_blackout", this.check_blackout);
        PubSub.unsubscribe("@run/new_run_started", this.new_run_started);
    }
});
</script>
