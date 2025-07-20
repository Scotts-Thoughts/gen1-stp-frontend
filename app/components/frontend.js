const PokeData = require("../logic/PokeData.js");
const Timer = require("../logic/Timer.js");
const UIStyles = require("../logic/UIStyles.js");
const PubSub = require("../logic/PubSub");

const template = /*html*/`
<div>
    <div class="mainContainer">
    <graphics v-bind="graphicsProps"></graphics>

    <!-- Background Processes -->
    <state :mapper="mapper"></state>

    <!-- Left Panel -->
    <faults 
        :mapper="mapper" 
        :flag_player_finished_the_run="flag_player_finished_the_run" 
        :game_name="game_name" 
        :starterName="starterName"
        :no_attempt="no_attempt"
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
            :dropdown_bonks_items="dropdown_bonks_items"
            :top_left_ui_selector="top_left_ui_selector"
        ></bonk_counter>
        
        <repel_counter
            :mapper="mapper"
            :state="state"
            :show_repel_counter="show_repel_counter"
            :top_left_ui_selector="top_left_ui_selector"
        ></repel_counter>
    </div>
    <type_icons :pkmn_type="pkmn_type"></type_icons>
    <moveset
        :starter-name="starterName"
        :mapper="mapper"
        :state="state"
        :move_name="move_name"
        :dynamic_mon="s1dynamicReset"
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
            ></movepool>
        </div>
        <div v-else-if="right_panel == 'Splits'" key=5>
            <div key=3>
                <div class="split_label">Splits</div>
                <div v-if="toggle_compare_splits === 'Followup'">
                    <splits_followup
                        :starter-name="starterName"    
                        :compare_splits="compare_splits"
                        :trainer_name_lookup="trainer_name_lookup"
                        :previous_label="previous_label"
                        :current_label="current_label"
                    ></splits_followup>
                </div>
                <div v-else-if="toggle_compare_splits === 'First'">
                    <splits_first
                        :starter-name="starterName"
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
            ></movepool>
        </div>
    </transition>
    </div>

    <!-- Game-Area Panel -->
    <div class="testingArea1" style="z-index: 50000;"><interface_1></interface_1></div>
    <div class="testingArea2" style="z-index: 50000;">
        <interface_2></interface_2>
        <metrics :game_name="game_name" :starterName="starterName"></metrics>
        <encounters :mapper="mapper"></encounters>
    </div>
    <div class="testingArea4" style="z-index: 50000;"><interface_3></interface_3></div>
    <div class="testingArea3" style="z-index: 50000;"><interface_4></interface_4></div>
</div>
`

