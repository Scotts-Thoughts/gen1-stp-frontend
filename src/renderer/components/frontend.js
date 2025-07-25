import PokeData from "~/logic/PokeData.js";
import Timer from "~/logic/Timer.js";
import PubSub from "~/logic/PubSub";
import Storage from "~/logic/Storage.js";
import MyStorage from "~/logic/MyStorage.js";

import graphics from "./graphics.vue";

//Background Processes
import state from "./state.js";

//Left Panel
import left_panel from "./left_panel.vue";
import faults from "./left_panel/faults.vue";

//Middle Panel
import game_area from "./game_area.vue";

//Right Panel
import movepool from "./right_panel/move_pool.vue";
import splits_first from "./right_panel/splits_first.js";
import splits_followup from "./right_panel/splits_followup.js";
import splits_summary from "./right_panel/splits_summary.vue";
import enemy_graphic from "./right_panel/enemy_graphic.js";
import wild_pokemon from "./right_panel/wild_pokemon.js";
import { log_split, autosplitter_process, format_trainer_name, logData, logCopy } from "../autosplitter/autosplitter_functions.js";
import { autosplitter } from "~/data/autosplitter.js";
import { application_settings } from "../settings/application_settings.js";
import { pokemon_settings } from "../settings/pokemon_settings.js";
import { time_settings } from "../settings/time_settings.js";
import { trainer_name_lookup } from "../autosplitter/trainer_name_lookup.js";
import { split_trainers } from "../autosplitter/split_trainers.js";
import { computed, defineComponent } from "vue";
import { RightPanelMode,  useOverlaySettingsStore } from "~/stores/useOverlaySettingsStore.js";
import { useGameSpeciesData } from "~/stores/useGameSpeciesData.js";
import { useSpeciesMetricsStore } from "~/stores/useSpeciesMetricsStore.js";
import { useMetaStore } from "~/stores/metaStore";
import { convertDurationToSeconds, convertSecondsToDuration } from "../utils/timehelpers.js";
import { useBattleStore } from "~/stores/useBattleStore";

const template = /*html*/`
<div>
    <div class="mainContainer">
        <graphics />

        <!-- Background Processes -->
        <state />

        <!-- Left Panel:-->
        <left_panel />

        <!-- Right Panel -->
        <transition name="fade">
            <div v-if="settings.right_panel_mode == 'Movepool'" key=0>
                <movepool />
            </div>
            <div v-else-if="settings.right_panel_mode == 'Splits'" key=5>
                <div key=3>
                    <div class="split_label">Splits</div>
                    <div v-if="settings.right_panel.splits.mode === 'Followup'">
                        <splits_followup
                            :compare_splits="compare_splits"
                            :trainer_name_lookup="trainer_name_lookup"
                        />
                    </div>
                    <div v-else-if="settings.right_panel.splits.mode === 'First'">
                        <splits_first :first_splits="first_splits" :trainer_name_lookup="trainer_name_lookup" />
                    </div>
                    <div v-else-if="settings.right_panel.splits.mode === 'Followup + Summary'">
                        <splits_summary v-bind="splits_summary_props" />
                    </div>
                </div>
            </div>
            
            <div v-else-if="settings.right_panel_mode == 'Automatic' && (meta.gameState != 'No Pokemon' && (meta.gameState == 'To Battle' || meta.gameState == 'Battle'))" style="position: absolute;" key=1>
                <enemy_graphic 
                    v-if="mapper.properties.battle.type.value == 'Trainer'" 
                    :speed_comparison_toggle="speed_comparison_toggle"
                    :enemy_pkmn_faint_types="enemy_pkmn_faint_types"
                    :right_panel="settings.right_panel_mode"
                />
                <wild_pokemon
                    v-else-if="mapper.properties.battle.type.value == 'Wild'" 
                    :enemy_pkmn_faint_types="enemy_pkmn_faint_types"
                    :speed_comparison_toggle="speed_comparison_toggle"
                />
            </div>
            <div v-else key=3>
                <movepool/>
            </div>
        </transition>
    </div>

    <!-- Game-Area Panel -->
    <game_area />
</div>
`

