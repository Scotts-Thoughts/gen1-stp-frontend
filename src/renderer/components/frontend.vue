<template>
    <div class="mainContainer">
        <graphics />

        <!-- Background Process: -->
        <state />

        <left_panel />
        <right_panel :previous_splits />
        <game_area />
    </div>
</template>

<script lang="ts">
import PubSub from "~/logic/PubSub";
import { LocalStorageProxy } from "~/logic/LocalStorageProxy.js";
import { computed, defineComponent } from "vue";
import { useOverlaySettingsStore } from "~/stores/useOverlaySettingsStore.js";
import { useGameSpeciesData } from "~/stores/useGameSpeciesData.js";
import { RunState, useSpeciesMetricsStore } from "~/stores/useSpeciesMetricsStore.js";
import { useMetaStore } from "~/stores/metaStore";
import { useAutoSplitterStore } from "~/stores/autoSplitterStore.js";
import { onStoreAction } from "~/utils/onStoreAction.js";
import { GameHookProperty } from "~/packages/gameHookMapperClient.js";
import { createFullSplitGen1, getUniqueTrainerIdGen1 } from "~/autosplitter/gen1/gen1_split_functions.js";
import { red_blue_splits, yellow_splits } from "~/autosplitter/gen1/split_configuration.js";

// vue components:
import graphics from "./graphics.vue";
import state from "./state.js"; // background process.
import left_panel from "./left_panel.vue";
import game_area from "./game_area.vue";
import right_panel from "./right_panel.vue";
import { gen1_battle_summary } from "~/autosplitter/gen1/gen1_battle_summary.js";

export default defineComponent({
    components: {
        graphics,

        state, // Background Processes

        left_panel, // Left Panel
        game_area, // Middle Panel
        right_panel //LiRight Panel
    },
    props: ["mapper"],
    data() {
        return {
            meta: useMetaStore(),
            metrics: useSpeciesMetricsStore(),
            settings: useOverlaySettingsStore(),
            autosplitterStore: useAutoSplitterStore(),
            runConfig: useGameSpeciesData(),
            // Static Data
            previous_splits: [],
            battle_summary_header: "",
        }
    },
    watch: {
        // TODO: Handle previous_splits some other way. And then remove LocalStorageProxy.
        previous_splits: {
            handler: function (newVal) {
                LocalStorageProxy.previous_splits = newVal
            },
            deep: true,
        },
    },
    methods: {
        clear_splits_header_timer() {
            this.battle_summary_header = "Battle Summary"
        },
        load_split_settings() {
            // TODO: Handle previous_splits some other way. 
            this.previous_splits = LocalStorageProxy.previous_splits as unknown as [] ?? []
        },

        /** 
         * Configures the {@link useAutoSplitterStore} for generation 1 of pokemon. Also sets up all the game property
         * listeners necessary for making splits. 
         */
        setup_splitter() {
            this.load_split_settings();
            this.autosplitterStore.configure(
                this.mapper, 
                {
                    splits: this.meta.game === "Yellow" ? yellow_splits : red_blue_splits,
                    getSplitData: createFullSplitGen1,
                    getUniqueTrainerId: getUniqueTrainerIdGen1,
                    battleSummary: gen1_battle_summary,
                }
            );
            onStoreAction(this.metrics, "clear_run", this.clear_splits_header_timer);

            // Gen1 specific mapper watching. Everything else handled by the invoked stores (or the published events):

            // RESET - Identifies when a reset occurs and publishes an event
            this.mapper.properties.player.playerId.change((newProp, oldProp) => {
                if (newProp.value == 0 && oldProp.value > 0 && this.metrics.state <= RunState.started) {
                    PubSub.publish("@run/reset_occurred");
                }
            });
            // BLACKOUT - Identifies when a blackout might have occurred
            this.mapper.properties.meta.state.change((newProp, oldProp) => {
                PubSub.publish("@run/check_blackout", [newProp, oldProp]);
                if (newProp.value == "To Battle" && this.mapper.properties.battle.type.value == "Trainer") {
                    this.settings.clearRightPanelOverride();
                }
            });
            // NEW_RUN_STARTED - Determines if the player has pressed 'New Game' and started a new playthrough
            this.mapper.properties.player.playerId.change((newProp) => {
                // TODO: this may not be correct. See comment on RunState.saved. Also compare below.
                if (newProp.value > 0 && this.metrics.state < RunState.saved && newProp.value != this.metrics.player_id) {
                    this.metrics.start_new_run(newProp.value);
                }
            });

            // Only allow the player to reset once after the champion without resets incrementing
            this.mapper.properties.player.name.change((newProp) => {
                // TODO: this may not be correct. See comment on RunState.finished.
                if (this.metrics.state == RunState.finished && newProp.value == "NINTEN") {
                    this.metrics.state = RunState.started;
                }
            });

            // Check for the start of the battle:
            this.mapper.properties.battle.type.change((newProp) => {
                this.autosplitterStore.onBattleStart(newProp.value);
            });

            // the `lowHealthAlarm` property is used to play the Red-bar sound effect
            // it is turned off as soon as "Player defeated Trainer" starts to render in the textbox
            this.mapper.properties.battle.lowHealthAlarm.change((prop) => {
                if (prop.value === "Disabled") {
                    this.autosplitterStore.onBattleEnd(this.mapper.properties.battle.type.value)
                }
            });

            // when the triangular cursor appears on the screen, check if the game has ended:
            this.mapper.properties.screen.text.prompt.change((newProp, oldProp) => {
                if (newProp.bytes[0] == 0xEE && oldProp.bytes[0] == 0x7F) {
                    this.autosplitterStore.checkGameEnd();
                }
            });

            // log the final times with the final gametime
            // I am watching tile1 for a specifc tile that appears when the gametime displays on screen
            this.mapper.properties.screen.tiles.column1.tile1.change((newProp) => {
                if (newProp.value == 122) {
                    if (this.mapper.properties.events.beatChampion.value == true && this.mapper.properties.overworld.map.value == "Hall of Fame") {
                        this.autosplitterStore.onFinalSplit();
                    }
                }
            });
        }
    },
    mounted: function () {
        this.setup_splitter();

        // TODO: move to encounter.vue component.
        // Alakazam Yellow exception
        this.mapper.properties?.trainers?.viridianForest?.bugcatcher2.change((newValue) => {
            if (this.meta.game == "Yellow" && this.meta.starter == "Alakazam" && newValue.value == true) {
                this.mapper.properties.patch.wEarlyEncounters.set("On", false)
            }
        });
    },
    provide() {
        return {
            "game_properties": computed(() => this.mapper.properties),
            "mapper": this.mapper,
        }
    }
});
</script>