module.exports = {
    template,
    components: {
        "no_mapper": require("./no_mapper.js"),
        "graphics": require("./graphics.js"),

        //Background Processes
        "state": require("./state.js"),

        //Left Panel
        "timer": require("./left_panel/timer.js"),
        "badges": require("./left_panel/badges.js"),
        "faults": require("./left_panel/faults.js"),
        "repel_counter": require("./left_panel/repel_counter.js"),
        "bonk_counter": require("./left_panel/bonk_counter.js"),
        "pop_ups": require("./left_panel/pop_ups.js"),
        "type_icons": require("./left_panel/type_icons.js"),
        "moveset": require("./left_panel/move_set.js"),
        "stats": require("./left_panel/stats.js"),
        "exp_bar": require("./left_panel/exp_bar.js"),
        "badge_boosts": require("./left_panel/badge_boosts.js"),

        //Middle Panel
        "interface_1": require("./settings/interface_1.js"),
        "interface_2": require("./settings/interface_2.js"),
        "metrics": require("./settings/metrics.js"),
        "encounters": require("./settings/encounters.js"),
        "interface_3": require("./settings/interface_3.js"),
        "interface_4": require("./settings/interface_4.js"),

        //Right Panel
        "movepool": require("./right_panel/move_pool.js"),
        "splits_first": require("./right_panel/splits_first.js"),
        "splits_followup": require("./right_panel/splits_followup.js"),
        "splits_summary": require("./right_panel/splits_summary.js"),
        "enemy_graphic": require("./right_panel/enemy_graphic.js"),
        "wild_pokemon": require("./right_panel/wild_pokemon.js"),
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

            search_term : "",
            pokemon_list: [],
            top_left_ui_selector      : Storage.games[this.game_name]?.[this.starterName]?.data?.top_left_ui_selector ?? "Both",
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
            timer_startTimeOffset: MyStorage["timer_startTimeOffset"] ?? "00:00:00.00",
            time_split_start: "00:00:00:00",
            battle_start:     0,
            timer:            new Timer(MyStorage),
            battle_duration:  0,
            exp_per_second:   0,
            split_data:             [],
            player_id:              0,
            flag_player_finished_the_run: false,
            flag_finished_logging_splits: false,
            attempt_number:        0,
            finished_run_count:    0,
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
            stats_display: "Automatic",
            right_panel:   "Automatic",
            disallow_right_panel_switching: true,
            automatic_post_battle_splits: false,
            automatic_splits: false,

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
        PubSub.subscribe("@run/cleared", this.clear_splits_header_timer);
        PubSub.subscribe("@property/increment", this.increment_property);
        PubSub.subscribe("@property/decrement", this.decrement_property);
        PubSub.subscribe("@ui/top_left_ui", this.set_top_left_ui);
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
        player_id() {
            this.flag_player_finished_the_run = false;
            this.flag_finished_logging_splits == false;
        },
    },
    computed: {
        graphicsProps() {
            return {
                game_name: this.game_name,
                starterName: this.starterName,
                dynamicReset: this.s1dynamicReset,
            }
        },
        splits_summary_props() {
            return {
                starterName: this.starterName,
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
            const stat_type = this.stats_display
            switch (stat_type) {
                case "No Pokemon": this.stats_display = "No Pokemon"; break;
                case "DVs":        this.stats_display = "DVs"       ; break;
                case "EVs":        this.stats_display = "EVs"       ; break;
                case "Automatic":  this.stats_display = "Automatic" ; break;
            }
        },
        gametimeSplit() {
            h = this.mapper.properties.gameTime.hours
            m = this.mapper.properties.gameTime.minutes
            timecode = h + ":" + m.toString().padStart(2, "0")
            return timecode
        },
        //shorthands
        map() {
            return this.mapper?.properties
        },
        s1dynamicReset() {
            var species = ""
            if (this.state == 'Battle') {
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
            else if (this.state == 'No Pokemon' || this.mapper?.properties?.player?.team[0].species.value == null) {
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
        battle_fade() {
            const trainerClasses = ["LORELEI", "BRUNO", "AGATHA", "LANCE", "RIVAL3"];
            const validStates = ["To Battle", "From Battle"];
            if (this.state == "Battle") {
              return true;
            }
            if (validStates.includes(this.state) &&
                (trainerClasses.includes(this.mapper.properties.battle.trainer.class.value) ||
                 this.state != "From Battle")) {
              return true;
            } else {
              return false;
            }
        },
    },
    methods: {
        set_top_left_ui(value) {
            this.top_left_ui_selector = value;
            Storage.games[this.game_name][this.starterName].data.top_left_ui_selector = value
        },
        increment_property(property) {
            this[property]++;
        },
        decrement_property(property) {
            if (this[property] == 0) {
                return 0
            }
            this[property]--;
        },
        clear_splits_header_timer(value) {
            this.current_splits = []
            this.battle_summary_header = "Battle Summary"
            this.timer.setTimer(this.timer_startTimeOffset)
            this.player_id = 0
        },
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
                var starter_type_1 = PokeData.getSpecies(this.starterName).type_1.toLowerCase();
                var starter_type_2 = PokeData.getSpecies(this.starterName).type_2.toLowerCase();
                if (typeNumber == 1) {
                    return `images/elements/types/${starter_type_1}.png`
                }
                else if (typeNumber == 2) {
                    return `images/elements/types/${starter_type_2}.png`
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

        // RESET - Identifies when a reset occurs and publishes an event
        this.mapper.properties.player.playerId.change((newProp, oldProp) => {
            if (newProp.value == 0 && oldProp.value > 0 && this.flag_player_finished_the_run == false) {
                PubSub.publish("@run/reset_occurred");
            } 
        })
        // BLACKOUT - Identifies when a blackout might have occurred
        this.mapper.properties.meta.state.change((newProp, oldProp) => {
            PubSub.publish("@run/check_blackout", newProp, oldProp);
            if (newProp.value == "To Battle" && this.automatic_splits == true && this.mapper.properties.battle.type.value == "Trainer") {
                this.automatic_splits = false
                this.right_panel = 'Automatic'
            }
        });
        // NEW_RUN_STARTED - Determines if the player has pressed 'New Game' and started a new playthrough
        this.mapper.properties.player.playerId.change((newProp) => {
            if (newProp.value > 0 && this.flag_player_finished_the_run == false && newProp.value != this.player_id) {
                PubSub.publish("@run/new_run_started", this.player_id);
                this.flag_finished_logging_splits = false;
                if (this.test_run == false && this.refilming_mode == false) {
                    this.attempt_number++
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
                    this.flag_player_finished_the_run = true; //stop incrementing resets
                }
            }
        });
        //when the triangular cursor appears on the screen, log the gametime
        this.mapper.properties.screen.text.prompt.change((newProp, oldProp) => {
            let gameName = this.game_name == 'Yellow' ? "Y" : this.game_name == 'Red' ? "R" : "B"
            let gameName_Path = this.game_name == 'Yellow' ? 'Yellow' : 'Red and Blue' // Used for split data    
            if (this.flag_finished_logging_splits == false && this.flag_player_finished_the_run == true && newProp.bytes == 0xEE && oldProp.bytes == 0x7F) {
                this.logCopy(gameName, gameName_Path, this.attempt_number, this.starterName, this.finished_run_count, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish) //copy the current `attempt_number` split data to the finished folder
                console.log("Run complete - moving attempt files to finished folder.")
                this.flag_finished_logging_splits = true
            }
        });
        //! end of autosplitter

        // Alakazam Yellow exception
        this.mapper.properties?.trainers?.viridianForest?.bugcatcher2.change((newValue, oldValue) => {
            if (this.game_name == "Yellow" && this.starterName == "Alakazam" && newValue.value == true) {
                this.mapper.properties.patch.wEarlyEncounters.set("On", false)
            }
        });
    },
}