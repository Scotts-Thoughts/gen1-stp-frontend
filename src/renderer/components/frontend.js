import PokeData from "../logic/PokeData.js";
import Timer from "../logic/Timer.js";
import PubSub from "../logic/PubSub";
import Storage from "../logic/Storage.js";
import MyStorage from "../logic/MyStorage.js";

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
import splits_summary from "./right_panel/splits_summary.js";
import enemy_graphic from "./right_panel/enemy_graphic.js";
import wild_pokemon from "./right_panel/wild_pokemon.js";
import { log_split, autosplitter_process, format_trainer_name, logData, logCopy } from "../autosplitter/autosplitter_functions.js";
import { openFolder } from "../methods/file_system_functions.js";
import { autosplitter } from "../data/autosplitter.js";
import { application_settings } from "../settings/application_settings.js";
import { pokemon_settings } from "../settings/pokemon_settings.js";
import { time_settings } from "../settings/time_settings.js";
import { trainer_name_lookup } from "../autosplitter/trainer_name_lookup.js";
import { split_trainers } from "../autosplitter/split_trainers.js";
import { battle_summary } from "../autosplitter/battle_summary.js";
import { useUIStylesStore } from "../stores/styleStore.js";
import { computed, defineComponent } from "vue";
import { RightPanelMode, useOverlaySettingsStore } from "../stores/useOverlaySettingsStore.js";
import { useSpeciesMetricsStore } from "../stores/useSpeciesMetricsStore.js";
import { useMetaStore } from "../stores/metaStore";
import { convertDurationToSeconds, convertMSToDuration, convertSecondsToDuration } from "../utils/timehelpers.js";

