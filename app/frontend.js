function createWatchedObject(watcher) {
    const root = {};
    const handler = {
        get(target, property, receiver) {
            const value = Reflect.get(target, property, receiver);
            if (typeof value === 'object' && value !== null) {
                return new Proxy(value, handler);
            }
            return value;
        },
        set(target, property, value, receiver) {
            const result = Reflect.set(target, property, value, receiver);
            watcher(root, {target, property, value});
            return result;
        },
        deleteProperty(target, property) {
            if (property in target) {
                delete target[property];    
                watcher(root, {target, property, value: undefined});  
            }
        },
        //* Using the deleteProperty function:
            // Storage.test = 10
            // delete Storage.test
            //
            // OR
            //
            // Storage["test"] = 20
            // delete Storage["test"]
    };
    return new Proxy(root, handler);
}

const MyStorage = require("./logic/MyStorage");
const Storage = require("./logic/Storage");

async function loadCsvFile() {
    const file = await window.showOpenFilePicker({
        id: "Gen1SplitsFolder",
        types: [{
            description: "Split files",
            accept: { "text/csv": [".csv"] }
        }]
    });
    const contents = await file[0].getFile();
    const text = await contents.text();
    return text;
}

const fs = require("fs");
const path = require("path");
const { finished } = require('stream');
const Timer = require("./logic/Timer.js");

for (let folder of folders = ['splits', 'splits/Yellow', 'splits/Red and Blue']) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
}

function hash(s) {
    return [...s].reduce((h, x) => Math.imul(31, h) + x.charCodeAt(0), 0) >>> 0
}

function transition(fn, ms) {
    return new Promise((resolve) => {
        const T = performance.now()
        function step() {
            const t = performance.now() - T
            fn(Math.min(t / ms, 1))
            if (t < ms) requestAnimationFrame(step)
            else resolve()
        }
        requestAnimationFrame(step)
    })
}

