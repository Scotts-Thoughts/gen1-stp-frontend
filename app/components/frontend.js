const PokeData = require("../logic/PokeData.js");
const Timer = require("../logic/Timer.js");
const UIStyles = require("../logic/UIStyles.js");

const template = /*html*/`
<div>
    <div class="mainContainer">
    <graphics v-bind="graphicsProps"></graphics>

    <!-- Background Processes -->
    <state :mapper="mapper"></state>

    <!-- Left Panel -->
    <faults 
        :mapper="mapper" 
        :game_over="game_over" 
        :game_name="game_name" 
        :starterName="starterName"
    ></faults>
    <div v-if="battlePopUps == true" style="position: absolute;">
        <pop_ups
            :mapper="mapper"
            :state="state"
            :battle_fade="battle_fade"
        ></pop_ups>
        
        <bonk_counter
            :mapper="mapper"
            :state="state"
            :show_bonk_counter="show_bonk_counter"
            :timer_ui_style="timer_ui_style"
            :dropdown_bonks_items="dropdown_bonks_items"
        ></bonk_counter>
        
        <repel_counter
            :mapper="mapper"
            :state="state"
            :show_repel_counter="show_repel_counter"
            :timer_ui_style="timer_ui_style"
        ></repel_counter>
    </div>
    <type_icons :pkmn_type="pkmn_type"></type_icons>
    <moveset
        :starter-name="starterName"
        :mapper="mapper"
        :state="state"
        :move_name="move_name"
        :dynamic_mon="s1dynamic"
        :capitalization_format="capitalization_format"
    ></moveset>
    <stats
        :mapper="mapper"
        :state="state"    
        :starter-name="starterName"    
        :stats_display="stats_display"
        :dynamic_mon="s1dynamicReset"
    ></stats>   
    <exp_bar
        :mapper="mapper"
        :dynamic-reset="s1dynamicReset"
        :starter-name="starterName"
        :sleep="sleep"
    ></exp_bar>
    <badge_boosts :mapper="mapper" ></badge_boosts>
    <badges :mapper="mapper"></badges>
    <timer></timer>

    <!-- Right Panel -->
    <transition name="fade">
        <div v-if="right_panel == 'Movepool'" key=0>
            <movepool
                :starter-name="starterName"
                :dynamic-reset="s1dynamicReset"
                :starting_type_fix="starting_type_fix"
            ></movepool>
        </div>
        <div v-else-if="right_panel == 'Splits'" key=5>
            <div key=3>
                <div class="split_label">Splits</div>
                <div v-if="toggle_compare_splits === 'Followup'">
                    <splits_followup
                        :starting_type_fix="starting_type_fix"
                        :compare_splits="compare_splits"
                        :trainer_name_lookup="trainer_name_lookup"
                        :previous_label="previous_label"
                        :current_label="current_label"
                    ></splits_followup>
                </div>
                <div v-else-if="toggle_compare_splits === 'First'">
                    <splits_first
                        :starting_type_fix="starting_type_fix"
                        :first_splits="first_splits"
                        :trainer_name_lookup="trainer_name_lookup"
                    ></splits_first>
                </div>
                <div v-else-if="toggle_compare_splits === 'Followup + Summary'">
                    <splits_summary v-bind="splits_summary_props"></splits_summary>
                </div>
            </div>
        </div>
        <div v-else-if="right_panel == 'Automatic' && (state != 'Base Stats' && (state == 'To Battle' || state == 'Battle') && mapper.properties.battle.type.value == 'Trainer')" style="position: absolute;" key=1>
            <enemy_graphic
                :mapper="mapper"
                :capitalization_format="capitalization_format"
                :move_name="move_name"
                :speed_comparison_toggle="speed_comparison_toggle"
                :battle_pokemon_crop="battle_pokemon_crop"
                :enemy_pkmn_faint_types="enemy_pkmn_faint_types"
                :starter-name="starterName"
                :enemy-state="enemyState"
                :state="state"
                :right_panel="right_panel"
            ></enemy_graphic>
        </div>
        <div v-else-if="right_panel == 'Automatic' && (state == 'Battle' || state == 'From Battle') && (mapper.properties.battle.type.value == 'Wild' && show_wild_battles == true)" style="position: absolute;">
            <wild_pokemon
                :mapper="mapper"
                :state="state"
                :starter-name="starterName"
                :enemy-state="enemyState"
                :battle_pokemon_crop="battle_pokemon_crop"
                :batt="batt"
                :move_name="move_name"
                :enemy_pkmn_faint_types="enemy_pkmn_faint_types"
                :speed_comparison_toggle="speed_comparison_toggle"
            ></wild_pokemon>
        </div>
        <div v-else key=3>
            <movepool
                :starter-name="starterName"
                :dynamic-reset="s1dynamicReset"
                :starting_type_fix="starting_type_fix"
            ></movepool>
        </div>
    </transition>
    </div>

    <!-- Game-Area Panel -->
    <div class="testingArea1" style="z-index: 50000;"><interface_1></interface_1></div>
    <div class="testingArea2" style="z-index: 50000;">
        <interface_2></interface_2>
        <encounters :mapper="mapper"></encounters>
    </div>
    <div class="testingArea4" style="z-index: 50000;"><interface_3></interface_3></div>
    <div class="testingArea3" style="z-index: 50000;"><interface_4></interface_4></div>
</div>
`

