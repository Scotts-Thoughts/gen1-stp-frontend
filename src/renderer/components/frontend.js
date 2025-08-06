import PubSub from "~/logic/PubSub";
import { JsonStorage} from "~/logic/Storage.js";
import { LocalStorageProxy } from "~/logic/LocalStorageProxy.js";
import { log_split, autosplitter_process, format_trainer_name, logData, logCopy } from "../autosplitter/autosplitter_functions.js";
import { autosplitter } from "~/data/autosplitter.js";
import { pokemon_settings } from "../settings/pokemon_settings.js";
import { computed, defineComponent } from "vue";
import { useOverlaySettingsStore } from "~/stores/useOverlaySettingsStore.js";
import { RightPanelMode } from "~/stores/types/RightPanelMode.js";
import { useGameSpeciesData } from "~/stores/useGameSpeciesData.js";
import { useSpeciesMetricsStore } from "~/stores/useSpeciesMetricsStore.js";
import { useMetaStore } from "~/stores/metaStore";
import { useBattleStore } from "~/stores/useBattleStore";

// vue components:
import graphics from "./graphics.vue"; 
import state from "./state.js"; // background process.
import left_panel from "./left_panel.vue";
import game_area from "./game_area.vue";
import right_panel from "./right_panel.vue";

const template = /*html*/`
<div>
    <div class="mainContainer">
        <graphics />

        <!-- Background Process: -->
        <state />

        <left_panel />

        <right_panel :current_splits :previous_splits :collect_split_data />
        <game_area />
    </div>
</div>
`

