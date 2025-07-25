<template>
<div>
    <div v-show="top_left_ui_selector != 'Both'" class="tinted-box" style="--drop-shadow: 0px 0px 1px #000000; --url: url(../images/ui/timer_2.svg)"></div>
    <div v-show="top_left_ui_selector == 'Both'" class="tinted-box" style="--drop-shadow: 0px 0px 1px #000000; --url: url(../images/ui/timer.svg)"></div>

    <div v-show="top_left_ui_selector == 'None'"      class="genericLabels resetsLabel_1">faults</div>
    <div v-show="top_left_ui_selector == 'Resets'"    class="genericLabels resetsLabel_1">resets</div>
    <div v-show="top_left_ui_selector == 'Blackouts'" class="genericLabels blackoutLabel_1">blackouts</div>
    <div v-show="top_left_ui_selector == 'Both'">
        <div class="genericLabels resetsLabel">resets</div>
        <div class="genericLabels blackoutLabel">blackouts</div>
    </div>

    <div v-show="top_left_ui_selector == 'None' || top_left_ui_selector == 'Resets'">
        <transition name="fade">
            <div class="faults_style resets_1" :style="{ 'font-size': font_size(metrics.resets) + 'px' }"><div id="reset_counter">{{metrics.resets}}</div></div>
        </transition>
    </div>
    <div v-show="top_left_ui_selector == 'Blackouts'">
        <transition name="fade">
            <div class="faults_style blackouts_1" :style="{ 'font-size': font_size(metrics.blackouts) + 'px' }" id="reset_counter">{{metrics.blackouts}}</div>
        </transition>
    </div>
    <div v-show="top_left_ui_selector == 'Both'">
        <transition name="fade">
            <div class="faults_style resets"><div :style="{ 'font-size': font_size(metrics.resets) + 'px' }" id="reset_counter">{{metrics.resets}}</div></div>
        </transition>
        <transition name="fade">
            <div class="faults_style blackouts" :style="{ 'font-size': font_size(metrics.blackouts) + 'px' }" id="reset_counter">{{metrics.blackouts}}</div>
        </transition>
    </div>
</div>
</template>

<script>
import Storage from "~/logic/Storage.js";
import PubSub from "~/logic/PubSub";
import { FaultMode, useSpeciesMetricsStore } from "~/stores/useSpeciesMetricsStore.js";
import { defineComponent } from "vue";
import { useMetaStore } from "~/stores/metaStore.js";
import { useGameSpeciesData } from "~/stores/useGameSpeciesData.js";
export default defineComponent({
    inject: [ "game_properties" ],
    data() {
        this.meta = useMetaStore;
        return {
            meta: useMetaStore,
            metrics: useSpeciesMetricsStore(),
            runConfig: useGameSpeciesData(),
            flag_blackout_prerequisite: Storage.games[this.meta.game]?.[this.meta.starter]?.data?.flag_blackout_prerequisite ?? false,
        }
    },
    computed: {
        top_left_ui_selector() {
            const allow_none = true // Toggle that allows for the UI to display no border if there are no faults
            let value = ""
            if (!allow_none && this.metrics.faultsMode === FaultMode.none) {
                return FaultMode.resets;
            }
            return this.metrics.faultsMode;
        },
    },
    methods: {
        clear_playthrough_data() {
            this.metrics.update("resets", 0);
            this.metrics.update("blackouts", 0);
            this.flag_blackout_prerequisite = false
        },
        reset_occurred() {
            this.flag_blackout_prerequisite = false;
            this.metrics.update("resets", this.metrics.resets+1);
        },
        check_blackout(newProp, oldProp) {
            if (newProp?.value == "Overworld" && oldProp?.value == "Battle" && this.flag_blackout_prerequisite == true) {
                this.flag_blackout_prerequisite = false;
                this.metrics.update("blackouts", this.metrics.blackouts+1);
            }
            else if (newProp.value == "Overworld") {
                this.flag_blackout_prerequisite = false;
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
    watch: {
        //! These watchers are just used to emit the changes of these properties for other components to use, there will be a better way to do this.
        //! This may be important just to keep thes values backed up
        flag_blackout_prerequisite(new_value) {
            Storage.games[this.meta.game][this.meta.starter].data.flag_blackout_prerequisite = new_value
        }
    },
    mounted() {
        this.game_properties.player.team[0].hp.change((newProp, oldProp) => {
            if (newProp.value == 0 && this.game_properties.meta.state.value == 'Battle') {
                this.flag_blackout_prerequisite = true;
            }
        })
    },
    onUnmounted() {
        PubSub.unsubscribe("@run/cleared", this.clear_playthrough_data);
        PubSub.unsubscribe("@run/reset_occurred", this.reset_occurred);
        PubSub.unsubscribe("@run/check_blackout", this.check_blackout);
        PubSub.unsubscribe("@run/new_run_started", this.new_run_started);
    }
});
</script>