module.exports = {
    template,
    components: {
        "no_mapper": require("./No_mapper.js"),
        "graphics": require("./Graphics.js"),

        //Background Processes
        "state": require("./state.js"),

        //Left Panel
        "timer": require("./Timer.js"),
        "badges": require("./Badges.js"),
        "faults": require("./faults.js"),
        "repel_counter": require("./repel_counter.js"),
        "bonk_counter": require("./bonk_counter.js"),
        "pop_ups": require("./pop_ups.js"),
        "type_icons": require("./type_icons.js"),
        "moveset": require("./Moveset.js"),
        "stats": require("./Stats.js"),
        "exp_bar": require("./exp_bar.js"),
        "badge_boosts": require("./badge_boosts.js"),

        //Middle Panel
        "interface_1": require("./interface_1.js"),
        "interface_2": require("./interface_2.js"),
        "encounters": require("./encounters.js"),
        "interface_3": require("./interface_3.js"),
        "interface_4": require("./interface_4.js"),

        //Right Panel
        "movepool": require("./Movepool.js"),
        "splits_first": require("./Splits_first.js"),
        "splits_followup": require("./Splits_followup.js"),
        "splits_summary": require("./Splits_summary.js"),
        "enemy_graphic": require("./enemy_graphic.js"),
        "wild_pokemon": require("./wild_pokemon.js"),
    },
    props: [
        "mapper",
    ],
    data() {
        return {
            state      : "No Pokemon",
            enemyState : "Not In Battle", //"Pokemon", "Fainted"
            release    : false, //If set to false then development features will be displayed
            starterName: "Venomoth",
            game_name  : "Yellow",

            // Static Data
            settings               : settings,
            auto_save_settings     : auto_save_settings,
            deprecated_autosplitter: deprecated_autosplitter,
            autosplitter           : autosplitter,
            application_settings   : application_settings,
            pokemon_settings       : pokemon_settings,
            trainer_name_lookup    : trainer_name_lookup,
            split_trainers         : split_trainers,
            time_settings          : time_settings,
            battle_summary         : battle_summary,
            backport_data          : backport_data,

            // Application Settings
            search_term : "",
            pokemon_list: [],
            battlePopUps              : true,    //shows reflect, lightscreen, safeguard, weather, accuracy, evasion, etc
            show_wild_battles         : false,   //shows wild battles in the battle screen
            autosplitter_toggle       : true,
            test_run                  : false,
            collect_split_data        : true,
            show_repel_counter        : false,
            show_bonk_counter         : false,
            dropdown_bonks_items      : 'Bonks',
            toggle_compare_splits     : 'First',
            no_attempt                : false,
            speed_comparison_toggle   : true,
            refilming_mode  : false,
            refilmed_attempt: 0,
            refilmed_finish : 0,
            rockTunnelDarkness: false, //if true it will make rock tunnel bright

            // Timer variables
            timer_startTimeOffset: MyStorage["timer_startTimeOffset"] ?? "00:00:00.00",
            time_split_start: "00:00:00:00",
            battle_start:     0,
            timer:            new Timer(MyStorage),
            battle_duration:  0,
            exp_per_second:   0,
            timer_settings:   MyStorage["timer_settings"] ?? "Real-Time",
            
            // Splits
            split_data:             [],

            // Pokemon Settings
            playerId:              0,
            game_over:             false,
            finished_logs:         false,
            attempt_number:        0,
            finished_run_count:    0,
            pb_time:               "None",
            split_logStr:          "",
            simple_data_str:       "",
            full_data_str:         "",
            deprecated_data_str:   "",
            simple_data:           "",
            blackout:              false,

            previous_splits: [],
            current_splits:  [],
            previous_label:  "Previous",
            current_label:   "Current",

            // UI
            stats_display: "Automatic",
            right_panel:   "Automatic",
            disallow_right_panel_switching: true,
            automatic_post_battle_splits: false,
            automatic_splits: false,
            automatic_stats: true,

            // Battle Summary
            battle_summary_header: "Battle Summary",
            battle_summary_frames:        0,
            battle_summary_battle_number: 0,
            battle_summary_exp_gained:    0,
            battle_summary_turns:         0,
            battle_summary_player_turns:  0,
            battle_summary_enemy_turns:   0,
            battle_summary_player_hits:   0,
            battle_summary_player_misses: 0,
            battle_summary_player_crits:  0,
            battle_summary_player_ohkos:  0,
            battle_summary_enemy_hits:    0,
            battle_summary_enemy_misses:  0,
            battle_summary_enemy_crits:   0,
            battle_summary_enemy_ohkos:   0,
            battle_summary_player_Sx:     0,
            battle_summary_player_4x:     0,
            battle_summary_player_2x:     0,
            battle_summary_player_1x:     0,
            battle_summary_player_Hx:     0,
            battle_summary_player_Qx:     0,
            battle_summary_player_0x:     0,
            battle_summary_player_con:    0,
            battle_summary_player_par:    0,
            battle_summary_player_brn:    0,
            battle_summary_player_frz:    0,
            battle_summary_player_psn:    0,
            battle_summary_player_bpn:    0,
            battle_summary_player_slp:    0,
            battle_summary_enemy_Sx:      0,
            battle_summary_enemy_4x:      0,
            battle_summary_enemy_2x:      0,
            battle_summary_enemy_1x:      0,
            battle_summary_enemy_Hx:      0,
            battle_summary_enemy_Qx:      0,
            battle_summary_enemy_0x:      0,
            battle_summary_enemy_con:     0,
            battle_summary_enemy_par:     0,
            battle_summary_enemy_brn:     0,
            battle_summary_enemy_frz:     0,
            battle_summary_enemy_psn:     0,
            battle_summary_enemy_bpn:     0,
            battle_summary_enemy_slp:     0,
        }
    },
    created() {
        // Timer settings
        for (let i = 0; i < this.time_settings.length; i++) {
            let prop_name = this.time_settings[i];
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
                starter: this.starterName,
                game: this.game_name,
            }
        }
        if (!Storage['application_settings'] || clear_storage == true) {
            //Assigns the application settings to the Storage object, these persist when the user changes the starter Pokemon
            Storage['application_settings'] = {}
            this.application_settings.forEach(setting => {
                Storage['application_settings'][setting[0]] = setting[1];
            });
        }
        if (!Storage['games'] || clear_storage == true) {
            // Assigns the game data to the Storage object, these properties will be switched between depending on the game and starter currently selected
            Storage['games'] = { //If the games object doesn't exist, create it; everything will be stored within here
                Red:    {},
                Blue:   {},
                Yellow: {},
            }
        }
        if (debug_mode) { 
            console.log(`Success!`) 
            console.log(`Initializing Starter Storage Object...`)
        }
        if (!Storage['games'][this.game_name][this.starterName] || clear_storage == true) {
            Storage['games'][this.game_name][this.starterName] = {
                style:    {},
                settings: {},
                splits:   {},
                data:     {},
            };
            this.pokemon_settings.forEach(setting => {
                Storage['games'][this.game_name][this.starterName].style[setting[0]] = setting[1];
            });
        }
        if (debug_mode) { console.log(`Success!`) }

        // Initialize watchers for all of the style properties. 
        // These are game and Pokemon specific saved within: Storage.games[game][starter]
        // Define variables
        if (debug_mode) { 
            console.log(`Stored Starter: ${this.starterName}`) 
            console.log(`Stored Game: ${this.game_name}`)
        }
        //Loop through application settings and create watchers
        for (let i = 0; i < this.application_settings.length; i++) {
            let [prop_name, value] = this.application_settings[i];
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
        for (let i = 0; i < this.pokemon_settings.length; i++) {
            let [prop_name, value] = this.pokemon_settings[i];
            this.$watch(
                () => this[prop_name],
                (new_value) => {
                    if (!Storage.games[this.game_name][this.starterName]?.style) {
                        Storage.games[this.game_name][this.starterName].style = {};
                    }
                    Storage.games[this.game_name][this.starterName].style = {
                        ...Storage.games[this.game_name][this.starterName].style,
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
        this.starterName = Storage['global_variables'].starter;
        this.game_name   = Storage['global_variables'].game;

        // // Application Settings
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
        for (let key in Storage.games[this.game_name][this.starterName].style) {
            let game = this.game_name
            let starter = this.starterName
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
        async starterName(newValue, oldValue) {
            if (this.ready == false) await this.sleep(250)
                
            // Set the new value for hChosenStarter so that the ROM responds to the change
            // this.mapper.properties.patch.hChosenStarter.set(newValue, false)

            //update the saved starter in the overlay's local storage
            Storage['global_variables'].starter = newValue
            if (!Storage['games'][this.game_name][newValue]) {
                Storage['games'][this.game_name][newValue] = {
                    style:    {},
                    settings: {},
                    splits:   {},
                    data:     {},
                };
            }
            UIStyles.setStarterName(newValue);
        },
        async game_name(newValue, oldValue) {
            //update the saved starter in the overlay's local storage
            Storage['global_variables'].game = newValue
            if (!Storage['games'][newValue][this.starterName]) {
                Storage['games'][newValue][this.starterName] = {
                    style:    {},
                    settings: {},
                    splits:   {},
                    data:     {},
                };
            }
            UIStyles.setGameName(newValue);
        },
        playerId(newValue) {
            this.game_over = false;
            this.playerResets = 0;
            this.finished_logs == false;
            this.blackout_counter = 0;
        },
        rockTunnelDarkness() {
            if (this.rockTunnelDarkness == true && (this.mapper.properties.overworld.map.value == "Rock Tunnel - 1" || this.mapper.properties.overworld.map.value == "Rock Tunnel")) {
                this.mapper.properties.overworld.mapData.palette.set(0, false)
            }
            else if (this.rockTunnelDarkness == false && (this.mapper.properties.overworld.map.value == "Rock Tunnel - 1" || this.mapper.properties.overworld.map.value == "Rock Tunnel")) {
                this.mapper.properties.overworld.mapData.palette.set(6, false)
            }
            else {
                return
            }
        },  
    },
    computed: {
        graphicsProps() {
            return {
                game_name: this.game_name,
                starterName: this.starterName,
                dynamicReset: this.s1dynamicReset,
                timer_settings: this.timer_settings
            }
        },
        splits_summary_props() {
            return {
                starting_type_fix: this.starting_type_fix,
                compare_splits: this.compare_splits,
                trainer_name_lookup: this.trainer_name_lookup,
                battle_summary_header: this.battle_summary_header,
                previous_label: this.previous_label,
                current_label: this.current_label,
                battle_duration: this.battle_duration,
                exp_per_second: this.exp_per_second,
                battle_summary: this.battle_summary,
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
        timer_ui_style() {
            const resets = Storage.games[this.game_name][this.starterName].data.player_resets ?? 0
            const blackouts = Storage.games[this.game_name][this.starterName].data.blackout_counter ?? 0
            const allow_none = true // Toggle that allows for the UI to display no border if there are no faults
            if (allow_none == true && blackouts == 0 && resets == 0) {
                return "None"
            }
            else if (blackouts == 0 && resets > 0) {
                return "Resets"
            }
            else if (blackouts > 0 && resets == 0) {
                return "Blackouts"
            }
            else {
                return "Both"
            }
        },
        filtered_pokemon_list() {
            if (this.search_term === '') {
                return this.pokemon_list;
            } else {
                return this.pokemon_list.filter(pokemon => pokemon.toLowerCase().includes(this.search_term.toLowerCase()));
            }
        },
        first_splits()  {
            const game = this.mapper.properties.meta.gameName.value;
            const optional = ["Rival1a-Route 22"];
            const completedSplits = this.current_splits
                .filter(split => this.split_trainers[game].includes(split.trainer))
                .map(split => { return { trainer: split.trainer, current_time: split.time}});
            const upcomingSplits = this.split_trainers[game]
                .filter(trainer => !optional.includes(trainer))
                .filter(trainer => !completedSplits.some(split => split.trainer === trainer))
                .map(x => ({trainer: x, current_time: "-" }));
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
                    if (this.split_trainers[game].includes(x.trainer)) {
                        const default_string = "-"
                        const cur_split = this.current_splits.find(y => y.trainer === x.trainer)
                        const prev = this.convertDurationToSeconds(x.time)
                        if (cur_split == undefined) { 
                            if (!addedTrainers.has(x.trainer)) { // Check if the trainer has already been added to the result
                                result.push({trainer: x.trainer, previous_time: this.convertSecondsToDuration(prev), current_time: default_string, difference: default_string}) 
                                addedTrainers.add(x.trainer); // Add the trainer to the set of added trainers
                            }
                            continue
                        }
                        const cur = this.convertDurationToSeconds(cur_split.time)
                        const diff = cur - prev;
                        const diff_abs = Math.abs(diff);
                        const diff_sign = Math.sign(diff);
                        const diff_m = Math.floor(diff_abs / 60);
                        const diff_s = diff_abs % 60;
                        var diff_str = `${diff_sign === -1 ? "-" : "+"}${diff_m}:${diff_s.toString().padStart(2, "0")}`;
                        if (diff_str == "+0:00") { diff_str = "0:00" }
                        if (!addedTrainers.has(x.trainer)) { // Check if the trainer has already been added to the result
                            result.push({trainer: x.trainer, previous_time: this.convertSecondsToDuration(prev), current_time: this.convertSecondsToDuration(cur), difference: diff_str})
                            addedTrainers.add(x.trainer); // Add the trainer to the set of added trainers
                        }
                    }
                }
                return result
            }
        },
        automatic_stats_type() {
            const toggle    = this.automatic_stats
            const stat_type = this.stats_display
            if (toggle) {
                switch (stat_type) {
                    case "No Pokemon": this.stats_display = "No Pokemon"; break;
                    case "DVs":        this.stats_display = "DVs"       ; break;
                    case "EVs":        this.stats_display = "EVs"       ; break;
                    case "Automatic":  this.stats_display = "Automatic" ; break;
                }
            }
            else {
                switch (stat_type) {
                    case "No Pokemon": this.stats_display = "No Pokemon"; break;
                    case "DVs":        this.stats_display = "DVs"       ; break;
                    case "EVs":        this.stats_display = "EVs"       ; break;
                    case "Automatic":  this.stats_display = "Automatic" ; break;
                }
            }
        },
        species() {
            const mapping = {
                0xBF: this.starterName,
            }
            const bytes = this.mapper.properties.player.team[0].species.bytes
            const value = this.mapper.properties.player.team[0].species.value
            if (bytes > 0 && value === null) {
                return mapping[bytes]
            }
        },
        gametimeSplit() {
            h = this.mapper.properties.gameTime.hours
            m = this.mapper.properties.gameTime.minutes
            timecode = h + ":" + m.toString().padStart(2, "0")
            return timecode
        },
        //shorthands
        s1() {
            return this.mapper?.properties?.player?.team[0]
        },
        map() {
            return this.mapper?.properties
        },
        batt() {
            return this.mapper?.properties?.battle
        },
        s1dynamic() {
            if (this.state == `Battle`) {
                return this.mapper?.properties?.battle?.yourPokemon
            }
            else {
                return this.mapper?.properties?.player?.team[0]
            }
        },
        s1dynamicReset() {
            var species = ""
            if (this.state == `Battle`) {
                const battle_data = this.mapper?.properties?.battle?.yourPokemon
                species = battle_data.species.value
                if (species == null || species == undefined) {
                    species = this.starterName
                }
                if (this.mapper.properties.player.team[0].species.value == "Backport") {
                    species = this.starterName
                }
                return {
                    ...battle_data,
                    species: { value: species }
                }
            }
            else if (this.state == `Base Stats` || this.mapper?.properties?.player?.team[0].species.value == null) {
                const pokedex_data = PokeData.getSpecies(this.starterName);
                if (this.mapper.properties.player.team[0].species.value == "Backport") {
                    species = this.starterName
                }
                return {
                    species: { value: pokedex_data.name },
                    ...pokedex_data
                }
            }
            else {
                const party_data = this.mapper?.properties?.player?.team[0]
                species = party_data.species.value
                if (species == null || species == undefined) {
                    species = this.starterName
                }
                if (this.mapper.properties.player.team[0].species.value == "Backport") {
                    species = this.starterName
                }
                return {
                    ...party_data,
                    species: { value: species }
                }
            }
        },
        starting_type_fix() {
            if (this.map.overworld.map.value == "Pallet Town - Oak's Lab" || this.state == "No Pokemon") {
                const fixed_type1 = PokeData.getSpecies(this.starterName).type_1.toLowerCase();
                const fixed_type2 = PokeData.getSpecies(this.starterName).type_2.toLowerCase();
                return [fixed_type1, fixed_type2]
            } else {
                const type1 = PokeData.getSpecies(this.starterName).type_1.toLowerCase();
                const type2 = PokeData.getSpecies(this.starterName).type_2.toLowerCase();
                return [type1, type2]
            }
        },
        battle_fade() {
            const trainerClasses = ["LORELEI", "BRUNO", "AGATHA", "LANCE", "RIVAL3"];
            const validStates = ["To Battle", "From Battle"];
            if (this.state == "Battle") {
              return true;
            }
            if (validStates.includes(this.state) &&
                (trainerClasses.includes(this.batt.trainer.class.value) ||
                 this.state != "From Battle")) {
              return true;
            } else {
              return false;
            }
        },
        getStarterType() {
            var type1 = PokeData.getSpecies(this.starterName).type_1.toLowerCase();
            var type2 = PokeData.getSpecies(this.starterName).type_2.toLowerCase();
            return { "type_1": type1, "type_2": type2 }
        },
    },
    methods: {
        async set_rom_starter() {
            let starter        = this.starterName;
            let pokedex_data   = PokeData.getSpecies(starter);
            let pokedex_number = pokedex_data.national_dex_number;
            let backport_index = [0xBF];
            if (pokedex_number > 151) {
                await this.mapper.properties.patch.hChosenStarter.setBytes([backport_index], false)
            }
            await Promise.all([
                this.mapper.properties.patch.hChosenStarter.set(starter, false), 
            ])
        },
        get_nested_property(obj, path) {
            return path.split('.').reduce((o, p) => (o || {})[p], obj);
        },
        load_split_settings() {
            this.current_splits  = MyStorage['current_splits']  ?? []
            this.previous_splits = MyStorage['previous_splits'] ?? []
        },
        async load_temp_splits() {
            const text = await loadCsvFile();
            const rows = text.split("\n").slice(1).filter(x => x !== '');
            const results = []
            for (const row of rows) {
                const columns = row.split(",");
                results.push({trainer: columns[2], time: columns[3]})
            }
            return results
        },
        async load_splits() {
            const text = await loadCsvFile();
            const rows = text.split("\n").slice(1).filter(x => x !== '');
            const results = []
            for (const row of rows) {
                const columns = row.split(",");
                results.push({trainer: columns[2], time: columns[3]})
            }
            this.previous_splits = results;
        },
        get_ev(stat_exp) {
            //add more data to this function for details (stat gain in gen1, and gen3 for comparisons)
            return Math.floor(Math.sqrt(stat_exp) / 4)
        },
        enemy_pkmn_faint_types(pkmnData) {
            if (this.state == `To Battle`) {
                return "filter: grayscale(0%) drop-shadow(0px 0px 1px #000000c5);"
            }
            else if (pkmnData?.hp == 0 || this.state == `From Battle`) {
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
        pkmn_type(typeNumber) {
            
            data = PokeData.getSpecies(this.starterName);
            if (this.state == `Battle`) {
                return this.mapper?.properties?.battle?.yourPokemon?.["type" + typeNumber.toString()].value 
                    ? this.mapper?.properties?.battle?.yourPokemon?.["type" + typeNumber.toString()].value?.toLowerCase() 
                    : PokeData.getSpecies(this.starterName)['type_' + typeNumber.toString()];
            }
            if (this.state == `Overworld` || this.state == `To Battle` || this.state == `From Battle`) {
                return this.mapper?.properties?.player?.team[0]?.["type" + typeNumber.toString()]?.value 
                    ? this.mapper?.properties?.player?.team[0]?.["type" + typeNumber.toString()]?.value?.toLowerCase() 
                    : PokeData.getSpecies(this.starterName)['type_' + typeNumber.toString()];
            }
            if (this.state != `Battle`) {
                return data["type_" + typeNumber.toString()].toLowerCase()
            }
            if (this.state == "No Pokemon" || this.mapper.properties.player.team[0].species.value == null) {
                return PokeData.getSpecies(this.starterName)["type_" + typeNumber.toString()]?.toLowerCase()
            }
        },
        increment(property) {
            this[property]++;
        },
        decrement(property) {
            if (this[property] == 0) {
                return 0
            }
            this[property]--;
        },
        convertDurationToSeconds(duration) {
            const parts = duration.split(':').map(part => parseInt(part, 10));
            if (parts.length === 1) {
                return parts[0];
            } else if (parts.length === 2) {
                return parts[0] * 60 + parts[1];
            } else if (parts.length === 3) {
                return parts[0] * 3600 + parts[1] * 60 + parts[2];
            }
        },
        convertSecondsToDuration(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
        
            if (hours > 0) {
                return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
            } else if (minutes > 0) {
                return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
            } else {
                var seconds = remainingSeconds
                if (remainingSeconds < 10) { seconds = "0" + remainingSeconds.toString() }
                return `0:${String(seconds)}`
            }
        },
        convertMSToDuration(milliseconds) {
            const seconds = milliseconds / 1000;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
        
            if (hours > 0) {
                return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
            } else if (minutes > 0) {
                return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
            } else {
                return `${remainingSeconds}`;
            }
        },
        keys_function(object) {
            return Object.keys(object)
        },
        pkmnType(typeNumber, type1, type2) {
            if (type1 && this.state != `Base Stats`) {
                if (type1 == type2) {
                    return `images/elements/types/${type1.toLowerCase()}.png`
                }
                else if (type1 != type2 && typeNumber == 1) {
                    return `images/elements/types/${type1.toLowerCase()}.png`
                }
                else if (type1 != type2 && typeNumber == 2) {
                    return `images/elements/types/${type2.toLowerCase()}.png`
                }
            }
            else {
                if (typeNumber == 1) {
                    return `images/elements/types/${this.getStarterType.type_1.toLowerCase()}.png`
                }
                else if (typeNumber == 2) {
                    return `images/elements/types/${this.getStarterType.type_2.toLowerCase()}.png`
                }
            }
        },
        //Sets the crop on the UI image for the enemy team so that unused party slots are not present
        battle_pokemon_crop() {
            const totalPokemon = this.mapper.properties.battle.trainer.totalPokemon;
            const heights = {
              1: "242px",
              2: "402px",
              3: "562px",
              4: "722px",
              5: "886px",
              6: "1080px"
            };
            return `height: ${heights[totalPokemon]}; drop-shadow(0px 0px 1px #000000)`;
        },
        // MOVE MANAGEMENT
        sleep(ms) {
            return new Promise((res) => setTimeout(res, ms))
        },
        //text_functions.js
        move_name,
        capitalization_format,
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

        //*autosplitter
        //log the start of a battle to the console
        this.mapper.properties.battle.type.change((newProp) => {
            var logStr = `Autosplitter - Battle Started: ${this.mapper.properties.battle.trainer.class.value} started at ${this.timer.formatted_time[0]}${this.timer.formatted_time[1]} (Gametime: ${this.gametimeSplit})`
            var log_start = (x) => console.log(logStr)

            if (newProp.value == "Trainer") {
                if (this.collect_split_data == true) {
                    // Use for...of loop to iterate over the array
                    for (let property of this.battle_summary["global_stats"]) {
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
                let gameName = this.game_name == 'Yellow' ? "Y" : this.game_name == 'Red' ? "R" : "B"
                let gameName_Path = this.game_name == 'Yellow' ? 'Yellow' : 'Red and Blue' // Used for split data   

                if (this.collect_split_data == true) {
                    // Use for...of loop to iterate over the array
                    for (let property of this.battle_summary["global_stats"]) {
                        // usage
                        if (property !== null) {
                            let data = this.get_nested_property(this.mapper.properties, property.path)
                            // if (trainer == "RIVAL3") {
                            //     this.battle_summary_header = "Run Summary"
                            //     this[property.data_name] = data
                            // }
                            // else {
                            //     this[property.data_name] = data - this[`temp_${property.data_name}`]
                            // }
                            this[property.data_name] = data - this[`temp_${property.data_name}`]
                        } else {
                            console.error(`Property ${property.data_name} not found in battle_summary`);
                            continue
                        }
                    }
                    this.battle_duration_ms = (Date.now() - this.battle_start) / 1000
                    this.battle_duration = this.convertMSToDuration(Date.now() - this.battle_start)
                    this.exp_per_second = Math.round(this.battle_summary_exp_gained / this.battle_duration_ms)
                    this.battle_summary_battle_number = this.mapper.properties.patch?.battles?.trainerBattles?.value
                }

                //write full split data (this is written for every single battle)
                this.logData(gameName, gameName_Path, this.full_data_str, this.attempt_number, this.starterName, "Full", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                
                //write deprecated split data (this is written for only pre-defined trainers)
                //a list of these trainers can be found within `autosplitter.js` and inside the parent `Yellow` or `Red and Blue`
                if (this.autosplitter[this.mapper.properties.meta.gameName.value][unique]) {
                    this.logData(gameName, gameName_Path, this.deprecated_data_str, this.attempt_number, this.starterName, "Deprecated", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                }
                
                //write simple split data
                //a list of these can be found within `autosplitter.js` and inside the parent `Simple`
                const simpleSplit = () => {
                    this.log_split()
                    this.logData(gameName, gameName_Path, this.simple_data_str, this.attempt_number, this.starterName, "Simple", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
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
                        if (this.automatic_post_battle_splits == true) {
                            this.right_panel = "Splits"
                            this.automatic_splits = true
                        }
                    }
                }
                switch (unique) {
                    //this is the Giovanni fight in the 8th gym
                    case "GIOVANNI_3": 
                        simpleSplit() 
                        if (this.automatic_post_battle_splits == true) {
                            this.right_panel = "Splits"
                            this.automatic_splits = true
                        }
                        break;
                    case "ROCKET_5":   { 
                        simpleSplit() 
                        break;
                    } //this is the rocket outside of Cerulean city, collecting this data allows for better comparisons for Pokemon that take different choices in Cerulean Nugget->Misty or Misty->Nugget
                }

                //stop timer
                if (trainer == "RIVAL3") { //this is the champion in gen1
                    this.log_split() //log the final split
                    if (this.automatic_post_battle_splits == true) {
                        this.right_panel = "Splits"
                        this.automatic_splits = true
                    }
                    if (this.test_run == false && this.refilming_mode == false && this.no_attempt == false) {
                        this.finished_run_count++ //increment finished count if this is not a test run
                    };
                    // this.stopTime() //stop the timer
                    this.timer.stopTime();
                    this.logData(gameName, gameName_Path, this.simple_data_str, this.attempt_number, this.starterName, "Simple", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish) //log a simple split
                    this.split_data.push(this.simple_data) //push the split data into the data variable
                }
            }   
        });
        //log the final times with the final gametime
        //I am watching tile1 for a specifc tile that appears when the gametime displays on screen
        this.mapper.properties.screen.tiles.column1.tile1.change((newProp) => {
            let gameName = this.game_name == 'Yellow' ? "Y" : this.game_name == 'Red' ? "R" : "B"
            let gameName_Path = this.game_name == 'Yellow' ? 'Yellow' : 'Red and Blue' // Used for split data     
            if (newProp.value == 122) {
                if (this.mapper.properties.events.beatChampion.value == true && this.mapper.properties.overworld.map.value == "Hall of Fame") {
                    this.autosplitter_process()
                    console.log("Run Ended - Backing up split data now...")
                    let gameName = this.mapper.properties.meta.gameName.value
                    this.logData(gameName, gameName_Path, this.simple_data_str, this.finished_run_count, this.starterName, "Simple", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    this.logData(gameName, gameName_Path, this.deprecated_data_str, this.finished_run_count, this.starterName, "Deprecated", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    this.logData(gameName, gameName_Path, this.full_data_str, this.finished_run_count, this.starterName, "Full", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    this.split_data.push(this.simple_data)
                    console.log(`Autosplitter - Run Ended: Real-Time: ${this.timer.formatted_time[0]}${this.time.formatted_time[1]} Resets: ${this.playerResets} Blackouts: ${this.blackout_counter} Level: ${this.mapper.properties.player.team[0].level.value} Gametime: ${this.gametimeSplit})`)
                    this.game_over = true; //stop incrementing resets
                }
            }
        });
        //when the triangular cursor appears on the screen, log the gametime
        this.mapper.properties.screen.text.prompt.change((newProp, oldProp) => {
            let gameName = this.game_name == 'Yellow' ? "Y" : this.game_name == 'Red' ? "R" : "B"
            let gameName_Path = gameName == 'Yellow' ? 'Yellow' : 'Red and Blue' // Used for split data    
            if (this.finished_logs == false && this.game_over == true && newProp.bytes == 0xEE && oldProp.bytes == 0x7F) {
                this.logCopy(gameName, gameName_Path, this.attempt_number, this.starterName, this.finished_run_count, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish) //copy the current `attempt_number` split data to the finished folder
                console.log("Run complete - moving attempt files to finished folder.")
                this.finished_logs = true
            }
        });

        // Alakazam Yellow exception
        this.mapper.properties?.trainers?.viridianForest?.bugcatcher2.change((newValue, oldValue) => {
            if (this.game_name == "Yellow" && this.starterName == "Alakazam" && newValue.value == true) {
                this.mapper.properties.patch.wEarlyEncounters.set("On", false)
            }
        });
    },
}