export default defineComponent({
    template,
    components: {
        graphics,

        state, // Background Processes

        // Left Panel:
        faults,
        left_panel,

        //Middle Panel:
        game_area,

        //Right Panel
        movepool,
        splits_first,
        splits_followup,
        splits_summary,
        enemy_graphic,
        wild_pokemon,
    },
    props: [
        "mapper",
    ],
    data() {
        return {
            battle: useBattleStore(),
            meta: useMetaStore(),
            metrics: useSpeciesMetricsStore(),
            gameSpeciesData: useGameSpeciesData(),
            settings: useOverlaySettingsStore(),
            runConfig: useGameSpeciesData(),
            trainer_name_lookup,
            /** The game selected by the user. Used to specify editions that use the same mapper, 
             * e.g. "Blue" from "Red and Blue".  
             * Only used to determine the storage location of the split data, not for any other logic.
             */
            game_selection: "Yellow",

            // Static Data
            pokemon_list: [],
            autosplitter_toggle: true,
            collect_split_data: true,

            speed_comparison_toggle: true,
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

            // Battle Summary
            battle_summary_header: "Battle Summary",
        }
    },
    created() {
        PubSub.subscribe("@run/cleared", this.clear_splits_header_timer);
        PubSub.subscribe("@property/increment", this.increment_property);
        // Timer settings
        for (let i = 0; i < time_settings.length; i++) {
            let prop_name = time_settings[i];
            this.$watch(
                () => this[prop_name],
                (new_value) => {
                    MyStorage[`${prop_name}`] = new_value;
                }
            );
        }
        // Initialize the Storage object
        // This creates all of the objects that will then be filled
        const debug_mode = false; // This enables the printing of storage related console logs
        const clear_storage = false; // Use this to test functionality. It resets all the data blocks within the Storage.json file to their default values
        if (debug_mode) { console.log(`Initializing the Storage Object...`) }
 
        if (!Storage['application_settings'] || clear_storage == true) {
            //Assigns the application settings to the Storage object, these persist when the user changes the starter Pokemon
            Storage['application_settings'] = {}
            application_settings.forEach(setting => {
                Storage['application_settings'][setting[0]] = setting[1];
            });
        }
        if (!Storage['games'] || clear_storage == true) {
            // Assigns the game data to the Storage object, these properties will be switched between depending on the game and starter currently selected
            Storage['games'] = { //If the games object doesn't exist, create it; everything will be stored within here
                Red: {},
                Blue: {},
                Yellow: {},
            }
        }
        if (debug_mode) {
            console.log(`Success!`)
            console.log(`Initializing Starter Storage Object...`)
        }
        if (!Storage['games'][this.meta.game][this.meta.starter] || clear_storage == true) {
            Storage['games'][this.meta.game][this.meta.starter] = {
                style: {},
                settings: {},
                splits: {},
                data: {},
            };
            pokemon_settings.forEach(setting => {
                Storage['games'][this.meta.game][this.meta.starter].style[setting[0]] = setting[1];
            });
        }
        if (debug_mode) { console.log(`Success!`) }

        // Initialize watchers for all of the style properties. 
        // These are game and Pokemon specific saved within: Storage.games[game][starter]
        // Define variables
        if (debug_mode) {
            console.log(`Stored Starter: ${this.meta.starter}`)
            console.log(`Stored Game: ${this.meta.game}`)
        }
        //Loop through application settings and create watchers
        for (let i = 0; i < application_settings.length; i++) {
            let [prop_name, value] = application_settings[i];
            this.$watch(
                () => this[prop_name],
                (new_value) => {
                    if (!Storage.application_settings) {
                        Storage.application_settings = {};
                    }
                    Storage.application_settings = {
                        ...Storage.application_settings,
                        [prop_name]: new_value
                    };
                }
            );
        }
        //Loop through style settings that will be saved within a game and specific Pokemon
        for (let i = 0; i < pokemon_settings.length; i++) {
            let [prop_name, value] = pokemon_settings[i];
            this.$watch(
                () => this[prop_name],
                (new_value) => {
                    if (!Storage.games[this.meta.game][this.meta.starter]?.style) {
                        Storage.games[this.meta.game][this.meta.starter].style = {};
                    }
                    Storage.games[this.meta.game][this.meta.starter].style = {
                        ...Storage.games[this.meta.game][this.meta.starter].style,
                        [prop_name]: new_value
                    };
                }
            );
        }
        if (debug_mode) {
            console.log(`Storage finished initialization. Printing Storage object to console...`)
            console.log(Storage)
        }
        // Load Settings from the Storage object
        // Load Starter and Game


        // Application Settings
        for (let key in Storage.application_settings) {
            if (debug_mode) {
                console.log(`Application Setting Key: ${key}`)
            }
            let application_settings = Object.entries(Storage.application_settings); // Assign the Pokemon's style settings to an array
            for (let i = 0; i < application_settings.length; i++) { // Iterate through the array
                this[key] = Storage.application_settings[key]; // Assign the values for each setting to the data() properties
            }
        }
        // Pokemon Style Settings
        for (let key in Storage.games[this.meta.game][this.meta.starter].style) {
            let game = this.meta.game
            let starter = this.meta.starter
            // let game = "Yellow"
            // let starter = "Pikachu"
            if (debug_mode) {
                console.log(`Pokemon Style Key: ${key}`)
                console.log(Storage.games[game][starter].style[key])
            }
            let style_settings = Object.entries(Storage.games[game][starter].style); // Assign the Pokemon's style settings to an array
            for (let i = 0; i < style_settings.length; i++) { // Iterate through the array
                this[key] = Storage.games[game][starter].style[key]; // Assign the values for each setting to the data() properties
            }
        }
        if (debug_mode) {
            console.log(`Success!`)
            console.log(`Loaded all settings from Storage.`)
        }
    },
    watch: {
        current_splits: {
            handler: function (newVal, oldVal) {
                MyStorage['current_splits'] = newVal
            },
            deep: true,
        },
        previous_splits: {
            handler: function (newVal, oldVal) {
                MyStorage['previous_splits'] = newVal
            },
            deep: true,
        },
        async "meta.starter"(newValue) { // TODO: This can be removed once we obsoleted all uses of "Storage".
            if (this.ready == false) {
                await this.sleep(250)
            }
            //update the saved starter in the overlay's local storage
            if (!Storage['games'][this.meta.game][newValue]) {
                Storage['games'][this.meta.game][newValue] = {
                    settings: {},
                    splits: {},
                    data: {},
                };
            }
        },
        async game_selection(newValue) {  // TODO: This can be removed once we obsoleted all uses of "Storage".
            //update the saved starter in the overlay's local storage
            if (!Storage['games'][newValue][this.meta.starter]) {
                Storage['games'][newValue][this.meta.starter] = {
                    settings: {},
                    splits: {},
                    data: {},
                };
            }
        },
        player_id() {
            this.meta.run_finished = false;
            this.flag_finished_logging_splits == false;
        },
    },
    computed: {
        splits_summary_props() {
            return {
                compare_splits: this.compare_splits,
                trainer_name_lookup: trainer_name_lookup,
                battle_summary_header: this.battle_summary_header,
            }
        },
        first_splits() {
            const game = this.mapper.properties.meta.gameName.value;
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
        compare_splits() {
            if (this.collect_split_data == true) {
                const result = []
                const game = this.mapper.properties.meta.gameName.value
                const addedTrainers = new Set(); // Keep track of the trainers that have been added to the result
                for (const x of this.previous_splits) {
                    if (split_trainers[game].includes(x.trainer)) {
                        const default_string = "-"
                        const cur_split = this.current_splits.find(y => y.trainer === x.trainer)
                        const prev = convertDurationToSeconds(x.time)
                        if (cur_split == undefined) {
                            if (!addedTrainers.has(x.trainer)) { // Check if the trainer has already been added to the result
                                result.push({ trainer: x.trainer, previous_time: convertSecondsToDuration(prev), current_time: default_string, difference: default_string })
                                addedTrainers.add(x.trainer); // Add the trainer to the set of added trainers
                            }
                            continue
                        }
                        const cur = convertDurationToSeconds(cur_split.time)
                        const diff = cur - prev;
                        const diff_abs = Math.abs(diff);
                        const diff_sign = Math.sign(diff);
                        const diff_m = Math.floor(diff_abs / 60);
                        const diff_s = diff_abs % 60;
                        var diff_str = `${diff_sign === -1 ? "-" : "+"}${diff_m}:${diff_s.toString().padStart(2, "0")}`;
                        if (diff_str == "+0:00") { diff_str = "0:00" }
                        if (!addedTrainers.has(x.trainer)) { // Check if the trainer has already been added to the result
                            result.push({ trainer: x.trainer, previous_time: convertSecondsToDuration(prev), current_time: convertSecondsToDuration(cur), difference: diff_str })
                            addedTrainers.add(x.trainer); // Add the trainer to the set of added trainers
                        }
                    }
                }
                return result
            }
        },
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
            Timer.setTimer(this.metrics.timer_override)
            this.player_id = 0
        },
        get_nested_property(obj, path) {
            return path.split('.').reduce((o, p) => (o || {})[p], obj);
        },
        load_split_settings() {
            this.current_splits = MyStorage['current_splits'] ?? []
            this.previous_splits = MyStorage['previous_splits'] ?? []
        },
        enemy_pkmn_faint_types(pkmnData) {
            if (this.meta.gameState == `To Battle`) {
                return "filter: grayscale(0%) drop-shadow(0px 0px 1px #000000c5);"
            }
            else if (pkmnData?.hp == 0 || this.meta.gameState == `From Battle`) {
                return "filter: grayscale(100%) drop-shadow(0px 0px 1px #000000c5); opacity: .5; "
            }
            else {
                return "filter: grayscale(0%) drop-shadow(0px 0px 1px #000000c5);"
            }
        },
        padTime(time) {
            if (!time) { return "00" }
            return time.toString().padStart(2, "0")
        },
        // MOVE MANAGEMENT
        sleep(ms) {
            return new Promise((res) => setTimeout(res, ms))
        },
        //autosplitter_functions.js
        log_split,
        autosplitter_process,
        format_trainer_name,
        logData,
        logCopy,
    },
    mounted: async function () {
        this.load_split_settings()
        Timer.update();
        this.pokemon_list = PokeData.getAllSpecieNames();

        // RESET - Identifies when a reset occurs and publishes an event
        this.mapper.properties.player.playerId.change((newProp, oldProp) => {
            if (newProp.value == 0 && oldProp.value > 0 && this.meta.finished_runed == false) {
                PubSub.publish("@run/reset_occurred");
            }
        })
        // BLACKOUT - Identifies when a blackout might have occurred
        this.mapper.properties.meta.state.change((newProp, oldProp) => {
            PubSub.publish("@run/check_blackout", newProp, oldProp);
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
                Timer.startTime(this.metrics.timer_override);
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
                this.logData(gameName, gameName_Path, this.full_data_str, this.metrics.attempts, this.meta.starter, "Full", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish)

                //write deprecated split data (this is written for only pre-defined trainers)
                //a list of these trainers can be found within `autosplitter.js` and inside the parent `Yellow` or `Red and Blue`
                if (autosplitter[this.mapper.properties.meta.gameName.value][unique]) {
                    this.logData(gameName, gameName_Path, this.deprecated_data_str, this.metrics.attempts, this.meta.starter, "Deprecated", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                }

                //write simple split data
                //a list of these can be found within `autosplitter.js` and inside the parent `Simple`
                const simpleSplit = () => {
                    this.log_split()
                    this.logData(gameName, gameName_Path, this.simple_data_str, this.metrics.attempts, this.meta.starter, "Simple", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
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
                    Timer.stopTime();
                    this.logData(gameName, gameName_Path, this.simple_data_str, this.metrics.attempts, this.meta.starter, "Simple", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish) //log a simple split
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
                    this.autosplitter_process()
                    console.log("Run Ended - Backing up split data now...")
                    let gameName = this.mapper.properties.meta.gameName.value
                    this.logData(gameName, gameName_Path, this.simple_data_str, this.metrics.finishes, this.meta.starter, "Simple", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    this.logData(gameName, gameName_Path, this.deprecated_data_str, this.metrics.finishes, this.meta.starter, "Deprecated", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    this.logData(gameName, gameName_Path, this.full_data_str, this.metrics.finishes, this.meta.starter, "Full", this.runConfig.advanced.test_run, this.runConfig.advanced.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    this.split_data.push(this.simple_data)
                    console.log(`Autosplitter - Run Ended: Real-Time: ${Timer.formatted_time[0]}${this.time.formatted_time[1]} Resets: ${this.metrics.resets} Blackouts: ${this.metrics.blackouts} Level: ${this.mapper.properties.player.team[0].level.value} Gametime: ${this.gametimeSplit})`)
                    this.meta.finished_runed = true; //stop incrementing resets
                }
            }
        });
        //when the triangular cursor appears on the screen, log the gametime
        this.mapper.properties.screen.text.prompt.change((newProp, oldProp) => {
            let gameName = this.game_selection == 'Yellow' ? "Y" : this.game_selection == 'Red' ? "R" : "B"
            let gameName_Path = this.meta.game // Used for split data    
            if (this.flag_finished_logging_splits == false && this.meta.finished_runed == true && newProp.bytes == 0xEE && oldProp.bytes == 0x7F) {
                this.logCopy(  //copy the current `attempt_number` split data to the finished folder
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
            "game_properties": computed(() => this.mapper.properties),
            "mapper": this.mapper,
        }
    }
});