const template = /*html*/`
<div>
    <div class="mainContainer">
        <graphics />

        <!-- Background Processes -->
        <state />

        <!-- Left Panel: TODO: also move faults there. -->
        <faults :flag_player_finished_the_run="flag_player_finished_the_run" :no_attempt="no_attempt" />
        <left_panel />

        <!-- Right Panel -->
        <transition name="fade">
            <div v-if="overlaySettings.right_panel_mode == 'Movepool'" key=0>
                <movepool />
            </div>
            <div v-else-if="overlaySettings.right_panel_mode == 'Splits'" key=5>
                <div key=3>
                    <div class="split_label">Splits</div>
                    <div v-if="overlaySettings.right_panel.splits.mode === 'Followup'">
                        <splits_followup
                            :compare_splits="compare_splits"
                            :trainer_name_lookup="trainer_name_lookup"
                            :previous_label="previous_label"
                            :current_label="current_label"
                        />
                    </div>
                    <div v-else-if="overlaySettings.right_panel.splits.mode === 'First'">
                        <splits_first :first_splits="first_splits" :trainer_name_lookup="trainer_name_lookup" />
                    </div>
                    <div v-else-if="overlaySettings.right_panel.splits.mode === 'Followup + Summary'">
                        <splits_summary v-bind="splits_summary_props" />
                    </div>
                </div>
            </div>
            
            <div v-else-if="overlaySettings.right_panel_mode == 'Automatic' && (meta.gameState != 'No Pokemon' && (meta.gameState == 'To Battle' || meta.gameState == 'Battle'))" style="position: absolute;" key=1>
                <enemy_graphic 
                    v-if="mapper.properties.battle.type.value == 'Trainer'" 
                    :speed_comparison_toggle="speed_comparison_toggle"
                    :enemy_pkmn_faint_types="enemy_pkmn_faint_types"
                    :right_panel="overlaySettings.right_panel_mode"
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
            meta: useMetaStore(),
            metrics: useSpeciesMetricsStore(),
            uiStyleStore: useUIStylesStore(),
            overlaySettings: useOverlaySettingsStore(),
            trainer_name_lookup,
            release: false, //If set to false then development features will be displayed
            /** The game selected by the user. Used to specify editions that use the same mapper, 
             * e.g. "Blue" from "Red and Blue".  
             * Only used to determine the storage location of the split data, not for any other logic.
             */
            game_selection: "Yellow",

            // Static Data
            pokemon_list: [],
            autosplitter_toggle: true,
            test_run: false,
            collect_split_data: true,

            no_attempt: false,
            speed_comparison_toggle: true,
            refilming_mode: false,
            refilmed_attempt: 0,
            refilmed_finish: 0,
            timer_startTimeOffset: MyStorage["timer_startTimeOffset"] ?? "00:00:00.00",
            time_split_start: "00:00:00:00",
            battle_start: 0,
            timer: new Timer(MyStorage),
            battle_duration: 0,
            exp_per_second: 0,
            split_data: [],
            player_id: 0,
            flag_player_finished_the_run: false,
            flag_finished_logging_splits: false,
            split_logStr: "",
            simple_data_str: "",
            full_data_str: "",
            deprecated_data_str: "",
            simple_data: "",
            blackout: false,
            previous_splits: [],
            current_splits: [],
            previous_label: "Previous",
            current_label: "Current",

            // Battle Summary
            battle_summary_header: "Battle Summary",
            battle_summary_frames: 0,
            battle_summary_battle_number: 0,
            battle_summary_exp_gained: 0,
            battle_summary_turns: 0,
            battle_summary_player_turns: 0,
            battle_summary_enemy_turns: 0,
            battle_summary_player_hits: 0,
            battle_summary_player_misses: 0,
            battle_summary_player_crits: 0,
            battle_summary_player_ohkos: 0,
            battle_summary_enemy_hits: 0,
            battle_summary_enemy_misses: 0,
            battle_summary_enemy_crits: 0,
            battle_summary_enemy_ohkos: 0,
            battle_summary_player_Sx: 0,
            battle_summary_player_4x: 0,
            battle_summary_player_2x: 0,
            battle_summary_player_1x: 0,
            battle_summary_player_Hx: 0,
            battle_summary_player_Qx: 0,
            battle_summary_player_0x: 0,
            battle_summary_player_con: 0,
            battle_summary_player_par: 0,
            battle_summary_player_brn: 0,
            battle_summary_player_frz: 0,
            battle_summary_player_psn: 0,
            battle_summary_player_bpn: 0,
            battle_summary_player_slp: 0,
            battle_summary_enemy_Sx: 0,
            battle_summary_enemy_4x: 0,
            battle_summary_enemy_2x: 0,
            battle_summary_enemy_1x: 0,
            battle_summary_enemy_Hx: 0,
            battle_summary_enemy_Qx: 0,
            battle_summary_enemy_0x: 0,
            battle_summary_enemy_con: 0,
            battle_summary_enemy_par: 0,
            battle_summary_enemy_brn: 0,
            battle_summary_enemy_frz: 0,
            battle_summary_enemy_psn: 0,
            battle_summary_enemy_bpn: 0,
            battle_summary_enemy_slp: 0,
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
        if (!Storage['global_variables'] || clear_storage == true) { //If the global variables don't exist, create them
            // Assigns the global variables to the Storage object
            Storage['global_variables'] = {
                starter: this.meta.starter,
                game: this.meta.game,
            }
        }
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
            console.log(`Loading settings from the Storage object into the application...`)
            console.log(Storage['global_variables'].starter)
            console.log(Storage['global_variables'].game)
        }
        // Load Settings from the Storage object
        // Load Starter and Game
        this.meta.setStarter(Storage['global_variables'].starter);
        this.game_selection = Storage['global_variables'].game;

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
        async "meta.starter"(newValue) {
            if (this.ready == false) {
                await this.sleep(250)
            }
            //update the saved starter in the overlay's local storage
            Storage['global_variables'].starter = newValue
            if (!Storage['games'][this.meta.game][newValue]) {
                Storage['games'][this.meta.game][newValue] = {
                    style: {},
                    settings: {},
                    splits: {},
                    data: {},
                };
            }
            this.uiStyleStore.setStarterName(newValue);
        },
        starterName(newValue, oldValue) {
            this.meta.setStarter(newValue);
        },
        async game_selection(newValue, oldValue) {
            //update the saved starter in the overlay's local storage
            Storage['global_variables'].game = newValue
            if (!Storage['games'][newValue][this.meta.starter]) {
                Storage['games'][newValue][this.meta.starter] = {
                    style: {},
                    settings: {},
                    splits: {},
                    data: {},
                };
            }
            this.uiStyleStore.selectGame(newValue );
        },
        player_id() {
            this.flag_player_finished_the_run = false;
            this.flag_finished_logging_splits == false;
        },
    },
    computed: {
        splits_summary_props() {
            return {
                starterName: this.meta.starter,
                compare_splits: this.compare_splits,
                trainer_name_lookup: trainer_name_lookup,
                battle_summary_header: this.battle_summary_header,
                previous_label: this.previous_label,
                current_label: this.current_label,
                battle_duration: this.battle_duration,
                exp_per_second: this.exp_per_second,
                battle_summary: battle_summary,
                battle_summary_frames: this.battle_summary_frames,
                battle_summary_battle_number: this.battle_summary_battle_number,
                battle_summary_exp_gained: this.battle_summary_exp_gained,
                battle_summary_turns: this.battle_summary_turns,
                battle_summary_player_turns: this.battle_summary_player_turns,
                battle_summary_enemy_turns: this.battle_summary_enemy_turns,
                battle_summary_player_hits: this.battle_summary_player_hits,
                battle_summary_player_misses: this.battle_summary_player_misses,
                battle_summary_player_crits: this.battle_summary_player_crits,
                battle_summary_player_ohkos: this.battle_summary_player_ohkos,
                battle_summary_enemy_hits: this.battle_summary_enemy_hits,
                battle_summary_enemy_misses: this.battle_summary_enemy_misses,
                battle_summary_enemy_crits: this.battle_summary_enemy_crits,
                battle_summary_enemy_ohkos: this.battle_summary_enemy_ohkos,
                battle_summary_player_Sx: this.battle_summary_player_Sx,
                battle_summary_player_4x: this.battle_summary_player_4x,
                battle_summary_player_2x: this.battle_summary_player_2x,
                battle_summary_player_1x: this.battle_summary_player_1x,
                battle_summary_player_Hx: this.battle_summary_player_Hx,
                battle_summary_player_Qx: this.battle_summary_player_Qx,
                battle_summary_player_0x: this.battle_summary_player_0x,
                battle_summary_player_con: this.battle_summary_player_con,
                battle_summary_player_par: this.battle_summary_player_par,
                battle_summary_player_brn: this.battle_summary_player_brn,
                battle_summary_player_frz: this.battle_summary_player_frz,
                battle_summary_player_psn: this.battle_summary_player_psn,
                battle_summary_player_bpn: this.battle_summary_player_bpn,
                battle_summary_player_slp: this.battle_summary_player_slp,
                battle_summary_enemy_Sx: this.battle_summary_enemy_Sx,
                battle_summary_enemy_4x: this.battle_summary_enemy_4x,
                battle_summary_enemy_2x: this.battle_summary_enemy_2x,
                battle_summary_enemy_1x: this.battle_summary_enemy_1x,
                battle_summary_enemy_Hx: this.battle_summary_enemy_Hx,
                battle_summary_enemy_Qx: this.battle_summary_enemy_Qx,
                battle_summary_enemy_0x: this.battle_summary_enemy_0x,
                battle_summary_enemy_con: this.battle_summary_enemy_con,
                battle_summary_enemy_par: this.battle_summary_enemy_par,
                battle_summary_enemy_brn: this.battle_summary_enemy_brn,
                battle_summary_enemy_frz: this.battle_summary_enemy_frz,
                battle_summary_enemy_psn: this.battle_summary_enemy_psn,
                battle_summary_enemy_bpn: this.battle_summary_enemy_bpn,
                battle_summary_enemy_slp: this.battle_summary_enemy_slp,
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
            this.timer.setTimer(this.timer_startTimeOffset)
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
        //file_system_functions.js
        openFolder,
    },
    mounted: async function () {
        this.load_split_settings()
        this.timer.update();
        this.pokemon_list = PokeData.getAllSpecieNames();

        // RESET - Identifies when a reset occurs and publishes an event
        this.mapper.properties.player.playerId.change((newProp, oldProp) => {
            if (newProp.value == 0 && oldProp.value > 0 && this.flag_player_finished_the_run == false) {
                PubSub.publish("@run/reset_occurred");
            }
        })
        // BLACKOUT - Identifies when a blackout might have occurred
        this.mapper.properties.meta.state.change((newProp, oldProp) => {
            PubSub.publish("@run/check_blackout", newProp, oldProp);
            if (newProp.value == "To Battle" && this.mapper.properties.battle.type.value == "Trainer") {
                this.overlaySettings.clearRightPanelOverride();
            }
        });
        // NEW_RUN_STARTED - Determines if the player has pressed 'New Game' and started a new playthrough
        this.mapper.properties.player.playerId.change((newProp) => {
            if (newProp.value > 0 && this.flag_player_finished_the_run == false && newProp.value != this.player_id) {
                PubSub.publish("@run/new_run_started", this.player_id);
                this.flag_finished_logging_splits = false;
                if (this.test_run == false && this.refilming_mode == false) {
                    this.metrics.update("attempts", this.metrics.attempts + 1);
                };
                this.timer.startTime(this.timer_startTimeOffset);
                if (this.toggle_wEarlyEncounters == false && this.toggle_wEarlyEncountersNoMoon == true) {
                    this.toggle_wEarlyEncounters == true
                }
                this.player_id = newProp.value;
            }
        })
        // Only allow the player to reset once after the champion without resets incrementing
        this.mapper.properties.player.name.change((newProp) => {
            if (this.flag_player_finished_the_run == true && newProp.value == "NINTEN") {
                this.flag_player_finished_the_run = false;
            }
        })

        //! Refactor into 'components/autosplitter.js' component
        //* Autosplitter
        //log the start of a battle to the console
        this.mapper.properties.battle.type.change((newProp) => {
            var logStr = `Autosplitter - Battle Started: ${this.mapper.properties.battle.trainer.class.value} started at ${this.timer.formatted_time[0]}${this.timer.formatted_time[1]} (Gametime: ${this.gametimeSplit})`
            var log_start = (x) => console.log(logStr)

            if (newProp.value == "Trainer") {
                if (this.collect_split_data == true) {
                    // Use for...of loop to iterate over the array
                    for (let property of battle_summary["global_stats"]) {
                        // usage
                        if (property !== null) {
                            let data = this.get_nested_property(this.mapper.properties, property.path)
                            this[`temp_${property.data_name}`] = data
                        } else {
                            console.error(`Property ${property.data_name} not found in battle_summary`);
                            continue
                        }
                    }
                }

                this.split_logStr = logStr
                this.battle_start = Date.now()
                this.time_split_start = this.padTime(this.time_h) + ":" + this.padTime(this.time_m) + ":" + this.padTime(this.time_s) + "." + this.padTime(this.time_ms)
                log_start()
            }
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

                if (this.collect_split_data == true) {
                    // Use for...of loop to iterate over the array
                    for (let property of battle_summary["global_stats"]) {
                        // usage
                        if (property !== null) {
                            let data = this.get_nested_property(this.mapper.properties, property.path)
                            this[property.data_name] = data - this[`temp_${property.data_name}`]
                        } else {
                            console.error(`Property ${property.data_name} not found in battle_summary`);
                            continue
                        }
                    }
                    this.battle_duration_ms = (Date.now() - this.battle_start) / 1000
                    this.battle_duration = convertMSToDuration(Date.now() - this.battle_start)
                    this.exp_per_second = Math.round(this.battle_summary_exp_gained / this.battle_duration_ms)
                    this.battle_summary_battle_number = this.mapper.properties.patch?.battles?.trainerBattles?.value
                }

                //write full split data (this is written for every single battle)
                this.logData(gameName, gameName_Path, this.full_data_str, this.metrics.attempts, this.meta.starter, "Full", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)

                //write deprecated split data (this is written for only pre-defined trainers)
                //a list of these trainers can be found within `autosplitter.js` and inside the parent `Yellow` or `Red and Blue`
                if (autosplitter[this.mapper.properties.meta.gameName.value][unique]) {
                    this.logData(gameName, gameName_Path, this.deprecated_data_str, this.metrics.attempts, this.meta.starter, "Deprecated", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                }

                //write simple split data
                //a list of these can be found within `autosplitter.js` and inside the parent `Simple`
                const simpleSplit = () => {
                    this.log_split()
                    this.logData(gameName, gameName_Path, this.simple_data_str, this.metrics.attempts, this.meta.starter, "Simple", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
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
                        if (this.overlaySettings.right_panel.post_battle_splits == true) {
                            this.overlaySettings.setRightPanelOverride(RightPanelMode.splits, true);
                        }
                    }
                }
                switch (unique) {
                    //this is the Giovanni fight in the 8th gym
                    case "GIOVANNI_3":
                        simpleSplit()
                        if (this.overlaySettings.right_panel.post_battle_splits === true) {
                            this.overlaySettings.setRightPanelOverride(RightPanelMode.splits, true);
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
                    if (this.overlaySettings.right_panel.post_battle_splits === true) {
                        this.overlaySettings.setRightPanelOverride(RightPanelMode.splits, true);
                    }
                    if (this.test_run == false && this.refilming_mode == false && this.no_attempt == false) {
                        this.metrics.update("finished", this.metrics.finishes + 1); //increment finished count if this is not a test run
                    };
                    // this.stopTime() //stop the timer
                    this.timer.stopTime();
                    this.logData(gameName, gameName_Path, this.simple_data_str, this.metrics.attempts, this.meta.starter, "Simple", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish) //log a simple split
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
                    this.logData(gameName, gameName_Path, this.simple_data_str, this.metrics.finishes, this.meta.starter, "Simple", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    this.logData(gameName, gameName_Path, this.deprecated_data_str, this.metrics.finishes, this.meta.starter, "Deprecated", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    this.logData(gameName, gameName_Path, this.full_data_str, this.metrics.finishes, this.meta.starter, "Full", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    this.split_data.push(this.simple_data)
                    console.log(`Autosplitter - Run Ended: Real-Time: ${this.timer.formatted_time[0]}${this.time.formatted_time[1]} Resets: ${this.metrics.resets} Blackouts: ${this.metrics.blackouts} Level: ${this.mapper.properties.player.team[0].level.value} Gametime: ${this.gametimeSplit})`)
                    this.flag_player_finished_the_run = true; //stop incrementing resets
                }
            }
        });
        //when the triangular cursor appears on the screen, log the gametime
        this.mapper.properties.screen.text.prompt.change((newProp, oldProp) => {
            let gameName = this.game_selection == 'Yellow' ? "Y" : this.game_selection == 'Red' ? "R" : "B"
            let gameName_Path = this.meta.game // Used for split data    
            if (this.flag_finished_logging_splits == false && this.flag_player_finished_the_run == true && newProp.bytes == 0xEE && oldProp.bytes == 0x7F) {
                this.logCopy(  //copy the current `attempt_number` split data to the finished folder
                    gameName,
                    gameName_Path,
                    this.metrics.attempts,
                    this.meta.starter,
                    this.metrics.finishes,
                    this.refilming_mode,
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