const app = Vue.createApp({
    components: {
        "no_mapper": require("./components/no_mapper.js"),
        "graphics": require("./components/graphics.js"),

        //Left Panel
        "timer": require("./components/timer.js"),
        "badges": require("./components/badges.js"),
        "faults": require("./components/faults.js"),
        "repel_counter": require("./components/repel_counter.js"),
        "bonk_counter": require("./components/bonk_counter.js"),
        "pop_ups": require("./components/pop_ups.js"),
        "type_icons": require("./components/type_icons.js"),
        "moveset": require("./components/moveset.js"),
        "stats": require("./components/stats.js"),
        "exp_bar": require("./components/exp_bar.js"),
        "badge_boosts": require("./components/badge_boosts.js"),

        //Middle Panel
        "interface_1": require("./components/interface_1.js"),
        "interface_2": require("./components/interface_2.js"),
        "interface_3": require("./components/interface_3.js"),
        "interface_4": require("./components/interface_4.js"),

        //Right Panel
        "movepool": require("./components/movepool.js"),
        "splits_first": require("./components/splits_first.js"),
        "splits_followup": require("./components/splits_followup.js"),
        "splits_summary": require("./components/splits_summary.js"),
        "enemy_graphic": require("./components/enemy_graphic.js"),
        "wild_pokemon": require("./components/wild_pokemon.js"),

        //Background Logic
        "keyhook": require("./components/keyhook.js"),
    },
    //DATA & DEFINITIONS
    data() {
        return {
            ready  : false,
            mapper : null,
            state  : "Base Stats",
            obs    : null,
            release: false, //If set to false then development features will be displayed

            // Static Data
            g1MoveData             : g1MoveData,
            g1PokemonData          : g1PokemonData,
            g1PokemonDataRB        : g1PokemonDataRB,
            g1YellowTrainers       : g1YellowTrainers,
            g1RedBlueTrainers      : g1RedBlueTrainers,
            typeData               : typeData,
            stageModifiersData     : stageModifiersData,
            tmhmMapping            : tmhmMapping,
            settings               : settings,
            auto_save_settings     : auto_save_settings,
            deprecated_autosplitter: deprecated_autosplitter,
            autosplitter           : autosplitter,
            textures               : textures,
            application_settings   : application_settings,
            pokemon_settings       : pokemon_settings,
            trainer_name_lookup    : trainer_name_lookup,
            split_trainers         : split_trainers,
            time_settings          : time_settings,
            battle_summary         : battle_summary,
            backport_data          : backport_data,
            cross_generation_moves : cross_generation_moves,

            pokedex_red_blue   : pokedex_red_blue,
            pokedex_yellow     : pokedex_yellow,
            pokedex_gold_silver: pokedex_gold_silver,
            pokedex_crystal    : pokedex_crystal,

            // Objects
            // pkmnSlots:       [0, 1, 2, 3, 4, 5],
            fieldEffects:    ["reflect","lightScreen","bide","thrash","multiHit","flinch","charging","multiTurn","invulnerable","confusion","xAccuracy","mist","focusEnergy","hasSubstitute","recharge","rage","leechSeeded","toxic","transformed"],
            accuracyEvasion: ["accuracy", "evasion"],
            // prevSpecies:     undefined,
            enemyModColour:  ["0", "background: #d84444;"],
            enemyState:      "Not In Battle", //"Pokemon", "Fainted"
            // oldExpValue:     0,
            badge_boost_object: {
                1: [
                    {abrv: "Atk", name: "Attack",  deprecated_path: "properties.player.badges.badge1.value", deprecated_path: 0, boost: 1.125, },
                    {abrv: "Def", name: "Defense", deprecated_path: "properties.player.badges.badge3.value", deprecated_path: 2, boost: 1.125, },
                    {abrv: "Spe", name: "Speed",   deprecated_path: "properties.player.badges.badge5.value", deprecated_path: 4, boost: 1.125, },
                    {abrv: "Spc", name: "Special", deprecated_path: "properties.player.badges.badge7.value", deprecated_path: 6, boost: 1.125, },
                ],
                2: [
                    {abrv: "Atk", name: "Attack",          deprecated_path: "badge1", current_path: 0, boost: 1.125, },
                    {abrv: "Def", name: "Defense",         deprecated_path: "badge6", current_path: 2, boost: 1.125, },
                    {abrv: "Spe", name: "Speed",           deprecated_path: "badge3", current_path: 5, boost: 1.125, },
                    {abrv: "SpA", name: "Special Attack",  deprecated_path: "badge7", current_path: 6, boost: 1.125, },
                    {abrv: "SpD", name: "Special Defense", deprecated_path: "badge7", current_path: 6, boost: 1.125, },
                ],
                3: [
                    {abrv: "Atk", name: "Attack",          deprecated_path: "badge1", deprecated_path: 0, boost: 1.1, },
                    {abrv: "Def", name: "Defense",         deprecated_path: "badge5", deprecated_path: 4, boost: 1.1, },
                    {abrv: "Spe", name: "Speed",           deprecated_path: "badge3", deprecated_path: 2, boost: 1.1, },
                    {abrv: "SpA", name: "Special Attack",  deprecated_path: "badge7", deprecated_path: 6, boost: 1.1, },
                    {abrv: "SpD", name: "Special Defense", deprecated_path: "badge7", deprecated_path: 6, boost: 1.1, },
                ],
            },


            // Settings:
                // These automatically store into the `Storage` object
                // To add a new setting place it here as well as within the the files: `application_settings.js` or `pokemon_settings.js`
                // application_settings store within `Storage.application_settings`
                // pokemon_settings store within `Storage.games.game.style`

            // Application Settings
            starterName: "Venomoth", //Enter starter name, Special cases: Mr. Mime, Farfetchd
            game_name:   "Yellow",

            search_term : "",
            move1_replacement: "",
            move2_replacement: "",
            move3_replacement: "",
            move4_replacement: "",
            item1_replacement: "Rare Candy",
            item2_replacement: "PP UP",
            item3_replacement: "Full Restore",
            item4_replacement: "Max Elixer",
            pokemon_list: [],
            gamehook_disable_settings : false,
            gamehook_encounter_writes : false,
            dvSetting                 : "Max",   //Max, Min, NPC, Max with Min Atk, or Random
            gametimeDisplay           : false,   //shows the options menu when set to true
            inventory                 : true,    //uses inventory when in the department store & marts
            battleGraphic             : true,    //uses battle graphic with enemy moveset & stats
            showAllTrainers           : true,    //when false only shows gym leaders and rivals, when true shows all enemy trainers
            showSpecialTrainerGraphics: true,    //shows drawn art for defined trainers
            battlePopUps              : true,    //shows reflect, lightscreen, safeguard, weather, accuracy, evasion, etc
            typeCalcs                 : true,    //displays type effectiveness for enemy pokemon
            showCritMultiplierInEP    : true,    //shows high crit ratio moves with adjusted power if the move always scores a crit
            show_wild_battles         : false,   //shows wild battles in the battle screen
            automaticallySavePBSplits : true,    //saves splits if the player beats their PB (this overwrites currently saved PB splits)
            autosplitter_toggle       : true,
            display_badge_boosts      : true,
            test_run                  : false,
            collect_split_data        : true,
            collect_summary_files     : true,
            show_repel_counter        : false,
            show_bonk_counter         : false,
            dropdown_bonks_items      : 'Bonks',
            toggle_compare_splits     : 'First',
            show_frame                : false,
            no_attempt                : false,
            speed_comparison_toggle   : true,
            enable_blackouts          : false,

            toggle_wEarlyEncounters: false,
            toggle_wEarlyEncountersNoMoon: false,

            // What behavior should these toggle have?
            // - Set them to the desired value before the run
            // - Have them apply within the run so that the correct HM users show up
            // - They should save between runs so that the setting loads correctly
            //
            // - Whenever the property changes, check to see if the value is the same as the toggle, if it isn't, set it to the value of the toggle
            // - Do nothing else
            // Yellow toggles
            toggle_EVENT_ENCOUNTER_ROUTE1_TEST           : false,
            toggle_EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY: false,
            toggle_EVENT_ENCOUNTER_MTMOON_SANDSHREW      : false,
            // Red and Blue toggles
            toggle_EVENT_ENCOUNTER_MTMOON_GEODUDE : false,
            toggle_EVENT_ENCOUNTER_MTMOON_PARAS   : false,
            toggle_EVENT_ENCOUNTER_ROUTE6_CUT_USER: false,
            // Red/Blue/Yellow toggles
            toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW : false,
            toggle_EVENT_ENCOUNTER_ROUTE16_DODUO  : false,


            refilming_mode  : false,
            refilmed_attempt: 0,
            refilmed_finish : 0,

            help_menus: "Settings",

            // Keyhook shortcuts
            lastExecuted: 0,
            cycleIndex_rightDisplay:  0, //F13
            cycleIndex_stats:         0, //F15
            cycleIndex_failures:      0, //F17
            cycleIndex_screens:       0, //F16
            cycleValues_rightDisplay: ["movepool", "inventory", "splits", "none"],   //F13
            cycleValues_stats:        ["base", "stats", "evs", "ivs"],               //F15
            cycleValues_failures:     ["resets", "blackouts"],                       //F16
            cycleValues_screens:      ["screens", "bonks"],                          //F17
            key_F13:                  "movepool", //rightDisplay
            key_F14:                  true, //show movepool
            key_F15:                  "stats", //stat display type
            key_F16:                  "resets",
            key_F17:                  "screens",
            key_F18:                  "",
            key_F19:                  "",
            key_F20:                  "",
            key_F21:                  "",
            key_F22:                  "",
            key_F23:                  "",
            key_F24:                  "",

            // Encounters
            route1:         true,
            viridianForest: true,
            route3:         true,
            mtMoon:         true,
            route6:         true,
            rockTunnel:     true,
            pokemonTower:   true,
            safariZone:     true,
            powerPlant:     true,
            mansion:        true,
            route21:        true,
            route22:        true,
            victoryRoad:    true,
            route24:        true,
            goal_level:     13,
            goal_speed:     24,
            rockTunnelDarkness: false, //if true it will make rock tunnel bright
            viridian_forest:    "Pidgey",

            // Timer variables
            timer_startTimeOffset: MyStorage["timer_startTimeOffset"] ?? "00:00:00.00",
            // timer_startTime:       MyStorage["timer_startTime"]       ?? 0,
            // timer_pause:           MyStorage["timer_pause"]           ?? true,
            // timer_formatted_time:  MyStorage["timer_formatted_time"]  ?? ["0", ".00"],
            // timer_pause_time:      MyStorage["timer_pause_time"]      ?? 0,
            // time_h:  0,
            // time_m:  0,
            // time_s:  0,
            // time_ms: 0,
            time_split_start: "00:00:00:00",
            battle_start:     0,
            timer:            new Timer(MyStorage),
            battle_duration:  0,
            exp_per_second:   0,
            timer_settings:   MyStorage["timer_settings"] ?? "Real-Time",
            
            // Splits
            split_data:             [],
            pb_splits:              [],

            // Pokemon Settings
            // Playthrough Metrics
            playerId:              0,
            playerName:            "NINTEN",
            resetCatcher:          "NINTEN",
            playerResets:          0,
            blackout_counter:      0,
            resetCounter:          true,
            game_over:             false,
            lance_defeated:        false,
            finished_logs:         false,
            attempt_number:        0,
            finished_run_count:    0,
            pb_time:               "None",
            most_recent_move:      "",
            split_logStr:          "",
            simple_data_str:       "",
            full_data_str:         "",
            deprecated_data_str:   "",
            simple_data:           "",
            blackouts_as_resets:   false, //counts blackouts as resets
            blackout:              false,
            battle_summary_array:  [],

            previous_splits: [],
            current_splits:  [],
            compared_splits: [],
            previous_label:  "Previous",
            current_label:   "Current",

            // Pokemon settings for local storage
            overlay_color:         "#000000",
            imageXOffset:          0,
            imageYOffset:          0,
            imageScale:            1,
            imageFlip:             false,
            imageSat:              100,
            imageRotation:         0,

            // Background texture settings
            backgroundBlur:        0,
            backgroundScale:       100,
            backgroundFlip:        false,
            backgroundUrl:         "",
            use_custom_background: false,
            backgroundXOffset:     0,
            backgroundYOffset:     0,
            backgroundTexture:     'Bug 1',
            backgroundBrightness:  100,
            backgroundContrast:    100,
            backgroundSaturation:  100,
            backgroundHue:         0,
            playerNameChoice:      "NINTEN",

            // UI
            ui_saturation:          .6,
            ui_type_colors:         "Current",
            ui_type_color_modifier: "current_",
            ui_stat_arrangement:    "Speed: top right",
            ui_stat_arrangement_modifier: "hp_spe_",


            stats_display: "Automatic",
            right_panel:   "Automatic",
            disallow_right_panel_switching: true,
            automatic_post_battle_splits: false,
            automatic_splits: false,
            automatic_ivs: true,
            automatic_evs: true,
            automatic_stats: true,
            ui_stats_styling_modifier: "2024",

            // Battle Summary
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

            battle_summary_header: "Battle Summary",
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
        toggle_wEarlyEncounters(newValue) {
            if (newValue == true)  { this.mapper?.properties.patch.wEarlyEncounters.set("On", false)}
            if (newValue == false) { this.mapper?.properties.patch.wEarlyEncounters.set("Off", false)}
        },
        toggle_EVENT_ENCOUNTER_ROUTE1_TEST(newValue) {
            if (newValue == true)  { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_ROUTE1_TEST.set(true, false)}
            if (newValue == false) { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_ROUTE1_TEST.set(false, false)}
        },
        toggle_EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY(newValue) {
            if (newValue == true)  { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY.set(true, false)}
            if (newValue == false) { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY.set(false, false)}
        },
        toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW(newValue) {
            if (newValue == true)  { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_ROUTE3_SPEAROW.set(true, false)}
            if (newValue == false) { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_ROUTE3_SPEAROW.set(false, false)}
        },
        toggle_EVENT_ENCOUNTER_MTMOON_SANDSHREW(newValue) {
            if (newValue == true)  { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_SANDSHREW.set(true, false)}
            if (newValue == false) { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_SANDSHREW.set(false, false)}
        },
        toggle_EVENT_ENCOUNTER_ROUTE16_DODUO(newValue) {
            if (newValue == true)  { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_ROUTE16_DODUO.set(true, false)}
            if (newValue == false) { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_ROUTE16_DODUO.set(false, false)}
        },
        toggle_EVENT_ENCOUNTER_MTMOON_GEODUDE(newValue) {
            if (newValue == true)  { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_GEODUDE.set(true, false)}
            if (newValue == false) { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_GEODUDE.set(false, false)}
        },
        toggle_EVENT_ENCOUNTER_MTMOON_PARAS(newValue) {
            if (newValue == true)  { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_PARAS.set(true, false)}
            if (newValue == false) { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_PARAS.set(false, false)}
        },
        toggle_EVENT_ENCOUNTER_ROUTE6_CUT_USER(newValue) {
            if (newValue == true)  { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_ROUTE6_CUT_USER.set(true, false)}
            if (newValue == false) { this.mapper?.properties.patch.encounter_flags.EVENT_ENCOUNTER_ROUTE6_CUT_USER.set(false, false)}
        },
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
        ui_stat_arrangement(newValue) {
            if (newValue == 'Speed: bottom right') {
                this.ui_stat_arrangement_modifier = "hp_spe_"
            }
            if (newValue == 'Speed: top right') {
                this.ui_stat_arrangement_modifier = "hp_spd_"
            }
        },
        ui_type_colors(newValue) {
            if (newValue == 'Current') {
                this.ui_type_color_modifier = "current_"
            }
            if (newValue == 'Legacy') {
                this.ui_type_color_modifier = "legacy_"
            }
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
                this.pokemon_settings.forEach(setting => {
                    Storage['games'][this.game_name][newValue].style[setting[0]] = setting[1];
                });
            }

            for (let key in Storage.games[this.game_name][newValue].style) {
                // console.log(`Starter: ${newValue} Key: ${key}, Value: ${Storage.games[this.game_name][newValue].style[key]}`)
                this[key] = Storage.games[this.game_name][newValue].style[key]; // Assign the values for each setting to the data() properties
            }
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
                this.pokemon_settings.forEach(setting => {
                    Storage['games'][newValue][this.starterName].style[setting[0]] = setting[1];
                });
            }

            for (let key in Storage.games[newValue][this.starterName].style) {
                // console.log(`Game: ${newValue} Key: ${key}, Value: ${Storage.games[newValue][this.starterName].style[key]}`)
                this[key] = Storage.games[newValue][this.starterName].style[key]; // Assign the values for each setting to the data() properties
            }
        },
        playerId(newValue) {
            this.game_over = false;
            this.playerResets = 0;
            this.finished_logs == false;
            this.blackout_counter = 0;
        },    
        overlay_color(newColor) {
            document.documentElement.style.setProperty('--overlay-color', newColor);
        }, 
        playerResets(newProp) {  
            if (this.playerResets < 0) {
                this.playerResets = 0;
            }
            this.blackout == false
        },
        blackout_counter(newProp) {
            if (this.blackout_counter < 0) {
                this.blackout_counter = 0;
            }
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
        playerNameChoice() {
            this.overlay_color = `lch(75% 100 ${hash(this.playerNameChoice) % 360})`
        }
    },

    computed: {
        graphicsProps() {
            return {
                backgroundTexture: this.backgroundTexture,
                backgroundBlur: this.backgroundBlur,
                backgroundHue: this.backgroundHue,
                backgroundBrightness: this.backgroundBrightness,
                backgroundContrast: this.backgroundContrast,
                backgroundSaturation: this.backgroundSaturation,
                backgroundScale: this.backgroundScale,
                backgroundFlip: this.backgroundFlip,
                backgroundXOffset: this.backgroundXOffset,
                backgroundYOffset: this.backgroundYOffset,
                imageScale: this.imageScale,
                imageFlip: this.imageFlip,
                imageXOffset: this.imageXOffset,
                imageYOffset: this.imageYOffset,
                imageRotation: this.imageRotation,
                imageSat: this.imageSat,
                ui_saturation: this.ui_saturation,
                ui_type_color_modifier: this.ui_type_color_modifier,
                ui_stat_arrangement_modifier: this.ui_stat_arrangement_modifier,
                game_name: this.game_name,
                starterName: this.starterName,
                dynamicReset: this.s1dynamicReset,
                textures: this.textures,
                blackouts_resets: this.blackouts_resets,
                timer_settings: this.timer_settings
            }
        },
        blackouts_resets() {
            const resets = this.playerResets
            const blackouts = this.blackout_counter
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
                    case "Base Stats": this.stats_display = "Base Stats"; break;
                    case "DVs":        this.stats_display = "DVs"       ; break;
                    case "EVs":        this.stats_display = "EVs"       ; break;
                    case "Automatic":  this.stats_display = "Automatic" ; break;
                }
            }
            else {
                switch (stat_type) {
                    case "Base Stats": this.stats_display = "Base Stats"; break;
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
        dropdownDownMenuKeys() {
            return {
                textures: Object.keys(this.textures)
            }
        },
        playerResetsDisplay() {
            if (this.blackouts_as_resets == true) {
                return this.playerResets + this.blackout_counter
            }
            else {
                return this.playerResets
            }
        },

        pokemon_version_specific_data() {
            if (this.mapper.properties.meta.gameName.value == "Yellow")       { return this.g1PokemonData }
            if (this.mapper.properties.meta.gameName.value == "Red and Blue") { return this.g1PokemonDataRB }
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
                const pokedex_data = this.g1PokemonData?.[this.starterName]
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
            if (this.map.overworld.map.value == "Pallet Town - Oak's Lab" || this.state == "Base Stats") {
                const fixed_type1 = this.g1PokemonData[this.starterName].type1.toLowerCase()
                const fixed_type2 = this.g1PokemonData[this.starterName].type2.toLowerCase()
                return [fixed_type1, fixed_type2]
            }
            else {
                const type1 = this.g1PokemonData[this.starterName].type1.toLowerCase()
                const type2 = this.g1PokemonData[this.starterName].type2.toLowerCase()
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
            var type1 = this.g1PokemonData[this.starterName].type1.toLowerCase()
            var type2 = this.g1PokemonData[this.starterName].type2.toLowerCase()
            return { "type1": type1, "type2": type2 }
        },
    },

    methods: {
        async set_rom_starter() {
            let starter = this.starterName
            // console.log(starter)
            // This system requires a check in the case that the Pokemon is not one of the original 151, in that case it needs to get the value to "Backport" instead
            await Promise.all([
                await this.mapper.properties.patch.hChosenStarter.set(starter, false), 
            ])
        },
        openFolder(folderName, game_name = "Yellow", path = "", path2) {
            const fs = require('fs');
            const fullPath = path ? `.\\${folderName}\\${game_name}\\${path}\\${path2}` : `.\\${folderName}\\${game_name}\\${path}\\${path2}`;
        
            // Check if the folder exists
            if (!fs.existsSync(fullPath)) {
                // Create the folder (recursive ensures all parent directories are created)
                fs.mkdirSync(fullPath, { recursive: true });
            }
        
            // Open the folder
            require('child_process').exec(`start ${fullPath}`);
        },
        async update_items() {
            var item1 = this.item1_replacement.toUpperCase()
            var item2 = this.item2_replacement.toUpperCase()
            var item3 = this.item3_replacement.toUpperCase()
            var item4 = this.item4_replacement.toUpperCase()
            await this.mapper.properties.player.items[0].item.set(item1, false)
            await this.mapper.properties.player.items[0].quantity.set(99, false)
            await this.mapper.properties.player.items[1].item.set(item2, false)
            await this.mapper.properties.player.items[1].quantity.set(99, false)
            await this.mapper.properties.player.items[2].item.set(item3, false)
            await this.mapper.properties.player.items[2].quantity.set(99, false)
            await this.mapper.properties.player.items[3].item.set(item4, false)
            await this.mapper.properties.player.items[3].quantity.set(99, false)
            if (this.mapper.properties.player.items[4].item.value == null) {
                await this.mapper.properties.player.items[4].item.setBytes([0xFF], false)
                await this.mapper.properties.player.itemCount.set(4, false)
            }
        },
        async update_moveset() {
            const move_data = this.cross_generation_moves.g1
            var move1 = this.move1_replacement.toUpperCase()
            var move2 = this.move2_replacement.toUpperCase()
            var move3 = this.move3_replacement.toUpperCase()
            var move4 = this.move4_replacement.toUpperCase()
            var pp1   = move_data[this.move_name(move1)]
            var pp2   = move_data[this.move_name(move2)]
            var pp3   = move_data[this.move_name(move3)]
            var pp4   = move_data[this.move_name(move4)]
            if (move1 != "") {
                await this.mapper.properties.player.team[0].move1.set(move1, false)
                await this.mapper.properties.player.team[0].move1pp.set(pp1.PP, false)
            }
            if (move2 != "") {
                await this.mapper.properties.player.team[0].move2.set(move2, false)
                await this.mapper.properties.player.team[0].move2pp.set(pp2.PP, false)
            }
            if (move3 != "") {
                await this.mapper.properties.player.team[0].move3.set(move3, false)
                await this.mapper.properties.player.team[0].move3pp.set(pp3.PP, false)
            }
            if (move4 != "") {
                await this.mapper.properties.player.team[0].move4.set(move4, false)
                await this.mapper.properties.player.team[0].move4pp.set(pp4.PP, false)
            }
        },
        async update_battle_moveset() {
            if (this.mapper.properties.meta.state.value == "Battle") {
                const move_data = this.cross_generation_moves.g1
                var move1 = this.move1_replacement.toUpperCase()
                var move2 = this.move2_replacement.toUpperCase()
                var move3 = this.move3_replacement.toUpperCase()
                var move4 = this.move4_replacement.toUpperCase()
                var pp1   = move_data[this.move_name(move1)]
                var pp2   = move_data[this.move_name(move2)]
                var pp3   = move_data[this.move_name(move3)]
                var pp4   = move_data[this.move_name(move4)]
                if (move1 != "") {
                    await this.mapper.properties.battle.yourPokemon.move1.set(move1, false)
                    await this.mapper.properties.battle.yourPokemon.move1pp.set(pp1.PP, false)
                }
                if (move2 != "") {
                    await this.mapper.properties.battle.yourPokemon.move2.set(move2, false)
                    await this.mapper.properties.battle.yourPokemon.move2pp.set(pp2.PP, false)
                }
                if (move3 != "") {
                    await this.mapper.properties.battle.yourPokemon.move3.set(move3, false)
                    await this.mapper.properties.battle.yourPokemon.move3pp.set(pp3.PP, false)
                }
                if (move4 != "") {
                    await this.mapper.properties.battle.yourPokemon.move4.set(move4, false)
                    await this.mapper.properties.battle.yourPokemon.move4pp.set(pp4.PP, false)
                }
            }
            else { return }
        },
        set_encounters() {
            const game = this.mapper.properties.meta.gameName.value
            let early_encounters_value = this.toggle_wEarlyEncounters == true ? "On" : "Off"
            this.mapper.properties.patch.wEarlyEncounters.set(early_encounters_value, false)
            if (game == 'Yellow') {
                this.mapper.setBits([ // Set bits can only be called on properties that share the same address
                    {path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE1_TEST', value: this.toggle_EVENT_ENCOUNTER_ROUTE1_TEST, freeze: false},
                ])
                this.mapper.setBits([
                    {path: 'patch.encounter_flags.EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY', value: this.toggle_EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY, freeze: false},
                    {path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE3_SPEAROW',         value: this.toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW,         freeze: false},
                    {path: 'patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_SANDSHREW',       value: this.toggle_EVENT_ENCOUNTER_MTMOON_SANDSHREW,       freeze: false},
                    {path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE16_DODUO',          value: this.toggle_EVENT_ENCOUNTER_ROUTE16_DODUO,          freeze: false},
                ])
            }
            else if (game == 'Red and Blue') {
                // this.mapper.properties.patch.wEarlyEncounters.set(early_encounters_value, false)
                this.mapper.setBits([ // Set bits can only be called on properties that share the same address
                    {path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE3_SPEAROW',  value: this.toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW,  freeze: false},
                    {path: 'patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_GEODUDE',  value: this.toggle_EVENT_ENCOUNTER_MTMOON_GEODUDE,  freeze: false},
                    {path: 'patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_PARAS',    value: this.toggle_EVENT_ENCOUNTER_MTMOON_PARAS,    freeze: false},
                    {path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE6_CUT_USER', value: this.toggle_EVENT_ENCOUNTER_ROUTE6_CUT_USER, freeze: false},
                ])
                this.mapper.setBits([
                    {path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE16_DODUO',  value: this.toggle_EVENT_ENCOUNTER_ROUTE16_DODUO, freeze: false},
                ])
            }
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
        toggleDataType() {
            // Cycle through the values
            this.key_F16 = this.cycleValues_failures[this.cycleIndex_failures];
            this.cycleIndex_failures = (this.cycleIndex_failures + 1) % this.cycleValues_failures.length;
            this.set_setting_prop("this.cycleIndex_failures", this.cycleIndex_failures)
        },
        removeSpecialChars(str) {
            // This will replace any character that is not a lowercase letter or number with an empty string
            // and convert the string to lowercase
            return str.replace(/[^a-z0-9]/gi, '').toLowerCase();
        },

        padTime(time) {
            if (!time) { return "00" }
            return time.toString().padStart(2, "0")
        },
        async newRun() {
            this.compared_splits = []
            this.current_splits = []

            this.battle_summary_header = "Battle Summary"
            this.most_recent_move = ""
            this.timer.setTimer(this.timer_startTimeOffset)

            this.playerResets = 0
            this.finished_logs = false
            this.blackout_counter = 0
            this.playerId = 0
            this.playerName = "NINTEN"
        },

        //*text methods
        //only allow letters to be typed in the name input
        isLetter(e) {
            let char = String.fromCharCode(e.keyCode); // Get the character
            if(/^[A-Za-z]+$/.test(char)) return true; // Match with regex 
            else e.preventDefault(); // If not match, don't add to input text
        },

        pkmn_type(typeNumber) {
            data = this.g1PokemonData[this.starterName]
            if (this.state == `Battle`) {
                return this.mapper?.properties?.battle?.yourPokemon?.["type" + typeNumber.toString()].value ? this.mapper?.properties?.battle?.yourPokemon?.["type" + typeNumber.toString()].value?.toLowerCase() : this.g1PokemonData[this.starterName]['type' + typeNumber.toString()]
            }
            if (this.state == `Overworld` || this.state == `To Battle` || this.state == `From Battle`) {
                return this.mapper?.properties?.player?.team[0]?.["type" + typeNumber.toString()]?.value ? this.mapper?.properties?.player?.team[0]?.["type" + typeNumber.toString()]?.value?.toLowerCase() : this.g1PokemonData[this.starterName]['type' + typeNumber.toString()]
            }
            if (this.state != `Battle`) {
                return data["type" + typeNumber.toString()].toLowerCase()
            }
            if (this.state == "Base Stats" || this.mapper.properties.player.team[0].species.value == null) {
                return this.g1PokemonData[this.starterName]["type" + typeNumber.toString()]?.toLowerCase()
            }
        },
        //string can be: clear, increment, decrement
        resets_clear() {
            this.playerResets = 0
            this.blackout_counter = 0
        },
        resets_increment() {
            if (this.key_F16 == "blackouts") {
                this.blackout_counter++
            }
            if (this.key_F16 == "resets") {
                this.playerResets++
            }
            if (this.key_F16 == "faults") {
                this.playerResets++
            }
        },
        resets_decrement() {
            if (this.key_F16 == "blackouts") {
                this.blackout_counter--
            }
            if (this.key_F16 == "resets") {
                this.playerResets--
            }
            if (this.key_F16 == "faults") {
                this.playerResets--
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
        async colorPick() {
            return new EyeDropper().open().then(res => res.sRGBHex)
        },
        async color_picker() {
            var color = await this.colorPick()
            // this.set_pokemon_prop("overlay_color", color)
            this.overlay_color = color
        },
        reset_advanced_settings() {
            this.battleGraphic =              true
            this.showAllTrainers =            true
            this.showSpecialTrainerGraphics = true
            this.show_wild_battles =          false
            this.battlePopUps =               true
            this.showCritMultiplierInEP =     true
            this.rockTunnelDarkness =         false
        },
        apply_settings(setting_group) { //pass in the name of the group of settings that are to have values assigned
            keys = this.settings[setting_group]

            Object.keys(keys).forEach(key => {
                this[key] = keys[key];
            });
        },
        save_pb_splits() {
            this.pb_splits = this.split_data
            const championSplit = this.split_data.find(subArray => subArray.includes("Champion"));
            if (championSplit) {
                this.pb_time = championSplit[3]
            }
        },
        pb_split(splitName) {
            if (this.pb_splits) {
                let result = this.pb_splits.find(x => x.includes(splitName))
                if (result) {
                    return result
                }
                else {
                    return null
                }
            }
            else {
                return null
            }
        },
        splits_clear() {
            this.split_data = []
        },
        split_offset_calculation(duration1, duration2) {
            const totalSeconds = this.convertDurationToSeconds(duration1) - this.convertDurationToSeconds(duration2);
            return this.convertSecondsToDuration(totalSeconds);
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
        select_starter(pokemon_species) {
            this.starterName = pokemon_species
        },

        //ENEMY MOD STYLING
        get_enemy_pkmn_styles(pkmnData) {
            const isFainted = pkmnData?.hp.value == 0;
            return {
              faint: isFainted
                ? "filter: drop-shadow(2px 2px 2px #000) saturate(1.3) grayscale(100%); opacity: .5;"
                : "filter: drop-shadow(2px 2px 2px #000) saturate(1.3) grayscale(0%);",
              faint_stats_background: isFainted
                ? "filter: grayscale(100%); opacity: .3;"
                : "filter: grayscale(0%);",
              faintStats: isFainted
                ? "filter: grayscale(100%); opacity: .4;"
                : "filter: grayscale(0%);",
              text: isFainted ? "opacity: .3" : "",
              species: isFainted ? "opacity: .3" : "opacity: .7"
            };
        },

        //Determine the number of vitamins that can still be used on the Pokemon
        //stat exp ranges from 0 - 65535
        statExp(statExp) {
            const vitaminsUsed = statExp / 2560;
            const usableVitamins = Math.ceil(10 - vitaminsUsed);
            return usableVitamins < 0 ? 0 : usableVitamins;
        },
        trainerName(trainerClass) {
            if (trainerClass == "RIVAL1" || trainerClass == "RIVAL2" || trainerClass == "RIVAL3")
                return "Rival"
            else
                return trainerClass
        },
        //TYPE ICONS FOR THE STARTER SELECTION
        //lookup type data from the static data objects
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
                    return `images/elements/types/${this.getStarterType.type1.toLowerCase()}.png`
                }
                else if (typeNumber == 2) {
                    return `images/elements/types/${this.getStarterType.type2.toLowerCase()}.png`
                }
            }
        },

        pokemon(y) {
            if (y != null)
                y = parseInt(y)
            return this.g1PokemonData[this.starterName]
        },

        //! TODO Why do trainer graphics not appear in Red & Blue?
        //! Requires testing
        //pick the trainer graphic based on the trainer class and number
        specialTrainerGraphics() {
            if (this.showSpecialTrainerGraphics) {
              const trainerClass = this.mapper.properties.battle.trainer.class
              const trainerNumber = this.mapper.properties.battle.trainer.number
              if (this.mapper.properties.meta.gameName.value == "Yellow") {
                switch (`${trainerClass}_${trainerNumber}`) {
                    case "LT.SURGE_1":      return "images/trainers/ltsurge.png";
                    case "SABRINA_1":       return "images/trainers/sabrina.png";
                    case "BLAINE_1":        return "images/trainers/blaine.png";
                    case "RIVAL1_1":        return "images/trainers/RIVAL1.png";
                    case "RIVAL1_2":        return "images/trainers/RIVAL1.png";
                    case "RIVAL1_3":        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_4":        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_5":        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_6":        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_7":        return "images/trainers/RIVAL2.png";
                    case "RIVAL2_1":        return "images/trainers/RIVAL2.png";
                    case "ROCKET_42":       return "images/trainers/JESSIE_JAMES_1.png";
                    case "ROCKET_44":       return "images/trainers/JESSIE_JAMES_2.png";
                    case "ROCKET_45":       return "images/trainers/JESSIE_JAMES_2.png";
                    case "JR TRAINER F_5":  return "images/trainers/JR TRAINER F_5.png";
                    case "YOUNGSTER_1":     return "images/trainers/BEN.png";
                    case "POKEMANIAC_7":    return "images/trainers/POKEMANIAC_7.png";
                    case "SUPER NERD_2":    return "images/trainers/FOSSIL_NERD.png";
                    case "LASS_10":         return "images/trainers/ODDISH_LASS.png";
                    case "FISHER_7":        return "images/trainers/SIKE.png";
                    case "JR TRAINER F_10": return "images/trainers/JR TRAINER F_10.png";
                    case "ROCKET_5":        return "images/trainers/dig_rocket.png";
                    case "ROCKET_38":       return "images/trainers/ROCKET_38.png";
                    case "HIKER_9":         return "images/trainers/HIKER_9.png";
                    case "LASS_3":          return "images/trainers/LASS_3.png";
                    case "JR TRAINER F_1":  return "images/trainers/GOLDEEN.png";
                    case "ROCKET_25":       return "images/trainers/HYPNO_SANDWICH.png";
                    case "JR TRAINER F_3":  return "images/trainers/JR TRAINER F_3.png";
                    case "CHANNELER_10":    return "images/trainers/AGATHAJR.png";
                    case "BROCK_1":         return "images/trainers/brock.png";
                    case "MISTY_1":         return "images/trainers/misty.png";
                    case "ERIKA_1":         return "images/trainers/erika.png";
                    case "KOGA_1":          return "images/trainers/koga.png";
                    case "LORELEI_1":       return "images/trainers/lorelei.png";
                    case "BRUNO_1":         return "images/trainers/bruno.png";
                    case "AGATHA_1":        return "images/trainers/agatha.png";
                    case "LANCE_1":         return "images/trainers/lance.png";
                    case "HIKER_2":         return "images/trainers/elixir_hiker.png";
                    default:                return null;
                }
              }
              if (this.mapper.properties.meta.gameName == "Red and Blue") {
                switch (`${trainerClass}_${trainerNumber}`) {
                    case "LT.SURGE_1":      return "images/trainers/Red_and_Blue/ltsurge.png";
                    case "SABRINA_1":       return "images/trainers/Red_and_Blue/sabrina.png";
                    case "BLAINE_1":        return "images/trainers/Red_and_Blue/blaine.png";
                    case "RIVAL1_1":        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_2":        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_3":        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_4":        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_5":        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_6":        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_7":        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL1_8":        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL1_9":        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL2_1":        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL2_2":        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL2_3":        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "JR TRAINER F_5":  return "images/trainers/Red_and_Blue/JR TRAINER F_5.png";
                    case "YOUNGSTER_1":     return "images/trainers/Red_and_Blue/BEN.png";
                    case "POKEMANIAC_7":    return "images/trainers/Red_and_Blue/POKEMANIAC_7.png";
                    case "SUPER NERD_2":    return "images/trainers/Red_and_Blue/FOSSIL_NERD.png";
                    case "LASS_10":         return "images/trainers/Red_and_Blue/ODDISH_LASS.png";
                    case "JR TRAINER F_10": return "images/trainers/Red_and_Blue/JR TRAINER F_10.png";
                    case "ROCKET_5":        return "images/trainers/dig_rocket.png";
                    case "ROCKET_38":       return "images/trainers/Red_and_Blue/ROCKET_38.png";
                    case "HIKER_9":         return "images/trainers/Red_and_Blue/HIKER_9.png";
                    case "LASS_3":          return "images/trainers/Red_and_Blue/LASS_3.png";
                    case "JR TRAINER F_1":  return "images/trainers/Red_and_Blue/GOLDEEN.png";
                    case "ROCKET_25":       return "images/trainers/Red_and_Blue/HYPNO_SANDWICH.png";
                    case "JR TRAINER F_3":  return "images/trainers/Red_and_Blue/JR TRAINER F_3.png";
                    case "CHANNELER_10":    return "images/trainers/Red_and_Blue/AGATHAJR.png";
                    case "BROCK_1":         return "images/trainers/Red_and_Blue/brock.png";
                    case "MISTY_1":         return "images/trainers/Red_and_Blue/misty.png";
                    case "ERIKA_1":         return "images/trainers/Red_and_Blue/erika.png";
                    case "KOGA_1":          return "images/trainers/Red_and_Blue/koga.png";
                    case "LORELEI_1":       return "images/trainers/lorelei.png";
                    case "BRUNO_1":         return "images/trainers/bruno.png";
                    case "AGATHA_1":        return "images/trainers/agatha.png";
                    case "LANCE_1":         return "images/trainers/lance.png";
                    case "ROCKET_1":        return "images/trainers/Red_and_Blue/mtmoon_rocket_boss.png";
                    case "HIKER_2":         return "images/trainers/Red_and_Blue/elixir_hiker.png";
                    default:                return null;
                }
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
            return `height: ${heights[totalPokemon]}; filter: saturate(${this.ui_saturation}) drop-shadow(0px 0px 1px #000000)`;
        },
        // MOVE MANAGEMENT
        sleep(ms) {
            return new Promise((res) => setTimeout(res, ms))
        },

        enemy_move_power(move_name) {
            var move_power = this.g1MoveData[this.move_name(move_name)].Power ?? 0
            if (move_power == 0) { return "—" }
            if (move_power == 1) { return "—" }
            if (move_power == "—") { return "—" }
            if (move_power == "-") { return "—" }
            if (move_power == "") { return "—" }
            else return move_power
        },
        enemy_effective_power(move_name, enemy_mon, slot) {
            const state = this.state
            const enemy_state = this.enemyState
            const move = this.move_name(move_name)
            if (state == 'To Battle' || state == 'Battle' || state == 'From Battle') { 
                const species = enemy_mon.species.value
                const move_data = this.g1MoveData[move]
                //This logs the setup of this function if the next line is going fail due to move data being undefined
                if (move_data == undefined) { 
                    console.log("enemy_effective_power", state, enemy_state, move_name, species, move_data)
                }
                const move_type = move_data.Type
                const move_base_power = this.enemy_move_power(move) ?? move_data.Power
                const move_category = move_data.Category
                const user_type_1 = this.g1PokemonData[species].type1
                const user_type_2 = this.g1PokemonData[species].type2
                const target_type_1 = this.mapper.properties.battle.yourPokemon.type1.value
                const target_type_2 = this.mapper.properties.battle.yourPokemon.type2.value
                if (move_base_power == "—" || move_base_power == "-") { return "—" }
                var player_reflect = this.mapper.properties.battle.yourPokemon.effects.reflect.value == true && move_category == 'Physical' ? 0.5 : 1
                var player_light_screen = this.mapper.properties.battle.yourPokemon.effects.lightScreen.value == true && move_category == 'Special' ? 0.5 : 1 
                var move_effective_power = move_base_power
                var modifier_effectiveness_1 = this.typeData.find(x => x.moveType == move_type)[target_type_1]
                var modifier_effectiveness_2 = target_type_2 && move_type && (target_type_1 != target_type_2) ? this.typeData.find(x => x.moveType == move_type)[target_type_2]
                    : 1
                var modifier_effectiveness_3 = 1
                var modifier_stab = move_type == user_type_1 ? 1.5 
                    : move_type == user_type_2 ? 1.5 
                    : move_type == "Ghost" && this.mapper.properties.patch.backport.prop_2.value == 8 && slot == this.mapper.properties.battle.enemyPokemon.partyPos.value ? 1.5
                    : 1
    
                //Calculate effective power
                if (this.typeCalcs == true) { //Handles type effectiveness calculations in battle
                    return Math.floor(move_base_power * modifier_stab * modifier_effectiveness_1 * modifier_effectiveness_2 * modifier_effectiveness_3 * player_reflect * player_light_screen)
                }
            }
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
    },

//--------- PROGRAM MOUNTED ---------------------------------------------------------------------------------------------------------------//
    mounted: async function () {
        const that = this
        this.mapper = new GameHookMapperClient()
        this.mapper.onConnected = (x) => this.ready = true
        this.mapper.onDisconnected = (x) => this.ready = false
        await this.mapper.connect()

        if (this.mapper.properties.meta.state.value == "No Pokemon") {
            this.state = "Base Stats"
        }
        else {
            this.state = this.mapper.properties.meta.state.value
        }
        this.load_split_settings()
        this.timer.update();

        this.pokemon_list = this.keys_function(g1PokemonData)

        //image transition
        await transition(t => {
        // this part gets called at every frame of the browser
        // the variable t starts at 0 and advances to 1
        }, 500)

        // reset tracking
        this.mapper.properties.player.playerId.change((newProp, oldProp) => {
            if (this.lance_defeated == true) {
                this.lance_defeated = false
            }
            else if (newProp.value == 0 && oldProp.value > 0 && this.game_over == false) {
                this.blackout = false;
                this.playerResets++;
            } 
        })
        this.mapper.properties.player.playerId.change((newProp) => {
            if (newProp.value > 0 && this.game_over == false) {
                if (newProp.value != this.playerId) {
                    if (this.no_attempt == true) {
                        return
                    }
                    this.playerResets = 0;
                    this.blackout_counter = 0;
                    this.finished_logs = false;
                    if (this.test_run == false && this.refilming_mode == false) {
                        this.attempt_number++
                    };
                    this.most_recent_move = "";
                    // this.startTime();
                    this.timer.startTime(this.timer_startTimeOffset);
                    if (this.toggle_wEarlyEncounters == false && this.toggle_wEarlyEncountersNoMoon == true) {
                        this.toggle_wEarlyEncounters == true
                    }
                    this.playerId = newProp.value;
                }
            }
        })
        this.mapper.properties.player.name.change((newProp) => {
            if (this.game_over == true && newProp.value == "NINTEN") {
                this.game_over = false;
            }
        })

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
        // the `lowHealthAlarm` property is used to play the Red-bar sound effect
        // it is turned off as soon as "Player defeated Trainer" starts to render in the textbox
        this.mapper.properties.battle.lowHealthAlarm.change((prop) => {
            //Collect battle starting metrics
            autosplitter_process()
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
                    autosplitter_process()
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

        //*blackout tracking
        //track when the player has a blackout
        this.mapper.properties.player.team[0].hp.change((newProp, oldProp) => {
            if (newProp.value == 0 && this.state == `Battle`) {
                this.blackout = true;
            }
        })

        //new blackout tracking for loop processed gamestate
        this.mapper.properties.meta.state.change((newProp, oldProp) => {
            if (newProp.value == "Overworld" && oldProp.value == "Battle" && this.blackout == true) {
                this.blackout = false;
                if (this.enable_blackouts) { this.blackout_counter++; }
            }
            else if (newProp.value == "Overworld") {
                this.blackout = false;
            }
            if (newProp.value == "To Battle" && this.automatic_splits == true && this.mapper.properties.battle.type.value == "Trainer") {
                this.automatic_splits = false
                this.right_panel = 'Automatic'
            }
        });

        this.mapper.properties.meta.state.change(async (newProp) => {
            if (newProp.value == "No Pokemon") {
                this.state = "Base Stats"
            }
            else {
                this.state = newProp.value
            }
        });

        //Functions to track the battle's state
        if (this.mapper.properties.player.team[0].level.value == 0) 
            this.enemyState = "Not In Battle";
        else if (this.mapper.properties.battle.type.value == "None")
            this.enemyState = "Not In Battle";
        else if (this.mapper.properties.battle.turnInfo.battleStart.value == 0)
            this.enemyState = "Battle Starting";
        else if (this.mapper.properties.battle.lowHealthAlarm.value ==  "Disabled")
            this.enemyState = "Battle Finished";
        else if  (this.mapper.properties.battle.enemyPokemon.hp.value == 0)
            this.enemyState = "Fainted";
        else if  (this.mapper.properties.battle.enemyPokemon.hp.value > 0 && this.mapper.properties.screen.menu.currentItem.value == 0)
            this.enemyState = "Pokemon Sent Out";
        else if  (this.mapper.properties.battle.enemyPokemon.hp.value > 0 && this.mapper.properties.screen.menu.currentItem.value > 0)
            this.enemyState = "Pokemon";
        this.mapper.properties.battle.type.change((prop) => {
            if (prop.value == "Wild" || prop.value == "Trainer") {
                this.enemyState = "Battle Starting";
            }
        });
        this.mapper.properties.screen.menu.currentItem.change(async (newProp, oldProp) => {
            if ((this.enemyState == "Fainted" || this.enemyState == "Battle Starting") && newProp == 0) {
                this.enemyState = "Pokemon Sent Out"
            }
            if ((this.enemyState == "Pokemon Sent Out") && newProp > 0) {
                this.enemyState = "Pokemon"
            }
        });
        this.mapper.properties.battle.turnInfo.battleStart.change((prop) => {
            if (prop.value != 0 && this.state == "To Battle") {
                this.enemyState = "Pokemon";
            }
        });
        this.mapper.properties.battle.enemyPokemon.hp.change(async (newProp, oldProp) => {
            if (newProp == 0 && this.enemyState == "Pokemon") {
                this.enemyState = "Fainting"
            }
        });
        this.mapper.properties.screen.tiles.column1.tile7.change((prop) => {
            if (prop == 127 && 
                this.mapper.properties.screen.tiles.column1.tile6 == 127 && 
                this.mapper.properties.screen.tiles.column1.tile5 == 127 && 
                this.mapper.properties.screen.tiles.column1.tile4 == 127 && 
                this.mapper.properties.screen.tiles.column1.tile3 == 127 && 
                this.mapper.properties.screen.tiles.column1.tile2 == 127 && 
                this.mapper.properties.screen.tiles.column1.tile1 == 127 &&
                this.enemyState == "Fainting") {
                    this.enemyState = "Fainted"
                }
        });
        this.mapper.properties.battle.turnInfo.trainerDefeated.change(async (prop) => {
            if (prop == 1) {
                this.enemyState = "Battle Finished"
            }
        });

        //HM Encounters
        this.mapper.properties.overworld.map.change((newValue, oldValue) => {
            if (newValue.value == "Pallet Town" && oldValue.value == "Pallet Town - Oak's Lab" && this.mapper.properties.events.got_pokedex.value == false) {
                this.set_encounters()
            }
            else if (this.toggle_wEarlyEncountersNoMoon && (newValue.value == "Mt Moon - 1" || newValue.value == "Mt Moon - 2" || newValue.value == "Mt Moon - 3")) {
                this.mapper.properties.patch.wEarlyEncounters.set("Off", false)
            }
            // Alakazam Yellow exception
            else if (this.game_name == "Yellow" && this.starterName == "Alakazam" && newValue.value == "Mt Moon - 1" || newValue.value == "Mt Moon - 2" || newValue.value == "Mt Moon - 3") {
                this.mapper.properties.patch.wEarlyEncounters.set("Off", false)
            }
            else if (newValue.value == "Viridian Forest" && this.game_name == "Yellow" && this.starterName == "Alakazam" && this.mapper.properties?.trainers?.viridianForest?.bugcatcher2?.value == false) {
                this.mapper.properties.patch.wEarlyEncounters.set("Off", false)
            }
        })
        // Alakazam Yellow exception
        this.mapper.properties?.trainers?.viridianForest?.bugcatcher2.change((newValue, oldValue) => {
            if (this.game_name == "Yellow" && this.starterName == "Alakazam" && newValue.value == true) {
                this.mapper.properties.patch.wEarlyEncounters.set("On", false)
            }
        });
    },
}).mount('#app')