export default defineComponent({
    template,
    components: {
        graphics,

        state, // Background Processes

        left_panel, // Left Panel
        game_area, // Middle Panel
        right_panel //Right Panel
    },
    props: [ "mapper" ],
    data() {
        return {
            battle: useBattleStore(),
            meta: useMetaStore(),
            metrics: useSpeciesMetricsStore(),
            gameSpeciesData: useGameSpeciesData(),
            settings: useOverlaySettingsStore(),
            runConfig: useGameSpeciesData(),
            /** The game selected by the user. Used to specify editions that use the same mapper, 
             * e.g. "Blue" from "Red and Blue".  
             * Only used to determine the storage location of the split data, not for any other logic.
             */
            game_selection: "Yellow",

            // Static Data
            autosplitter_toggle: true,
            collect_split_data: true,

            refilmed_attempt: 0,
            refilmed_finish: 0,
            split_data: [],
            player_id: 0,
            flag_finished_logging_splits: false,
            split_logStr: "",
            simple_data_str: "",
            full_data_str: "",
            deprecated_data_str: "",
            simple_data: "",
            blackout: false,
            previous_splits: [],
            current_splits: [],
        }
    },
    created() {
        PubSub.subscribe("@run/cleared", this.clear_splits_header_timer);
        PubSub.subscribe("@property/increment", this.increment_property);

        // Initialize the Storage object
        // This creates all of the objects that will then be filled
        const debug_mode = false; // This enables the printing of storage related console logs
        const clear_storage = false; // Use this to test functionality. It resets all the data blocks within the Storage.json file to their default values
        if (debug_mode) { console.log(`Initializing the Storage Object...`) }

        if (!JsonStorage['games'] || clear_storage == true) {
            // Assigns the game data to the Storage object, these properties will be switched between depending on the game and starter currently selected
            JsonStorage['games'] = { //If the games object doesn't exist, create it; everything will be stored within here
                Red: {},
                Blue: {},
                Yellow: {},
            }
        }

        if (debug_mode) {
            console.log(`Success!`)
            console.log(`Initializing Starter Storage Object...`)
        }
        if (!JsonStorage['games'][this.meta.game][this.meta.starter] || clear_storage == true) {
            JsonStorage['games'][this.meta.game][this.meta.starter] = { 
                style: {},
                data: {}
            };
        }
        if (debug_mode) { console.log(`Success!`) }
        // Initialize watchers for all of the style properties. 
        // These are game and Pokemon specific saved within: Storage.games[game][starter]
        // Define variables

        // Set up application settings watchers
        this.$watch(() => this.autosplitter_toggle, (newValue) => JsonStorage.application_settings.autosplitter_toggle = newValue);
        this.$watch(() => this.collect_split_data, (newValue) => JsonStorage.application_settings.collect_split_data = newValue);
        //Loop through style settings that will be saved within a game and specific Pokemon
        for (let i = 0; i < pokemon_settings.length; i++) {
            let [prop_name, value] = pokemon_settings[i];
            this.$watch(
                () => this[prop_name],
                (new_value) => {
                    if (!JsonStorage.games[this.meta.game][this.meta.starter]?.style) {
                        JsonStorage.games[this.meta.game][this.meta.starter].style = {};
                    }
                    JsonStorage.games[this.meta.game][this.meta.starter].style = {
                        ...JsonStorage.games[this.meta.game][this.meta.starter].style,
                        [prop_name]: new_value
                    };
                }
            );
        }
        if (debug_mode) {
            console.log(`Storage finished initialization. Printing Storage object to console...`)
            console.log(JsonStorage)
        }
        // Load Application Settings from the Storage object
        this.autosplitter_toggle = JsonStorage.application_settings.autosplitter_toggle;
        this.collect_split_data = JsonStorage.application_settings.collect_split_data;
        if (debug_mode) {
            console.log(`Success!`)
            console.log(`Loaded all settings from Storage.`)
        }
    },
    watch: {
        current_splits: {
            handler: function (newVal) {
                LocalStorageProxy['current_splits'] = newVal
            },
            deep: true,
        },
        previous_splits: {
            handler: function (newVal) {
                LocalStorageProxy['previous_splits'] = newVal
            },
            deep: true,
        },
        async "meta.starter"(newValue) { // TODO: This can be removed once we obsoleted all uses of "Storage".
            if (this.ready == false) {
                await this.sleep(250)
            }
            //update the saved starter in the overlay's local storage
            if (!JsonStorage['games'][this.meta.game][newValue]) {
                JsonStorage['games'][this.meta.game][newValue] = { style: {} };
            }
        },
        async game_selection(newValue) {  // TODO: This can be removed once we obsoleted all uses of "Storage".
            //update the saved starter in the overlay's local storage
            if (!JsonStorage['games'][newValue][this.meta.starter]) {
                JsonStorage['games'][newValue][this.meta.starter] = { style: {} };
            }
        },
        player_id() {
            this.meta.run_finished = false;
            this.flag_finished_logging_splits == false;
        },
    },
    computed: {
        gametimeSplit() {
            const h = this.mapper.properties.gameTime.hours
            const m = this.mapper.properties.gameTime.minutes
            const timecode = h + ":" + m.toString().padStart(2, "0")
            return timecode
        },
    },
    methods: {
        clear_splits_header_timer(value) {
            this.current_splits = []
            this.battle_summary_header = "Battle Summary"
            this.metrics.resetTimer();
            this.player_id = 0
        },
        load_split_settings() {
            this.current_splits = LocalStorageProxy['current_splits'] ?? []
            this.previous_splits = LocalStorageProxy['previous_splits'] ?? []
        },
        padTime(time) {
            return !time 
                ? "00" 
                : time.toString().padStart(2, "0");
        },
        // MOVE MANAGEMENT
        sleep(ms) {
            return new Promise((res) => setTimeout(res, ms))
        },
        log_split,
        autosplitter_process,
        format_trainer_name,
    },
    mounted: async function () {
        this.load_split_settings();

        // RESET - Identifies when a reset occurs and publishes an event
        this.mapper.properties.player.playerId.change((newProp, oldProp) => {
            if (newProp.value == 0 && oldProp.value > 0 && this.meta.finished_runed == false) {
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
            if (newProp.value > 0 && this.meta.finished_runed == false && newProp.value != this.player_id) {
                PubSub.publish("@run/new_run_started", this.player_id);
                this.flag_finished_logging_splits = false;
                if (this.runConfig.advanced.test_run == false && this.runConfig.advanced.refilming_mode == false) {
                    this.metrics.update("attempts", this.metrics.attempts + 1);
                };
                this.metrics.startTime();
                if (this.toggle_wEarlyEncounters == false && this.toggle_wEarlyEncountersNoMoon == true) {
                    this.toggle_wEarlyEncounters == true
                }
                this.player_id = newProp.value;
            }
        })
        // Only allow the player to reset once after the champion without resets incrementing
        this.mapper.properties.player.name.change((newProp) => {
            if (this.meta.finished_runed == true && newProp.value == "NINTEN") {
                this.meta.finished_runed = false;
            }
        })

        //! Refactor into 'components/autosplitter.js' component
        //* Autosplitter
        //log the start of a battle to the console
        this.mapper.properties.battle.type.change((newProp) => {
            this.battle.startBattle(this.mapper.properties, newProp.value, this.collect_split_data);
        });
        //write to file at the end of a key battle
        //the `lowHealthAlarm` property is used to play the Red-bar sound effect
        //it is turned off as soon as "Player defeated Trainer" starts to render in the textbox
        this.mapper.properties.battle.lowHealthAlarm.change((prop) => {
            //Collect battle starting metrics
            this.autosplitter_process()
            if (prop.value == "Disabled" && this.mapper.properties.battle.type.value == "Trainer") {
                let trainer = this.mapper.properties.battle.trainer.class.value
                let id = this.mapper.properties.battle.trainer.number.value
                let unique = `${trainer}_${id}`
                let gameName = this.gameSelection == 'Yellow' ? "Y" : this.meta.game == 'Red' ? "R" : "B"
                let gameName_Path = this.meta.game // Used for split data   

                this.battle.endBattle(this.mapper.properties, this.collect_split_data);

                //write full split data (this is written for every single battle)
                logData(gameName, gameName_Path, this.full_data_str, this.metrics.attempts, this.meta.starter, "Full", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish)

                //write deprecated split data (this is written for only pre-defined trainers)
                //a list of these trainers can be found within `autosplitter.js` and inside the parent `Yellow` or `Red and Blue`
                if (autosplitter[this.mapper.properties.meta.gameName.value][unique]) {
                    logData(gameName, gameName_Path, this.deprecated_data_str, this.metrics.attempts, this.meta.starter, "Deprecated", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                }

                //write simple split data
                //a list of these can be found within `autosplitter.js` and inside the parent `Simple`
                const simpleSplit = () => {
                    this.log_split()
                    logData(gameName, gameName_Path, this.simple_data_str, this.metrics.attempts, this.meta.starter, "Simple", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    this.split_data.push(this.simple_data)
                }
                //log simple data for only these trainers
                switch (trainer) {
                    case "RIVAL1":
                    case "RIVAL2":
                    case "BROCK":
                    case "MISTY":
                    case "LT.SURGE":
                    case "ERIKA":
                    case "KOGA":
                    case "SABRINA":
                    case "BLAINE":
                    case "LORELEI":
                    case "BRUNO":
                    case "AGATHA":
                    case "LANCE": {
                        simpleSplit()
                        if (this.settings.right_panel.post_battle_splits == true) {
                            this.settings.setRightPanelOverride(RightPanelMode.splits, true);
                        }
                    }
                }
                switch (unique) {
                    //this is the Giovanni fight in the 8th gym
                    case "GIOVANNI_3":
                        simpleSplit()
                        if (this.settings.right_panel.post_battle_splits === true) {
                            this.settings.setRightPanelOverride(RightPanelMode.splits, true);
                        }
                        break;
                    case "ROCKET_5": {
                        simpleSplit()
                        break;
                    } //this is the rocket outside of Cerulean city, collecting this data allows for better comparisons for Pokemon that take different choices in Cerulean Nugget->Misty or Misty->Nugget
                }

                //stop timer
                if (trainer == "RIVAL3") { //this is the champion in gen1
                    this.log_split() //log the final split
                    if (this.settings.right_panel.post_battle_splits === true) {
                        this.settings.setRightPanelOverride(RightPanelMode.splits, true);
                    }
                    if (this.runConfig.advanced.test_run == false && this.runConfig.advanced.refilming_mode == false && this.runConfig.advanced.no_attempt == false) {
                        this.metrics.update("finished", this.metrics.finishes + 1); //increment finished count if this is not a test run
                    };
                    // this.stopTime() //stop the timer
                    this.metrics.stopTimer();
                    logData(gameName, gameName_Path, this.simple_data_str, this.metrics.attempts, this.meta.starter, "Simple", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish) //log a simple split
                    this.split_data.push(this.simple_data) //push the split data into the data variable
                }
            }
        });
        //log the final times with the final gametime
        //I am watching tile1 for a specifc tile that appears when the gametime displays on screen
        this.mapper.properties.screen.tiles.column1.tile1.change((newProp) => {
            let gameName_Path = this.meta.game; // Used for split data     
            if (newProp.value == 122) {
                if (this.mapper.properties.events.beatChampion.value == true && this.mapper.properties.overworld.map.value == "Hall of Fame") {
                    const { formatted: formattedTime } = this.metrics.getTime();
                    this.autosplitter_process()
                    console.log("Run Ended - Backing up split data now...")
                    let gameName = this.mapper.properties.meta.gameName.value
                    logData(gameName, gameName_Path, this.simple_data_str, this.metrics.finishes, this.meta.starter, "Simple", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    logData(gameName, gameName_Path, this.deprecated_data_str, this.metrics.finishes, this.meta.starter, "Deprecated", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    logData(gameName, gameName_Path, this.full_data_str, this.metrics.finishes, this.meta.starter, "Full", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    this.split_data.push(this.simple_data)
                    console.log(`Autosplitter - Run Ended: Real-Time: ${formattedTime[0]}${formattedTime[1]} Resets: ${this.metrics.resets} Blackouts: ${this.metrics.blackouts} Level: ${this.mapper.properties.player.team[0].level.value} Gametime: ${this.gametimeSplit})`)
                    this.meta.finished_runed = true; //stop incrementing resets
                }
            }
        });
        //when the triangular cursor appears on the screen, log the gametime
        this.mapper.properties.screen.text.prompt.change((newProp, oldProp) => {
            let gameName = this.game_selection == 'Yellow' ? "Y" : this.game_selection == 'Red' ? "R" : "B"
            let gameName_Path = this.meta.game // Used for split data    
            if (this.flag_finished_logging_splits == false && this.meta.finished_runed == true && newProp.bytes == 0xEE && oldProp.bytes == 0x7F) {
                logCopy(  // copy the current `attempt_number` split data to the finished folder
                    gameName,
                    gameName_Path,
                    this.metrics.attempts,
                    this.meta.starter,
                    this.metrics.finishes,
                    this.runConfig.advanced.refilming_mode,
                    this.refilmed_attempt,
                    this.refilmed_finish
                );
                console.log("Run complete - moving attempt files to finished folder.")
                this.flag_finished_logging_splits = true
            }
        });
        //! end of autosplitter

        // Alakazam Yellow exception
        this.mapper.properties?.trainers?.viridianForest?.bugcatcher2.change((newValue, oldValue) => {
            if (this.meta.game == "Yellow" && this.meta.starter == "Alakazam" && newValue.value == true) {
                this.mapper.properties.patch.wEarlyEncounters.set("On", false)
            }
        });
    },
    provide() {
        return {
            "game_properties": computed(() => {
                return this.mapper.properties;
            }),
            "mapper": this.mapper,
        }
    }
});