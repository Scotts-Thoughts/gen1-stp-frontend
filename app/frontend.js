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

// Open the folder ./splits/ in the file explorer with node.js
// function openFolder(folderName) {
//     require('child_process').exec(`start .\\${folderName}\\`);
// }

function downloadFile(content, downloadFileName) {
    const blob = new Blob([content], {type: "application/octet-stream"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.style.display = 'none';
    a.click();
    a.remove();
    setTimeout(function() {
        return window.URL.revokeObjectURL(url);
    }, 1000);
}

class RetroArchHook {
    client = undefined
    connected = false
    resolve = () => {}
    
    constructor() {
        if (!require) {
            console.error('RetroArchHook: require is not defined')
            return
        }

        this.client = require('dgram').createSocket('udp4');

        this.client.on('message', (msg, info) => {
            const s = String.fromCharCode(...msg).split(" ")
            if (s[0] === 'GET_STATUS') {
                this.resolve(s[1])
            }
        });
        
        this.client.connect(55355, '127.0.0.1', (err) => {
            // console.log(err)
            if (!err) {
                this.connected = true
            }
        });
    }

    async get_status() {
        // returns 'CONTENTLESS' | 'PLAYING' | 'PAUSED'
        return new Promise((resolve, reject) => {
            this.resolve = resolve
            this.client.send('GET_STATUS');
        })
    }
    
    async pause() {
        const status = await this.get_status()
        if (status === 'PLAYING') {
            this.client.send('PAUSE_TOGGLE');
        }
    }

    async resume() {
        const status = await this.get_status()
        if (status === 'PAUSED') {
            this.client.send('PAUSE_TOGGLE');
        }
    }

    async fastForward() {
        this.client.send('FAST_FORWARD');
    }
}

const retro = new RetroArchHook()

const Keys = {
    "ESCAPE":         0x1B,
    "BACKSPACE":      0x08,
    "TAB":            0x09,
    
    "LEFT":           0x25,
    "UP":             0x26,
    "RIGHT":          0x27,
    "DOWN":           0x28,
    
    "CAPS_LOCK":      0x14,
    "NUM_LOCK":       0x90,
    "SCROLL_LOCK":    0x91,
    
    "SHIFT":          0x10,
    "L_SHIFT":        0xA0,
    "R_SHIFT":        0xA1,

    "CTRL":           0x11,
    "L_CTRL":         0xA2,
    "R_CTRL":         0xA3,
    
    "ALT":            0x12,
    "L_ALT":          0xA4,
    "R_ALT":          0xA5,
    
    "L_WIN":          0x5B,
    "R_WIN":          0x5C,

    "0":              0x30,
    "1":              0x31,
    "2":              0x32,
    "3":              0x33,
    "4":              0x34,
    "5":              0x35,
    "6":              0x36,
    "7":              0x37,
    "8":              0x38,
    "9":              0x39,

    "A":              0x41,
    "B":              0x42,
    "C":              0x43,
    "D":              0x44,
    "E":              0x45,
    "F":              0x46,
    "G":              0x47,
    "H":              0x48,
    "I":              0x49,
    "J":              0x4A,
    "K":              0x4B,
    "L":              0x4C,
    "M":              0x4D,
    "N":              0x4E,
    "O":              0x4F,
    "P":              0x50,
    "Q":              0x51,
    "R":              0x52,
    "S":              0x53,
    "T":              0x54,
    "U":              0x55,
    "V":              0x56,
    "W":              0x57,
    "X":              0x58,
    "Y":              0x59,
    "Z":              0x5A,

    "NUMPAD0":        0x60,
    "NUMPAD1":        0x61,
    "NUMPAD2":        0x62,
    "NUMPAD3":        0x63,
    "NUMPAD4":        0x64,
    "NUMPAD5":        0x65,
    "NUMPAD6":        0x66,
    "NUMPAD7":        0x67,
    "NUMPAD8":        0x68,
    "NUMPAD9":        0x69,
    "SEPARATOR":      0x6C,
    "DECIMAL":        0x6E,

    "MULTIPLY":       0x6A,
    "ADD":            0x6B,
    "SUBTRACT":       0x6D,
    "DIVIDE":         0x6F,
    
    "F1":             0x70,
    "F2":             0x71,
    "F3":             0x72,
    "F4":             0x73,
    "F5":             0x74,
    "F6":             0x75,
    "F7":             0x76,
    "F8":             0x77,
    "F9":             0x78,
    "F10":            0x79,
    "F11":            0x7A,
    "F12":            0x7B,
    "F13":            0x7C,
    "F14":            0x7D,
    "F15":            0x7E,
    "F16":            0x7F,
    "F17":            0x80,
    "F18":            0x81,
    "F19":            0x82,
    "F20":            0x83,
    "F21":            0x84,
    "F22":            0x85,
    "F23":            0x86,
    "F24":            0x87,


    "APPS":           0x5D,
    "CLEAR":          0x0C,
    "RETURN":         0x0D,
    "PAUSE":          0x13,

    "CONVERT":        0x1C,
    "NONCONVERT":     0x1D,
    "ACCEPT":         0x1E,
    "MODECHANGE":     0x1F,

    "SPACE":          0x20,
    "PRIOR":          0x21,
    "NEXT":           0x22,
    "END":            0x23,
    "HOME":           0x24,
    "SELECT":         0x29,
    "PRINT":          0x2A,
    "EXECUTE":        0x2B,
    "SNAPSHOT":       0x2C,
    "INSERT":         0x2D,
    "DELETE":         0x2E,
    "HELP":           0x2F,
    "SLEEP":          0x5F,
}

Object.entries(Keys).forEach(([k, v]) => Keys[v] = k);

class KeyHook {
    constructor() {
        // start the keyboard hook
        this.process = require("child_process").spawn("keyhook.exe");

        // general logging
        // this.process.on("spawn", () => console.log("Keyboard hook started!"));
        this.process.stderr.on("data", (data) => console.error(`${data}`));
        
        // handle output of the keyboard hook
        this.process.stdout.on("data", (data) => {
            for (const line of data.toString().split(/[\n\r]+/)) {
                const parts = line.split(",").map(x => parseInt(x, 10));
                const [down, key, time] = parts;
                
                if (parts.length !== 3 || parts.some(isNaN)) continue;
                this._processKey(down === 1, key, time);
            }
        });  
    
        // general initialization
        for (let i=0; i<256; i++)
            this._keyState[i] = false;
    }
        
    _listeners = {};
    _keyState = [];
    _processKey(down, keyCode, time) {
        const oldState = this._keyState[keyCode] == true;
        this._keyState[keyCode] = down;
        const key = Keys[keyCode];
        let type = "unknown";

        if (oldState && down)
            type = "repeat";
        else if (down)
            type = "down";
        else
            type = "up";

        if (!this._listeners[type]) return;
        for (const listener of this._listeners[type]) {
            listener({
                type, 
                keyCode, 
                key, 
                alt: this.isAltDown,
                ctrl: this.isCtrlDown,
                shift: this.isShiftDown,
                time,
            });
        }
    }
  
    get isShiftDown() { return this._keyState[Keys.L_SHIFT] || this._keyState[Keys.R_SHIFT] || this._keyState[Keys.SHIFT]; }
    get isCtrlDown()  { return this._keyState[Keys.L_CTRL]  || this._keyState[Keys.R_CTRL]  || this._keyState[Keys.CTRL]; }
    get isAltDown()   { return this._keyState[Keys.L_ALT]   || this._keyState[Keys.R_ALT]   || this._keyState[Keys.ALT]; }

    isKeyDown(key) { 
        if (typeof key === 'string') key = Keys[key.toUpperCase()];
        return this._keyState[key];
    }
    
    on(event, callback) {
        if (this._listeners[event] === undefined)
            this._listeners[event] = [];
        this._listeners[event].push(callback);
    }

    registerShortCut(shortCut, callback) {
        // transform the shortcut into an array of key codes
        if (typeof shortCut === 'number')
            shortCut = [shortCut];
        if (typeof shortCut === 'string')
            shortCut = shortCut.toUpperCase().split("+").map(x => Keys[x.trim()]);
            shortCut = shortCut.map(x => {
            if (typeof x === 'string') x = Keys[x.toUpperCase()];
            if (x === Keys.L_SHIFT || x === Keys.R_SHIFT) x = Keys.SHIFT;
            if (x === Keys.L_CTRL || x === Keys.R_CTRL) x = Keys.CTRL;
            if (x === Keys.L_ALT || x === Keys.R_ALT) x = Keys.ALT;
            return x;
        });

        const checkAlt = shortCut.includes(Keys.ALT);
        const checkCtrl = shortCut.includes(Keys.CTRL);
        const checkShift = shortCut.includes(Keys.SHIFT);
        const checkKeys = shortCut.filter(x => x !== Keys.ALT && x !== Keys.CTRL && x !== Keys.SHIFT);

        if (checkKeys.some(x => typeof x !== 'number')) 
            throw new Error("Invalid key code");

        this.on("down", (data) => {
            if (
                checkAlt === data.alt &&
                checkCtrl === data.ctrl &&
                checkShift === data.shift &&
                checkKeys.every(x => this.isKeyDown(x))
            ) {
                callback();
            }
        });
    }

    stop() {
        return this.process.kill();
    }
}
const keyhook = new KeyHook();

const fs = require("fs");
const path = require("path");
const { finished } = require('stream');
const Timer = require("./logic/Timer.js");

for (let folder of folders = ['splits', 'splits/Yellow', 'splits/Red and Blue']) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
}

function logData(gameName, gameName_Path, str, file_name, starterName, log_type, testStatus, refilming_mode, refilmed_attempt, refilmed_finish) {
    const dirPath = refilming_mode ? `./splits/${gameName_Path}/${starterName}/refilmed/attempts/` : `./splits/${gameName_Path}/${starterName}/attempts/`;
    const testStatusText = testStatus ? "test_run_" : "";
    let attempt_number = refilming_mode ? refilmed_attempt : file_name;
    let filePath = path.join(dirPath, `${gameName}-${testStatusText}${starterName}-${attempt_number}-simple.csv`);
    let header = "player_name,pokemon,trainer_name,real_time_hmmss,resets,blackouts,failures,level,game_time,battle_duration,move1,move2,move3,move4\n";
    if (log_type == "Simple") {
        header = "player_name,pokemon,trainer_name,real_time_hmmss,resets,blackouts,level,game_time," +
        "battle_duration,move1,move2,move3,move4\n";
    }
    else if (log_type == "Full") {
        filePath = path.join(dirPath, `${gameName}-${testStatusText}${starterName}-${attempt_number}-full.csv`);
        header = "date_string,time_string,player_name,pokemon,trainer_name,trainer_id,location,total_pokemon," +
            "real_time_total,real_time_hmmss,real_time_file_label,resets,blackouts,failures,level,game_time,battle_duration," + 
            "move1,move2,move3,move4,move1pp,move2pp,move3pp,move4pp,move1ppUp,move2ppUp,move3ppUp,move4ppUp," +
            "saves,steps,bonks,trainerBattles,wildBattles,battleTurns,playerTurns,enemyTurns," +
            "itemsInBag,money,rivalTeam," +
            "statusCondition,type1,type2,experience," +
            "ROM,Species,Trainer,Start Time,Real Time,Game Time,Level,Resets," +
            "RTHours,RTMinutes,RTSeconds,RTMilliseconds,Move 1,Move 2,Move 3,Move 4," +
            "Hp,Max HP,Attack,Defense,Sp. Attack,Sp. Defense,Speed,Attack DV,Defense DV,Speed DV,Special DV," +
            "StatExp HP,StatExp Attack,StatExp Def,StatExp Sp. Attack,StatExp Sp. Defense,StatExp Speed," +
            "Attack Stage,Defense Stage,Sp. Attack Stage,Sp. Defense Stage,Speed Stage,Accuracy Stage,Evasion Stage," +
            "Battle Attack,Battle Defense,Battle Sp. Attack,Battle Sp. Defense,Battle Speed," +
            "Frame Count,Overworld Frame Count,Battle Frame Count,Menu Frame Count,Intro Frame Count," +
            "Save Count,Reload Count,Clock Reset Count,Steps Count,Steps Count Walk,Steps Count Bike,Steps Count Surf,Bonks," + 
            "Battles,Trainer Battles,Wild Battles,Battles Fled,Failed Runs," +
            "Total Damage Dealt,Actual Damage Dealt,Total Damage Taken,Actual Damage Taken," +
            "Own Moves Hit,Own Moves Missed,Enemy Moves Hit,Enemy Moves Missed," +
            "Own Moves Super Effective,Own Moves Not Very Effective,Enemy Moves Super Effective,Enemy Moves Not Very Effective," +
            "Criticals Dealt,OHKOs Dealt,Criticals Taken,OHKOs Taken," +
            "Was Confused,Enemy Became Confused,Was Paralyzed,Enemy Was Paralyzed,Was Burned,Enemy Was Burned," +
            "Was Frozen,Enemy Was Frozen,Was Poisoned,Enemy Was Poisoned,Was Badly Poisoned,Enemy Was Badly Poisoned," +
            "Fell Asleep,Enemy Fell Asleep,Player Turns Confused,Player Turns Confused Hit Self,Player Turns Paralyzed," +
            "Player Turns Paralyzed Fully,Enemy Turns Confused,Enemy Turns Confused Hit Self,Enemy Turns Paralyzed," +
            "Enemy Turns Paralyzed Fully, Player Turns Asleep, Enemy Turns Asleep,Player HP Healed,Enemy HP Healed," +
            "Player Pokemon Fainted,Enemy Pokemon Fainted," +
            "Experience Gained,Switchouts," +
            "Money Made,Money Spent,Money Lost," +
            "Items Picked Up,Items Bought,Items Sold," +
            "Balls Thrown,Pokemon Caught In Balls,Moves Learnt," +
            "Blackouts,Attempt Number,Failures, Rival's Team\n";
    }
    else if (log_type == "Deprecated") {
        filePath = path.join(dirPath, `${gameName}-${testStatusText}${starterName}-${attempt_number}.csv`);
        header = "ROM,Species,Trainer,Start Time,Real Time,Game Time,Level,Resets," +
            "RTHours,RTMinutes,RTSeconds,RTMilliseconds,Move 1,Move 2,Move 3,Move 4," +
            "Attack,Defense,Sp. Attack,Sp. Defense,Speed," +
            "Attack Stage,Defense Stage,Sp. Attack Stage,Sp. Defense Stage,Speed Stage,Accuracy Stage,Evasion Stage," +
            "Battle Attack,Battle Defense,Battle Sp. Attack,Battle Sp. Defense,Battle Speed," +
            "Frame Count,Overworld Frame Count,Battle Frame Count,Menu Frame Count,Intro Frame Count," +
            "Save Count,Reload Count,Clock Reset Count,Steps Count,Steps Count Walk,Steps Count Bike,Steps Count Surf,Bonks," + 
            "Battles,Trainer Battles,Wild Battles,Battles Fled,Failed Runs," +
            "Total Damage Dealt,Actual Damage Dealt,Total Damage Taken,Actual Damage Taken," +
            "Own Moves Hit,Own Moves Missed,Enemy Moves Hit,Enemy Moves Missed," +
            "Own Moves Super Effective,Own Moves Not Very Effective,Enemy Moves Super Effective,Enemy Moves Not Very Effective," +
            "Criticals Dealt,OHKOs Dealt,Criticals Taken,OHKOs Taken," +
            "Was Confused,Enemy Became Confused,Was Paralyzed,Enemy Was Paralyzed,Was Burned,Enemy Was Burned," +
            "Was Frozen,Enemy Was Frozen,Was Poisoned,Enemy Was Poisoned,Was Badly Poisoned,Enemy Was Badly Poisoned," +
            "Fell Asleep,Enemy Fell Asleep,Player Turns Confused,Player Turns Confused Hit Self,Player Turns Paralyzed," +
            "Player Turns Paralyzed Fully,Enemy Turns Confused,Enemy Turns Confused Hit Self,Enemy Turns Paralyzed," +
            "Enemy Turns Paralyzed Fully,Player HP Healed,Enemy HP Healed," +
            "Player Pokemon Fainted,Enemy Pokemon Fainted," +
            "Experience Gained,Switchouts," +
            "Money Made,Money Spent,Money Lost," +
            "Items Picked Up,Items Bought,Items Sold," +
            "Balls Thrown,Pokemon Caught In Balls,Moves Learnt," +
            //new properties
            "Blackouts,Attempt Number,Failures, Rival's Team\n"
    }
    else if (log_type == "Battle Summary") {
        filePath = path.join(dirPath, `${gameName}-${testStatusText}${starterName}-${attempt_number}-battleSummary.csv`);
        header = "Unknown"
    }
    fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (!fs.existsSync(filePath)) {
            fs.writeFile(filePath, header, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    fs.appendFile(filePath, str, (err) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                }
            });
        } else {
            fs.appendFile(filePath, str, (err) => {
                if (err) {
                    console.error(err);
                }
            });   
        }
    });
}

function logCopy(gameName, gameName_Path, file_name, starterName, finished_run_count, refilming_mode, refilmed_attempt, refilmed_finish) {
    var dirPathAttempts = refilming_mode ? `./splits/${gameName_Path}/${starterName}/refilmed/attempts/` : `./splits/${gameName_Path}/${starterName}/attempts/`
    var dirPathFinishes = refilming_mode ? `./splits/${gameName_Path}/${starterName}/refilmed/finishes/` : `./splits/${gameName_Path}/${starterName}/finishes/`
    let attempt_number = refilming_mode ? refilmed_attempt : file_name;
    let finish_number = refilming_mode ? refilmed_attempt : finished_run_count;
    console.log("LogCopy Variables", gameName, gameName_Path, file_name, starterName, finished_run_count, dirPathAttempts, dirPathFinishes, attempt_number, finish_number)
    fs.mkdir(dirPathFinishes, { recursive: true }, (err) => {
        fs.copyFile(
            path.join(dirPathAttempts, `${gameName}-${starterName}-${attempt_number}-simple.csv`), 
            path.join(dirPathFinishes, `${gameName}-${starterName}-${finish_number}-simple.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.copyFile(
            path.join(dirPathAttempts, `${gameName}-${starterName}-${attempt_number}-full.csv`), 
            path.join(dirPathFinishes, `${gameName}-${starterName}-${finish_number}-full.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.copyFile(
            path.join(dirPathAttempts, `${gameName}-${starterName}-${attempt_number}.csv`), 
            path.join(dirPathFinishes, `${gameName}-${starterName}-${finish_number}.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
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

            temp_battle_summary_frames:        0,
            temp_battle_summary_battle_number: 0,
            temp_battle_summary_exp_gained:    0,
            temp_battle_summary_turns:         0,
            temp_battle_summary_player_turns:  0,
            temp_battle_summary_enemy_turns:   0,
            temp_battle_summary_player_hits:   0,
            temp_battle_summary_player_misses: 0,
            temp_battle_summary_player_crits:  0,
            temp_battle_summary_player_ohkos:  0,
            temp_battle_summary_enemy_hits:    0,
            temp_battle_summary_enemy_misses:  0,
            temp_battle_summary_enemy_crits:   0,
            temp_battle_summary_enemy_ohkos:   0,
            temp_battle_summary_player_Sx:     0,
            temp_battle_summary_player_4x:     0,
            temp_battle_summary_player_2x:     0,
            temp_battle_summary_player_1x:     0,
            temp_battle_summary_player_Hx:     0,
            temp_battle_summary_player_Qx:     0,
            temp_battle_summary_player_0x:     0,
            temp_battle_summary_player_con:    0,
            temp_battle_summary_player_par:    0,
            temp_battle_summary_player_brn:    0,
            temp_battle_summary_player_frz:    0,
            temp_battle_summary_player_psn:    0,
            temp_battle_summary_player_bpn:    0,
            temp_battle_summary_player_slp:    0,
            temp_battle_summary_enemy_Sx:      0,
            temp_battle_summary_enemy_4x:      0,
            temp_battle_summary_enemy_2x:      0,
            temp_battle_summary_enemy_1x:      0,
            temp_battle_summary_enemy_Hx:      0,
            temp_battle_summary_enemy_Qx:      0,
            temp_battle_summary_enemy_0x:      0,
            temp_battle_summary_enemy_con:     0,
            temp_battle_summary_enemy_par:     0,
            temp_battle_summary_enemy_brn:     0,
            temp_battle_summary_enemy_frz:     0,
            temp_battle_summary_enemy_psn:     0,
            temp_battle_summary_enemy_bpn:     0,
            temp_battle_summary_enemy_slp:     0,

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
            if (newProp.toString().length == 1) {
                document.getElementById("reset_counter").style.fontSize = "75px"
            }
            if (newProp.toString().length == 3) {
                document.getElementById("reset_counter").style.fontSize = "54px"
            }
            if (newProp.toString().length == 4) {
                document.getElementById("reset_counter").style.fontSize = "40px"
            }
            
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
        interface_1_props() {
            return {
                game_name: this.game_name,
                release: this.release,
                test_run: this.test_run,
                refilming_mode: this.refilming_mode,
                no_attempt: this.no_attempt,
                refilmed_attempt: this.refilmed_attempt,
                refilmed_finish: this.refilmed_finish,
                state: this.state,
                mapper: this.mapper,
                enemyState: this.enemyState,
                blackout: this.blackout,
                timer: this.timer,
                timer_startTimeOffset: this.timer_startTimeOffset,
                move1_replacement: this.move1_replacement,
                move2_replacement: this.move2_replacement,
                move3_replacement: this.move3_replacement,
                move4_replacement: this.move4_replacement,
                item1_replacement: this.item1_replacement,
                item2_replacement: this.item2_replacement,
                item3_replacement: this.item3_replacement,
                item4_replacement: this.item4_replacement,
                openFolder: this.openFolder,
                starterName: this.starterName,
                update_moveset: this.update_moveset,
                update_battle_moveset: this.update_battle_moveset,
                update_items: this.update_items,
            }
        },
        interface_2_props() {
            return {
                starterName: this.starterName,
                game_name: this.game_name,
                release: this.release,
                filtered_pokemon_list: this.filtered_pokemon_list,
                search_term: this.search_term,
                previous_label: this.previous_label,
                current_label: this.current_label,
                attempt_number: this.attempt_number,
                finished_run_count: this.finished_run_count,
                playerResets: this.playerResets,
                blackout_counter: this.blackout_counter,
                toggle_wEarlyEncounters: this.toggle_wEarlyEncounters,
                toggle_wEarlyEncountersNoMoon: this.toggle_wEarlyEncountersNoMoon,
                toggle_EVENT_ENCOUNTER_ROUTE1_TEST: this.toggle_EVENT_ENCOUNTER_ROUTE1_TEST,
                toggle_EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY: this.toggle_EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY,
                toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW: this.toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW,
                toggle_EVENT_ENCOUNTER_MTMOON_SANDSHREW: this.toggle_EVENT_ENCOUNTER_MTMOON_SANDSHREW,
                toggle_EVENT_ENCOUNTER_ROUTE16_DODUO: this.toggle_EVENT_ENCOUNTER_ROUTE16_DODUO,
                toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW: this.toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW,
                toggle_EVENT_ENCOUNTER_MTMOON_GEODUDE: this.toggle_EVENT_ENCOUNTER_MTMOON_GEODUDE,
                toggle_EVENT_ENCOUNTER_MTMOON_PARAS: this.toggle_EVENT_ENCOUNTER_MTMOON_PARAS,
                toggle_EVENT_ENCOUNTER_ROUTE6_CUT_USER: this.toggle_EVENT_ENCOUNTER_ROUTE6_CUT_USER,
                toggle_EVENT_ENCOUNTER_ROUTE16_DODUO: this.toggle_EVENT_ENCOUNTER_ROUTE16_DODUO,
                newRun: this.newRun,
                set_encounters: this.set_encounters,
                load_splits: this.load_splits,
                increment: this.increment,
                decrement: this.decrement,
                set_rom_starter: this.set_rom_starter,
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
        enemy_trainer() {
            const trainer = this.mapper.properties.battle.trainer.class.value
            const id = this.mapper.properties.battle.trainer.number.value
            const identifier = `${trainer} ${id}`
            if (this.game_name == 'Yellow') {
                if (this.state == 'To Battle' || this.state == 'Battle' || this.state == 'From Battle') {
                    return this.g1YellowTrainers[identifier]
                }
            }
            if (this.game_name == 'Red' || this.game_name == 'Blue') {
                if (this.state == 'To Battle' || this.state == 'Battle' || this.state == 'From Battle') {
                    return this.g1RedBlueTrainers[identifier]
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
        g1trainerEnemySelector() {
            if (this.ready) {
                let trainerClass = this.mapper.properties.battle.trainer.class.value
                if (this.showAllTrainers == false && (
                    trainerClass == "BROCK" ||
                    trainerClass == "MISTY" ||
                    trainerClass == "LT.SURGE" ||
                    trainerClass == "ERIKA" ||
                    trainerClass == "KOGA" ||
                    trainerClass == "SABRINA" ||
                    trainerClass == "BLAINE" ||
                    (trainerClass == "GIOVANNI" && this.mapper.properties.battle.trainer.number == 3) ||
                    trainerClass == "LORELEI" ||
                    trainerClass == "BRUNO" ||
                    trainerClass == "AGATHA" ||
                    trainerClass == "LANCE" ||
                    trainerClass == "RIVAL1" ||
                    trainerClass == "RIVAL2" ||
                    trainerClass == "RIVAL3" ||
                    (trainerClass == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 3) || //pidgey jr trainer
                    (trainerClass == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 5) || //wrapping lass
                    (trainerClass == "SUPER NERD" && this.mapper.properties.battle.trainer.number == 2) || //fossil nerd
                    (trainerClass == "POKEMANIAC" && this.mapper.properties.battle.trainer.number == 7) || //cubone slowpoke maniac
                    (trainerClass == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 10) || //status condition jr trainer
                    (trainerClass == "HIKER" && this.mapper.properties.battle.trainer.number == 9) || //Selfdestructing hiker
                    (trainerClass == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 18) || //finisher
                    (trainerClass == "JUGGLER" && this.mapper.properties.battle.trainer.number == 3) || //koga juggler 1
                    (trainerClass == "JUGGLER" && this.mapper.properties.battle.trainer.number == 4) || //koga juggler 1
                    (trainerClass == "ROCKET" && this.mapper.properties.battle.trainer.number == 38) || //hypno rocket
                    (trainerClass == "ROCKET" && this.mapper.properties.battle.trainer.number == 25) || //hypno sandwich
                    (trainerClass == "CHANNELER" && this.mapper.properties.battle.trainer.number == 10) //2 gastly channeler
                    )
                    ) {
                        return 1
                    }
                else if (this.showAllTrainers == true && this.mapper.properties.battle.type.value == "Trainer")
                    return 1
                else
                    return 0
            }
        },
        currentTrainer() {
            const trainer_class = this.mapper.properties.battle.trainer.class
            const trainer_number = this.mapper.properties.battle.trainer.number
            const trainer_identifier = `${trainer_class} ${trainer_number}`
            // console.log(trainer_identifier)
            if (this.mapper.properties.meta.gameName == "Yellow") { 
                return g1YellowTrainers[trainer_identifier] 
            }
            else if (this.mapper.properties.meta.gameName == "Red and Blue") { 
                return g1RedBlueTrainers[trainer_identifier] 
            }
            else { 
                return g1YellowTrainers[trainer_identifier] 
            }
        },
        dropdownDownMenuKeys() {
            return {
                textures: Object.keys(this.textures)
            }
        },
        // dropshadowFix() {
        //     if (imageFlip) {
        //         return ""
        //     }
        //     else {
        //         return "-"
        //     }
        // },
        splitCountdown() {
            if (!this.ready) { return }
            var trainer = this.mapper?.properties?.battle?.trainer?.class?.value + "_" + this.mapper?.properties?.battle?.trainer?.number?.value
            var splitName = this.autosplitter[this.mapper?.properties?.meta?.gameName?.value][trainer]
            if (!splitName) { return }
            // console.log(splitName)
            var personalBestSplitTime = this.convertDurationToSeconds(this.pb_splits.find(subArray => subArray[2] == (splitName))[3] ?? "0")
            var currentTime = this.convertDurationToSeconds(this.timer.formatted_time[0]) + (this.time_ms / 100)
            return personalBestSplitTime - currentTime
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
        gametimeHMS() {
            h = this.mapper.properties.gameTime.hours
            m = this.mapper.properties.gameTime.minutes
            s = this.mapper.properties.gameTime.seconds
            hour = ""
            min = ""
            sec = ""
            //hour
            if (h == 0) hour = ""
            else if (h > 255) hour = 0 + ":"
            else hour = h + ":"
            //min
            if (h > 0 && m < 10) min = "0" + m.toString() + ":"
            else if (h == 0 && m == 0) min = ""
            else min = m + ":"
            //sec
            if ((h > 0 || m > 0) && s < 10) sec = "0" + s.toString()
            else sec = s
            return hour.toString() + min.toString() + sec.toString()
        },
        gametimeSplit() {
            h = this.mapper.properties.gameTime.hours
            m = this.mapper.properties.gameTime.minutes
            timecode = h + ":" + m.toString().padStart(2, "0")
            return timecode
        },
        gametime_frames() {
            f = this.mapper.properties.gameTime.frames
            if (f < 10) f = "0" + f.toString();
            return f
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
        battEn() {
            return this.mapper?.properties?.battle?.enemyPokemon
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

        //CO-PILOT REFACTOR
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
        batp() { //player battle
            return this.mapper?.properties?.battle?.yourPokemon
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
        hp_dv(atk, def, spd, spc) {
            return (((atk % 2) * 8) + ((def % 2) * 4) + ((spd % 2) * 2) + ((spc % 2) * 1))
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
        //enables encounters in viridian forest and resets all the Pokemon you can find to default
        viridianEncounterEnable() {
            const encounterRate = 0x19
            const caterpie = 0x7B
            const metapod = 0x7C
            const pidgey = 0x24
            const pidgeotto = 0x96
            this.mapper.properties.overworld.encounters.common[0].level.setBytes([0x03], false),
            this.mapper.properties.overworld.encounters.common[0].pokemon.setBytes([caterpie], false),
            this.mapper.properties.overworld.encounters.common[1].level.setBytes([0x04], false),
            this.mapper.properties.overworld.encounters.common[1].pokemon.setBytes([metapod], false),
            this.mapper.properties.overworld.encounters.common[2].level.setBytes([0x04], false),
            this.mapper.properties.overworld.encounters.common[2].pokemon.setBytes([caterpie], false),
            this.mapper.properties.overworld.encounters.common[3].level.setBytes([0x05], false),
            this.mapper.properties.overworld.encounters.common[3].pokemon.setBytes([caterpie], false),
            this.mapper.properties.overworld.encounters.uncommon[0].level.setBytes([0x04], false),
            this.mapper.properties.overworld.encounters.uncommon[0].pokemon.setBytes([pidgey], false),
            this.mapper.properties.overworld.encounters.uncommon[1].level.setBytes([0x06], false),
            this.mapper.properties.overworld.encounters.uncommon[1].pokemon.setBytes([pidgey], false),
            this.mapper.properties.overworld.encounters.uncommon[2].level.setBytes([0x06], false),
            this.mapper.properties.overworld.encounters.uncommon[2].pokemon.setBytes([caterpie], false),
            this.mapper.properties.overworld.encounters.uncommon[3].level.setBytes([0x06], false),
            this.mapper.properties.overworld.encounters.uncommon[3].pokemon.setBytes([metapod], false),
            this.mapper.properties.overworld.encounterRate.setBytes([encounterRate], false)
        },
        viridianForestPidgey() {
            const viridianForestPidgey = 0x24
            const viridianForestEncounterRate = 0x19
            const pidgeyLevelFour = 0x04
            const pidgeyLevelSix = 0x06
            const pidgeyLevelEight = 0x08
            this.mapper.properties.overworld.encounters.common[0].level.setBytes([pidgeyLevelFour], false),
            this.mapper.properties.overworld.encounters.common[0].pokemon.setBytes([viridianForestPidgey], false),
            this.mapper.properties.overworld.encounters.common[1].level.setBytes([pidgeyLevelFour], false),
            this.mapper.properties.overworld.encounters.common[1].pokemon.setBytes([viridianForestPidgey], false),
            this.mapper.properties.overworld.encounters.common[2].level.setBytes([pidgeyLevelFour], false),
            this.mapper.properties.overworld.encounters.common[2].pokemon.setBytes([viridianForestPidgey], false),
            this.mapper.properties.overworld.encounters.common[3].level.setBytes([pidgeyLevelSix], false),
            this.mapper.properties.overworld.encounters.common[3].pokemon.setBytes([viridianForestPidgey], false),
            this.mapper.properties.overworld.encounters.uncommon[0].level.setBytes([pidgeyLevelSix], false),
            this.mapper.properties.overworld.encounters.uncommon[0].pokemon.setBytes([viridianForestPidgey], false),
            this.mapper.properties.overworld.encounters.uncommon[1].level.setBytes([pidgeyLevelSix], false),
            this.mapper.properties.overworld.encounters.uncommon[1].pokemon.setBytes([viridianForestPidgey], false),
            this.mapper.properties.overworld.encounters.uncommon[2].level.setBytes([pidgeyLevelEight], false),
            this.mapper.properties.overworld.encounters.uncommon[2].pokemon.setBytes([viridianForestPidgey], false),
            this.mapper.properties.overworld.encounters.uncommon[3].level.setBytes([pidgeyLevelEight], false),
            this.mapper.properties.overworld.encounters.uncommon[3].pokemon.setBytes([viridianForestPidgey], false),
            this.mapper.properties.overworld.encounterRate.setBytes([viridianForestEncounterRate], false)
        },

        //*autosplitter methods
        //format trainer names so they can be written to csv
        format_trainer_name(trainer_class, trainer_number) {
            const game = this.mapper.properties.meta.gameName.value
            if (game == 'Red and Blue') {
                //rivals
                if (trainer_class == "RIVAL1" && trainer_number == 1)  { return "Rival1-Lab" }
                if (trainer_class == "RIVAL1" && trainer_number == 2)  { return "Rival1-Lab" }
                if (trainer_class == "RIVAL1" && trainer_number == 3)  { return "Rival1-Lab" }
                if (trainer_class == "RIVAL1" && trainer_number == 4)  { return "Rival1a-Route 22" }
                if (trainer_class == "RIVAL1" && trainer_number == 5)  { return "Rival1a-Route 22" }
                if (trainer_class == "RIVAL1" && trainer_number == 6)  { return "Rival1a-Route 22" }
                if (trainer_class == "RIVAL1" && trainer_number == 7)  { return "Rival2-Nugget Bridge" }
                if (trainer_class == "RIVAL1" && trainer_number == 8)  { return "Rival2-Nugget Bridge" }
                if (trainer_class == "RIVAL1" && trainer_number == 9)  { return "Rival2-Nugget Bridge" }
                if (trainer_class == "RIVAL2" && trainer_number == 1)  { return "Rival3-SS Anne" }
                if (trainer_class == "RIVAL2" && trainer_number == 2)  { return "Rival3-SS Anne"  }
                if (trainer_class == "RIVAL2" && trainer_number == 3)  { return "Rival3-SS Anne"  }
                if (trainer_class == "RIVAL2" && trainer_number == 4)  { return "Rival4-Pkmn Tower" }
                if (trainer_class == "RIVAL2" && trainer_number == 5)  { return "Rival4-Pkmn Tower" }
                if (trainer_class == "RIVAL2" && trainer_number == 6)  { return "Rival4-Pkmn Tower" }
                if (trainer_class == "RIVAL2" && trainer_number == 7)  { return "Rival5-Silph" }
                if (trainer_class == "RIVAL2" && trainer_number == 8)  { return "Rival5-Silph" }
                if (trainer_class == "RIVAL2" && trainer_number == 9)  { return "Rival5-Silph" }
                if (trainer_class == "RIVAL2" && trainer_number == 10) { return "Rival6-Route 22" }
                if (trainer_class == "RIVAL2" && trainer_number == 11) { return "Rival6-Route 22" }
                if (trainer_class == "RIVAL2" && trainer_number == 12) { return "Rival6-Route 22" }
                if (trainer_class == "RIVAL3" && trainer_number == 1)  { return "Champion" }
                if (trainer_class == "RIVAL3" && trainer_number == 2)  { return "Champion" }
                if (trainer_class == "RIVAL3" && trainer_number == 3)  { return "Champion" }
            }
            if (game == 'Yellow') {
                //rivals
                if (trainer_class == "RIVAL1" && trainer_number == 1)  { return "Rival1-Lab" }
                if (trainer_class == "RIVAL1" && trainer_number == 2)  { return "Rival1a-Route 22" }
                if (trainer_class == "RIVAL1" && trainer_number == 3)  { return "Rival2-Nugget Bridge" }
                if (trainer_class == "RIVAL2" && trainer_number == 1)  { return "Rival3-SS Anne" }
                if (trainer_class == "RIVAL2" && trainer_number == 2)  { return "Rival4-Pkmn Tower" }
                if (trainer_class == "RIVAL2" && trainer_number == 3)  { return "Rival4-Pkmn Tower" }
                if (trainer_class == "RIVAL2" && trainer_number == 4)  { return "Rival4-Pkmn Tower" }
                if (trainer_class == "RIVAL2" && trainer_number == 5)  { return "Rival5-Silph" }
                if (trainer_class == "RIVAL2" && trainer_number == 6)  { return "Rival5-Silph" }
                if (trainer_class == "RIVAL2" && trainer_number == 7)  { return "Rival5-Silph" }
                if (trainer_class == "RIVAL2" && trainer_number == 8)  { return "Rival6-Route 22" }
                if (trainer_class == "RIVAL2" && trainer_number == 9)  { return "Rival6-Route 22" }
                if (trainer_class == "RIVAL2" && trainer_number == 10) { return "Rival6-Route 22" }
                if (trainer_class == "RIVAL3" && trainer_number == 1) { return "Champion" }
                if (trainer_class == "RIVAL3" && trainer_number == 2) { return "Champion" }
                if (trainer_class == "RIVAL3" && trainer_number == 3) { return "Champion" }
            }
            //gym leaders
            if (trainer_class == "BROCK")    { return "Brock" }
            if (trainer_class == "MISTY")    { return "Misty" }
            if (trainer_class == "LT.SURGE") { return "Surge" }
            if (trainer_class == "ERIKA")    { return "Erika" }
            if (trainer_class == "KOGA")     { return "Koga" }
            if (trainer_class == "SARINA")   { return "Sabrina" }
            if (trainer_class == "BLAINE")   { return "Blaine" }
            //giovanni
            if (trainer_class == "GIOVANNI" && trainer_number == 1) { return "Giovanni-Hideout" }
            if (trainer_class == "GIOVANNI" && trainer_number == 2) { return "Giovanni-Silph" }
            if (trainer_class == "GIOVANNI" && trainer_number == 3) { return "Giovanni" }
            //elite4 members
            if (trainer_class == "LORELEI") { return "Lorelei" }
            if (trainer_class == "BRUNO")   { return "Bruno" }
            if (trainer_class == "AGATHA")  { return "Agatha" }
            if (trainer_class == "LANCE")   { return "Lance" }
            //notable npcs
            if (trainer_class == "ROCKET"       && this.mapper.properties.battle.trainer.number == 5)   { return "Cerulean Rocket" }
            if (trainer_class == "YOUNGSTER"    && this.mapper.properties.battle.trainer.number == 1)   { return "Youngster Ben" }
            if (trainer_class == "LASS"         && this.mapper.properties.battle.trainer.number == 10)  { return "Oddish Lass" } 
            if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 1)   { return "Pecking Lass" } 
            if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 3)   { return "Sandy" } 
            if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 5)   { return "Wrapping Lass" } 
            if (trainer_class == "SUPER NERD"   && this.mapper.properties.battle.trainer.number == 2)   { return "Fossil Nerd" }
            if (trainer_class == "POKEMANIAC"   && this.mapper.properties.battle.trainer.number == 7)   { return "Slowbone" }
            if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 10)  { return "Status-Condition-Jr-Trainer" }
            if (trainer_class == "HIKER"        && this.mapper.properties.battle.trainer.number == 9)   { return "Selfdestructing Hiker" }
            if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 18)  { return "Finisher" }
            if (trainer_class == "ROCKET"       && this.mapper.properties.battle.trainer.number == 38)  { return "Hypno Rocket" }
            if (trainer_class == "CHANNELER"    && this.mapper.properties.battle.trainer.number == 10)  { return "Agatha Jr" }
            else return this.capitalization_format(trainer_class)
        },

        // //*timer methods
        // //start the timer
        // startTime() {
        //     if (this.timer_pause == false) {
        //         return
        //     }
        //     const timeRegex = /(\d+):(\d{2}):(\d{2})\.(\d{2})/;
        //     const timeOffsetArray = this.timer_startTimeOffset.match(timeRegex)?.slice(1,5).map(x => parseInt(x)) ?? [0,0,0,0];
        //     const timeOffset = timeOffsetArray[0] * 3600000 + timeOffsetArray[1] * 60000 + timeOffsetArray[2] * 1000 + timeOffsetArray[3] * 10;

        //     this.timer_startTime = Date.now() - timeOffset
        //     this.timer_pause = false
        //     this.updateTime()
        // },
        // //stop the timer
        // stopTime() {
        //     this.timer_pause_time = Date.now()
        //     this.timer_pause = true
        // },
        // set_timer() {
        //     const timeRegex = /(\d+):(\d{2}):(\d{2})\.(\d{2})/;
        //     const timeOffsetArray = this.timer_startTimeOffset.match(timeRegex)?.slice(1,5).map(x => parseInt(x)) ?? [0,0,0,0];
        //     const timeOffset = timeOffsetArray[0] * 3600000 + timeOffsetArray[1] * 60000 + timeOffsetArray[2] * 1000 + timeOffsetArray[3] * 10;

        //     this.timer_pause = true
        //     this.timer_startTime = Date.now() - timeOffset
        //     this.timer_pause_time = Date.now()
        //     this.timer_formatted_time = [ "0", ".00" ]
        //     this.finished_logs = false

        //     this.updateTime()
        // },
        padTime(time) {
            return time.toString().padStart(2, "0")
        },
        // //animate the timer
        // updateTime() {
        //     var time = Date.now() - this.timer_startTime
        //     if (this.timer_pause == true) {
        //         time = this.timer_pause_time - this.timer_startTime
        //     }
        //     var f = (x) => x.toString().padStart(2, "0")
        //     var c = (Math.floor(time / 10) % 100)
        //     var s = (Math.floor(time / 1000) % 60)
        //     var m = (Math.floor(time / 60000) % 60)
        //     var h = (Math.floor(time / 3600000))
        //     this.time_h = h
        //     this.time_m = m
        //     this.time_s = s
        //     this.time_ms = c
        //     if (h != 0) {
        //         this.timer_formatted_time = [ h + ":" + f(m) + ":" + f(s), "." + f(c), h + "h" + m + "m" + s + "s", ]
        //     }
        //     else if (m != 0) {
        //         this.timer_formatted_time = [ m + ":" + f(s), "." + f(c), h + "h" + m + "m" + s + "s", ]
        //     }
        //     else {
        //         this.timer_formatted_time = [ s, "." + f(c), h + "h" + m + "m" + s + "s", ]
        //     }
        //     if (this.timer_pause == false) {
        //         requestAnimationFrame(this.updateTime)
        //     }
        // },
        // //pause the timer
        // pauseUnpauseTime() {
        //     if (this.timer_pause == true) {
        //         this.timer_pause = false
        //         this.timer_startTime += Date.now() - this.timer_pause_time
        //         this.updateTime()
        //         retro.resume()
        //     }
        //     else {
        //         this.timer_pause = true
        //         this.timer_pause_time = Date.now()
        //         retro.pause()
        //     }
        // },
        async newRun() {
            // const timeRegex = /(\d+):(\d{2}):(\d{2})\.(\d{2})/;
            // const timeOffsetArray = this.timer_startTimeOffset.match(timeRegex)?.slice(1,5).map(x => parseInt(x)) ?? [0,0,0,0];
            // const timeOffset = timeOffsetArray[0] * 3600000 + timeOffsetArray[1] * 60000 + timeOffsetArray[2] * 1000 + timeOffsetArray[3] * 10;
            
            // this.current_splits = await this.load_temp_splits()
            this.compared_splits = []
            this.current_splits = []

            this.battle_summary_header = "Battle Summary"
            this.most_recent_move = ""
            // this.timer_pause = true
            // this.timer_startTime = Date.now() - timeOffset
            // this.timer_pause_time = Date.now()
            // this.timer_formatted_time = [ "0", ".00" ]
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
        first_playthrough_settings() {
            this.route1 =         true
            this.viridianForest = true
            this.route3 =         true
            this.mtMoon =         true
            this.route6 =         true
            this.rockTunnel =     true
            this.pokemonTower =   true
            this.safariZone =     true
            this.powerPlant =     true
            this.mansion =        true
            this.route21 =        true
            this.route22 =        true
            this.victoryRoad =    true
            this.route24 =        true
        },
        second_playthrough_settings() {
            this.route1 =         false
            this.viridianForest = true
            this.route3 =         false
            this.mtMoon =         false
            this.route6 =         false
            this.rockTunnel =     true
            this.pokemonTower =   true
            this.safariZone =     true
            this.powerPlant =     true
            this.mansion =        true
            this.route21 =        true
            this.route22 =        true
            this.victoryRoad =    true
            this.route24 =        true
            this.viridian_forest == "Pidgey"
        },
        all_off() {
            this.route1 =         false
            this.viridianForest = false
            this.route3 =         false
            this.mtMoon =         false
            this.route6 =         false
            this.rockTunnel =     false
            this.pokemonTower =   false
            this.safariZone =     false
            this.powerPlant =     false
            this.mansion =        false
            this.route21 =        false
            this.route22 =        false
            this.victoryRoad =    false
            this.route24 =        false
            this.viridian_forest == "No Encounters"
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
        addDurations(duration1, duration2) {
            const totalSeconds = this.convertDurationToSeconds(duration1) + this.convertDurationToSeconds(duration2);
            return this.convertSecondsToDuration(totalSeconds);
        },
        subtractDurations(duration1, duration2) {
            const totalSeconds = this.convertDurationToSeconds(duration1) - this.convertDurationToSeconds(duration2);
            return this.convertSecondsToDuration(totalSeconds);
        },
        convertTimeToSeconds(time) {
            const [minutes, seconds] = time.split(':').map(Number);
            return minutes * 60 + seconds;
        },
        convertSecondsToTime(seconds) {
            const absoluteSeconds = Math.abs(seconds);
            const minutes = Math.floor(absoluteSeconds / 60);
            const remainingSeconds = absoluteSeconds % 60;
            const sign = seconds < 0 ? '-' : '+';
            return `${sign}${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        },
        timeUntilSplit(currentTime, splitTime) {
            const differenceInSeconds = currentTime - splitTime;
            var diff = differenceInSeconds;
            var duration = this.convertSecondsToDuration(differenceInSeconds);
            if (diff > 0) {
                return "+" + duration
            }
            else if (diff < 0) {
                return "" + duration
            }
            else {
                return "" + duration
            }
        },
        splitTextColor(current, pbTime) {
            current = this.convertDurationToSeconds(current);
            pbTime = this.convertDurationToSeconds(pbTime);
        
            if (current < pbTime) {
                return "color: rgb(21, 153, 32);"; // green for worse times
            }
            else if (current > pbTime) {
                return "color: rgb(202, 53, 33);"; // red for better times
            }
            else {
                return "color: rgb(0, 0, 0);"; // black for equal times
            }
        },
        keys_function(object) {
            return Object.keys(object)
        },
        select_starter(pokemon_species) {
            this.starterName = pokemon_species
        },
        move_name(move_string) {
            if (!move_string) { return "" }
            if (move_string.includes("BACKPORT")) { return this.backport_data[this.starterName].move_string }
            move_string = move_string.toLowerCase()
            const moveMappings = {
                "vicegrip":     "ViceGrip",
                "doubleslap":   "DoubleSlap",
                "double-edge":  "Double-Edge",
                "solarbeam":    "SolarBeam",
                "extremespeed": "ExtremeSpeed",
                "dynamicpunch": "DynamicPunch",
                "thunderpunch": "ThunderPunch",
                "bubblebeam":   "BubbleBeam",
                "grasswhistle": "GrassWhistle",
                "softboiled":   "Softboiled",
                "sand-attack":  "Sand-Attack",
                "mud-slap":     "Mud-Slap",
                "featherdance": "FeatherDance",
                "poisonpowder": "PoisonPowder",
                "dragonbreath": "DragonBreath",
                "ancientpower": "AncientPower",
                "smellingsalt": "SmellingSalt",
                "selfdestruct": "Selfdestruct",
                "smokescreen":  "SmokeScreen",
                "sonicboom":    "SonicBoom",
                "trickortreat": "TrickOrTreat"
            };
            const formattedMove = moveMappings[move_string];
            return formattedMove || this.capitalization_format(move_string);
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

        //REMOVES CAPITALIZATION (TACKLE -> Tackle) OR (Tail whip -> Tail Whip)
        capitalization_format(str) {
            if (str == null) { return "" }
            return str.toLowerCase().replace(/(^|\s|\-|\.)(\w)/g, function(match, p1, p2) {
              return p1 + p2.toUpperCase();
            });
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
                    case "LT.SURGE_1":
                        return "images/trainers/ltsurge.png";
                    case "SABRINA_1":
                        return "images/trainers/sabrina.png";
                    case "BLAINE_1":
                        return "images/trainers/blaine.png";
                    case "RIVAL1_1":
                        return "images/trainers/RIVAL1.png";
                    case "RIVAL1_2":
                        return "images/trainers/RIVAL1.png";
                    case "RIVAL1_3":
                        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_4":
                        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_5":
                        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_6":
                        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_7":
                        return "images/trainers/RIVAL2.png";
                    case "RIVAL2_1":
                        return "images/trainers/RIVAL2.png";
                    case "ROCKET_42":
                        return "images/trainers/JESSIE_JAMES_1.png";
                    case "ROCKET_44":
                        return "images/trainers/JESSIE_JAMES_2.png";
                    case "ROCKET_45":
                        return "images/trainers/JESSIE_JAMES_2.png";
                    case "JR TRAINER F_5":
                        return "images/trainers/JR TRAINER F_5.png";
                    case "YOUNGSTER_1":
                        return "images/trainers/BEN.png";
                    case "POKEMANIAC_7":
                        return "images/trainers/POKEMANIAC_7.png";
                    case "SUPER NERD_2":
                        return "images/trainers/FOSSIL_NERD.png";
                    case "LASS_10":
                        return "images/trainers/ODDISH_LASS.png";
                    case "FISHER_7":
                        return "images/trainers/SIKE.png";
                    case "JR TRAINER F_10":
                        return "images/trainers/JR TRAINER F_10.png";
                    case "ROCKET_5":
                        return "images/trainers/dig_rocket.png";
                    case "ROCKET_38":
                        return "images/trainers/ROCKET_38.png";
                    case "HIKER_9":
                        return "images/trainers/HIKER_9.png";
                    case "LASS_3":
                        return "images/trainers/LASS_3.png";
                    case "JR TRAINER F_1":
                        return "images/trainers/GOLDEEN.png";
                    case "ROCKET_25":
                        return "images/trainers/HYPNO_SANDWICH.png";
                    case "JR TRAINER F_3":
                        return "images/trainers/JR TRAINER F_3.png";
                    case "CHANNELER_10":
                        return "images/trainers/AGATHAJR.png";
                    case "BROCK_1":
                        return "images/trainers/brock.png";
                    case "MISTY_1":
                        return "images/trainers/misty.png";
                    case "ERIKA_1":
                        return "images/trainers/erika.png";
                    case "KOGA_1":
                        return "images/trainers/koga.png";
                    case "LORELEI_1":
                        return "images/trainers/lorelei.png";
                    case "BRUNO_1":
                        return "images/trainers/bruno.png";
                    case "AGATHA_1":
                        return "images/trainers/agatha.png";
                    case "LANCE_1":
                        return "images/trainers/lance.png";
                    case "HIKER_2":
                        return "images/trainers/elixir_hiker.png";
                    default:
                        return null;
                }
              }
              if (this.mapper.properties.meta.gameName == "Red and Blue") {
                switch (`${trainerClass}_${trainerNumber}`) {
                    case "LT.SURGE_1":
                        return "images/trainers/Red_and_Blue/ltsurge.png";
                    case "SABRINA_1":
                        return "images/trainers/Red_and_Blue/sabrina.png";
                    case "BLAINE_1":
                        return "images/trainers/Red_and_Blue/blaine.png";
                    case "RIVAL1_1":
                        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_2":
                        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_3":
                        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_4":
                        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_5":
                        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_6":
                        return "images/trainers/Red_and_Blue/RIVAL1.png";
                    case "RIVAL1_7":
                        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL1_8":
                        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL1_9":
                        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL2_1":
                        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL2_2":
                        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "RIVAL2_3":
                        return "images/trainers/Red_and_Blue/RIVAL2.png";
                    case "JR TRAINER F_5":
                        return "images/trainers/Red_and_Blue/JR TRAINER F_5.png";
                    case "YOUNGSTER_1":
                        return "images/trainers/Red_and_Blue/BEN.png";
                    case "POKEMANIAC_7":
                        return "images/trainers/Red_and_Blue/POKEMANIAC_7.png";
                    case "SUPER NERD_2":
                        return "images/trainers/Red_and_Blue/FOSSIL_NERD.png";
                    case "LASS_10":
                        return "images/trainers/Red_and_Blue/ODDISH_LASS.png";
                    case "JR TRAINER F_10":
                        return "images/trainers/Red_and_Blue/JR TRAINER F_10.png";
                    case "ROCKET_5":
                        return "images/trainers/dig_rocket.png";
                    case "ROCKET_38":
                        return "images/trainers/Red_and_Blue/ROCKET_38.png";
                    case "HIKER_9":
                        return "images/trainers/Red_and_Blue/HIKER_9.png";
                    case "LASS_3":
                        return "images/trainers/Red_and_Blue/LASS_3.png";
                    case "JR TRAINER F_1":
                        return "images/trainers/Red_and_Blue/GOLDEEN.png";
                    case "ROCKET_25":
                        return "images/trainers/Red_and_Blue/HYPNO_SANDWICH.png";
                    case "JR TRAINER F_3":
                        return "images/trainers/Red_and_Blue/JR TRAINER F_3.png";
                    case "CHANNELER_10":
                        return "images/trainers/Red_and_Blue/AGATHAJR.png";
                    case "BROCK_1":
                        return "images/trainers/Red_and_Blue/brock.png";
                    case "MISTY_1":
                        return "images/trainers/Red_and_Blue/misty.png";
                    case "ERIKA_1":
                        return "images/trainers/Red_and_Blue/erika.png";
                    case "KOGA_1":
                        return "images/trainers/Red_and_Blue/koga.png";
                    case "LORELEI_1":
                        return "images/trainers/lorelei.png";
                    case "BRUNO_1":
                        return "images/trainers/bruno.png";
                    case "AGATHA_1":
                        return "images/trainers/agatha.png";
                    case "LANCE_1":
                        return "images/trainers/lance.png";
                    case "ROCKET_1":
                        return "images/trainers/Red_and_Blue/mtmoon_rocket_boss.png";
                    case "HIKER_2":
                        return "images/trainers/Red_and_Blue/elixir_hiker.png";
                    default:
                        return null;
                }
              }
            }
        },

        //determine if the player is in a `Mart` or `Department` store.
        //this is currently used to display the number of remaining vitamins that can be used on each stat
        //in the future it can be used to display the player's inventory (a feature that is not yet implemented)
        g1martSelector(map) {
            if (!this.inventory) {
              return "Overworld";
            }
          
            switch (map) {
              case "Viridian City - Mart":
              case "Pewter City - Mart":
              case "Cerulean City - Mart":
              case "Vermilion City - Mart":
              case "Lavender Town - Mart":
              case "Fuchsia City - Mart":
              case "Cinnabar Island - Mart":
              case "CINNABAR_MART_COPY":
              case "Saffron City - Mart":
              case "Indigo Plateau - Lobby":
              case "Celadon City - Pokecenter":
              case "Saffron City - Pokecenter":
                return "Mart"; // currently unused
              case "Celadon City - Department Store - 1F":
              case "Celadon City - Department Store - 2F":
              case "Celadon City - Department Store - 3F":
              case "Celadon City - Department Store - 4F":
              case "Celadon City - Department Store - 5F":
              case "Celadon City - Department Store - Roof":
              case "Celadon City - Department Store - Elevator":
              case "Cinnabar Mansion":
              case "Safari Zone (Center)":
              case "Safari Zone (East)":
              case "Safari Zone (North)":
              case "Safari Zone (West)":
              case "Safari Zone - Secret House":
                return "Department"; // shows vitamins
              default:
                return "Overworld"; // shows regular stat labels
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
        
        //GAMETIME FUNCTIONS
        //formats the gametime so that it is displayed correctly
        //0:00 is the minimum values
        gameTimeHM(h, m) {
            if (h <= 0) return m;
            if (m < 10) m = "0" + m.toString();
            return `${h}:${m}`;
        },
        gameTimeHMS(h, m, s) {
            if (h <= 0) {
                if (m <= 0) return `${s}`;
                if (s < 10) s = "0" + s.toString();
                return `${m}:${s}`;
            }
            if (s < 10) s = "0" + s.toString();
            if (m < 10) m = "0" + m.toString();
            return `${h}:${m}:${s}`;
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


        badgeBoost(badge, stat) {
            return badge ? Math.floor(stat * 1.125) : stat;
        },
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

        if (this.playerResets.toString().length == 1 && document.getElementById("reset_counter")) {
            document.getElementById("reset_counter").style.fontSize = "75px"
        }
        if (this.playerResets.toString().length == 3 && document.getElementById("reset_counter")) {
            document.getElementById("reset_counter").style.fontSize = "54px"
        }
        if (this.playerResets.toString().length == 4 && document.getElementById("reset_counter")) {
            document.getElementById("reset_counter").style.fontSize = "40px"
        }

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

        //this function can be reused to log data to the console
        const log_split = (x) => {
            const time = this.timer.formatted_time;
            const opponent = this.mapper.properties.battle.trainer.class.value;
            console.log(`Autosplitter - Battle Ended: Split: ${opponent} at ${time[0]}${time[1]} (Gametime: ${this.gametimeSplit})`)
        }
        
        // this function assigns split data to arrays so that it can be written to CSV on disc
        const autosplitter_process = () => {
            if (this.autosplitter_toggle == true && this.no_attempt == false) {
                d = new Date()
                battle_end = Date.now()
                //values
                let gameTimeH = this.mapper.properties.gameTime?.hours?.value
                let gameTimeM = this.mapper.properties.gameTime?.minutes?.value
                let gameTimeS = this.mapper.properties.gameTime?.seconds?.value
                let gameTimeF = this.mapper.properties.gameTime?.frames?.value

                //data to be collected with the autosplitter
                let date_string = (d.getMonth() + 1) + "-" + d.getDate().toString().padStart(2, "0")
                let time_string = d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0")
                let player_name = this.playerNameChoice
                let pokemon = this.starterName
                let trainer_name = this.format_trainer_name(this.mapper.properties.battle.trainer.class.value, this.mapper.properties.battle.trainer.number.value)
                let trainer_id = this.mapper.properties.battle.trainer.number.value
                let location = this.mapper.properties.overworld.map.value
                let total_pokemon = this.mapper.properties.battle.trainer.totalPokemon
                const formattedTime = this.timer.formatted_time;
                let real_time_total = formattedTime[0] + formattedTime[1]
                let real_time_hmmss = formattedTime[0]
                let real_time_file_label = formattedTime[2]
                let resets = this.playerResets.toString()
                let blackouts = this.blackout_counter.toString()
                let failures = this.playerResets + this.blackout_counter
                let level = this.mapper.properties.player.team[0].level.value.toString()
                let game_time = this.gametimeSplit.toString()
                let battle_duration = (battle_end - this.battle_start)/1000 
                let move1 = this.mapper.properties.player.team[0].move1.value
                let move2 = this.mapper.properties.player.team[0].move2.value
                let move3 = this.mapper.properties.player.team[0].move3.value
                let move4 = this.mapper.properties.player.team[0].move4.value
                let move1pp = this.mapper.properties.player.team[0].move1pp.value
                let move2pp = this.mapper.properties.player.team[0].move2pp.value
                let move3pp = this.mapper.properties.player.team[0].move3pp.value
                let move4pp = this.mapper.properties.player.team[0].move4pp.value
                let move1ppUp = this.mapper.properties.player.team[0].move1ppUp.value
                let move2ppUp = this.mapper.properties.player.team[0].move2ppUp.value
                let move3ppUp = this.mapper.properties.player.team[0].move3ppUp.value
                let move4ppUp = this.mapper.properties.player.team[0].move4ppUp.value
                let saves = this.mapper.properties.patch.saves.saveCount.value
                let steps = this.mapper.properties.patch.steps.stepsCount.value
                let bonks = this.mapper.properties.patch.steps.bonks.value
                let trainerBattles = this.mapper.properties.patch.battles.trainerBattles.value
                let wildBattles = this.mapper.properties.patch.battles.wildBattles.value
                let battleTurns = this.mapper.properties.patch.battle_info.turns.battleTurns.value
                let playerTurns = this.mapper.properties.patch.battle_info.turns.playerTurns.value
                let enemyTurns = this.mapper.properties.patch.battle_info.turns.enemyTurns.value
                let itemsInBag = this.mapper.properties.player.itemCount.value
                let money = this.mapper.properties.player.money.value
                let rivalTeam = this.mapper.properties.rival.finalTeam.value
                let statusCondition = this.mapper.properties.player.team[0].statusCondition.value
                let type1 = this.mapper.properties.player.team[0].type1.value
                let type2 = this.mapper.properties.player.team[0].type2.value
                let experience = this.mapper.properties.player.team[0].expPoints.value
                //deprecated properties (these are used by all of my legacy software)

                let incremented_finished_run_count = this.finished_run_count + 1
                let runIdentifier = this.starterName.toString() + " " + incremented_finished_run_count.toString()
                let trainerName = this.deprecated_autosplitter[this.mapper.properties.meta.gameName.value][`${this.mapper.properties.battle.trainer.class}_${this.mapper.properties.battle.trainer.number}`]
                const time = this.timer.getTime();
                let RTHours = time.hours;
                let RTMinutes = time.minutes;
                let RTSeconds = time.seconds;
                let RTMilliseconds = time.ms;
                let startTime = this.time_split_start
                let realTime = this.padTime(time.hours) + ":" + this.padTime(time.minutes) + ":" + this.padTime(time.seconds) + "." + this.padTime(time.ms)
                let gameTime = this.padTime(gameTimeH) + ":" + this.padTime(gameTimeM) + ":" + this.padTime(gameTimeS) + "." + this.padTime(gameTimeF)
                let hp = this.mapper.properties.player.team[0].hp.value
                let maxHp = this.mapper.properties.player.team[0].maxHp.value
                let atk = this.mapper.properties.player.team[0].attack.value
                let def = this.mapper.properties.player.team[0].defense.value
                let spA = this.mapper.properties.player.team[0].special.value
                let spD = this.mapper.properties.player.team[0].special.value
                let spe = this.mapper.properties.player.team[0].speed.value
                let statExp_hp = this.mapper.properties.player.team[0].statExpHp.value
                let statExp_atk = this.mapper.properties.player.team[0].statExpAttack.value
                let statExp_def = this.mapper.properties.player.team[0].statExpDefense.value
                let statExp_spA = this.mapper.properties.player.team[0].statExpSpecial.value
                let statExp_spD = this.mapper.properties.player.team[0].statExpSpecial.value
                let statExp_spe = this.mapper.properties.player.team[0].statExpSpeed.value
                let dvAttack = this.mapper.properties.player.team[0].dvAttack.value
                let dvDefense = this.mapper.properties.player.team[0].dvDefense.value
                let dvSpeed = this.mapper.properties.player.team[0].dvSpeed.value
                let dvSpecial = this.mapper.properties.player.team[0].dvSpecial.value
                let mod_atk = this.mapper.properties.battle.yourPokemon.modStageAttack.value
                let mod_def = this.mapper.properties.battle.yourPokemon.modStageDefense.value
                let mod_spA = this.mapper.properties.battle.yourPokemon.modStageSpecial.value
                let mod_spD = this.mapper.properties.battle.yourPokemon.modStageSpecial.value
                let mod_spe = this.mapper.properties.battle.yourPokemon.modStageSpeed.value
                let mod_acc = this.mapper.properties.battle.yourPokemon.modStageAccuracy.value
                let mod_eva = this.mapper.properties.battle.yourPokemon.modStageEvasion.value
                let battle_atk = this.mapper.properties.battle.yourPokemon.attack.value
                let battle_def = this.mapper.properties.battle.yourPokemon.defense.value
                let battle_spA = this.mapper.properties.battle.yourPokemon.special.value
                let battle_spD = this.mapper.properties.battle.yourPokemon.special.value
                let battle_spe = this.mapper.properties.battle.yourPokemon.speed.value
                //patch properties (these are going to be used by new software in the future; ROM patch required)
                let patch_frameCount = this.mapper.properties.patch.time?.frameCount?.value ?? 0
                let patch_oWFrameCount = this.mapper.properties.patch.time?.oWFrameCount?.value ?? 0
                let patch_battleFrameCount = this.mapper.properties.patch.time?.battleFrameCount?.value ?? 0
                let patch_menuFrameCount = this.mapper.properties.patch.time?.menuFrameCount?.value ?? 0
                let patch_introsFrameCount = this.mapper.properties.patch.time?.introsFrameCount?.value ?? 0
                let patch_saveCount = this.mapper.properties.patch.saves?.saveCount?.value ?? 0
                let patch_reloadCount = this.mapper.properties.patch.saves?.reloadCount?.value ?? 0
                let patch_clockResetCount = this.mapper.properties.patch.saves?.clockResetCount?.value ?? 0
                let patch_stepsCount = this.mapper.properties.patch.steps?.stepsCount.value ?? 0
                let patch_stepsCountWalk = this.mapper.properties.patch.steps?.stepsCountWalk.value ?? 0
                let patch_stepsCountBike = this.mapper.properties.patch.steps?.stepsCountBike.value ?? 0
                let patch_stepsCountSurf = this.mapper.properties.patch.steps?.stepsCountSurf.value ?? 0
                let patch_bonks = this.mapper.properties.patch.steps?.bonks.value ?? 0
                let patch_battles = this.mapper.properties.patch.battles?.trainerBattles.value + this.mapper.properties.patch.battles?.wildBattles.value ?? 0
                let patch_trainerBattles = this.mapper.properties.patch.battles?.trainerBattles.value ?? 0
                let patch_wildBattles = this.mapper.properties.patch.battles?.wildBattles.value ?? 0
                let patch_battlesFled = this.mapper.properties.patch.battles?.battlesFled.value ?? 0
                let patch_failedRuns = this.mapper.properties.patch.battles?.failedRuns.value ?? 0
                let patch_totalDamageDealt = this.mapper.properties.patch.battle_info.damage?.totalDamageDealt?.value ?? 0
                let patch_actualDamageDealt = this.mapper.properties.patch.battle_info.damage?.actualDamageDealt?.value ?? 0
                let patch_totalDamageTaken = this.mapper.properties.patch.battle_info.damage?.totalDamageTaken?.value ?? 0
                let patch_actualDamageTaken = this.mapper.properties.patch.battle_info.damage?.actualDamageTaken?.value ?? 0
                let patch_ownMovesHit = this.mapper.properties.patch.battle_info.hits?.ownMovesHit?.value ?? 0
                let patch_ownMovesMissed = this.mapper.properties.patch.battle_info.hits?.ownMovesMissed?.value ?? 0
                let patch_enemyMovesHit = this.mapper.properties.patch.battle_info.hits?.enemyMovesHit?.value ?? 0
                let patch_enemyMovesMissed = this.mapper.properties.patch.battle_info.hits?.enemyMovesMissed?.value ?? 0
                let patch_ownMovesSE = this.mapper.properties.patch.battle_info.hits?.ownMovesSE?.value ?? 0
                let patch_ownMovesNVE = this.mapper.properties.patch.battle_info.hits?.ownMovesNVE?.value ?? 0
                let patch_enemyMovesSE = this.mapper.properties.patch.battle_info.hits?.enemyMovesSE?.value ?? 0
                let patch_enemyMovesNVE = this.mapper.properties.patch.battle_info.hits?.enemyMovesNVE?.value ?? 0
                let patch_criticalsDealt = this.mapper.properties.patch.battle_info.hits?.criticalsDealt?.value ?? 0
                let patch_oHKOsDealt = this.mapper.properties.patch.battle_info.hits?.oHKOsDealt?.value ?? 0
                let patch_criticalsTaken = this.mapper.properties.patch.battle_info.hits?.criticalsTaken?.value ?? 0
                let patch_oHKOsTaken = this.mapper.properties.patch.battle_info.hits?.oHKOsTaken?.value ?? 0
                let patch_wasConfused = this.mapper.properties.patch.battle_info.status?.wasConfused?.value ?? 0
                let patch_enemyBecameConfused = this.mapper.properties.patch.battle_info.status?.enemyBecameConfused?.value ?? 0
                let patch_wasParalyzed = this.mapper.properties.patch.battle_info.status?.wasParalyzed?.value ?? 0
                let patch_enemyWasParalyzed = this.mapper.properties.patch.battle_info.status?.enemyWasParalyzed?.value ?? 0
                let patch_wasBurned = this.mapper.properties.patch.battle_info.status?.wasBurned?.value ?? 0
                let patch_enemyWasBurned = this.mapper.properties.patch.battle_info.status?.enemyWasBurned?.value ?? 0
                let patch_wasFrozen = this.mapper.properties.patch.battle_info.status?.wasFrozen?.value ?? 0
                let patch_enemyWasFrozen = this.mapper.properties.patch.battle_info.status?.enemyWasFrozen?.value ?? 0
                let patch_wasPoisoned = this.mapper.properties.patch.battle_info.status?.wasPoisoned?.value ?? 0
                let patch_enemyWasPoisoned = this.mapper.properties.patch.battle_info.status?.enemyWasPoisoned?.value ?? 0
                let patch_wasPoisonedBadly = this.mapper.properties.patch.battle_info.status?.wasPoisonedBadly?.value ?? 0
                let patch_enemyWasPoisonedBadly = this.mapper.properties.patch.battle_info.status?.enemyWasPoisonedBadly?.value ?? 0
                let patch_fellAsleep = this.mapper.properties.patch.battle_info.status?.fellAsleep?.value ?? 0
                let patch_enemyFellAsleep = this.mapper.properties.patch.battle_info.status?.enemyFellAsleep?.value ?? 0
                let patch_playerTurnsConfused = this.mapper.properties.patch.battle_info.status?.playerTurnsConfused?.value ?? 0
                let patch_enemyTurnsConfused = this.mapper.properties.patch.battle_info.status?.enemyTurnsConfused?.value ?? 0
                let patch_playerTurnsConfusedHitSelf = this.mapper.properties.patch.battle_info.status?.playerTurnsConfusedHitSelf?.value ?? 0
                let patch_enemyTurnsConfusedHitSelf = this.mapper.properties.patch.battle_info.status?.enemyTurnsConfusedHitSelf?.value ?? 0
                let patch_playerTurnsParalyzed = this.mapper.properties.patch.battle_info.status?.playerTurnsParalyzed?.value ?? 0
                let patch_enemyTurnsParalyzed = this.mapper.properties.patch.battle_info.status?.enemyTurnsParalyzed?.value ?? 0
                let patch_playerTurnsParalyzedFully = this.mapper.properties.patch.battle_info.status?.playerTurnsParalyzedFully?.value ?? 0
                let patch_enemyTurnsParalyzedFully = this.mapper.properties.patch.battle_info.status?.enemyTurnsParalyzedFully?.value ?? 0
                let patch_PlayerTurnsAsleep = this.mapper.properties.patch.battle_info.status.PlayerTurnsAsleep.value ?? 0
                let patch_EnemyTurnsAsleep = this.mapper.properties.patch.battle_info.status.EnemyTurnsAsleep.value ?? 0
                let patch_playerHpHealed = 0 //not working in yellow; there is no ROM implementation of this
                let patch_enemyHpHealed = 0 //not working in yellow; there is no ROM implementation of this
                let patch_playerPokemonFainted = this.mapper.properties.patch.battle_info?.playerPokemonFainted?.value ?? 0
                let patch_enemyPokemonFainted = this.mapper.properties.patch.battle_info?.enemyPokemonFainted?.value ?? 0
                let patch_experienceGained = this.mapper.properties.patch.battle_info?.experienceGained?.value ?? 0
                let patch_switchout = this.mapper.properties.patch.battle_info?.switchout?.value ?? 0
                let patch_moneyMade = this.mapper.properties.patch.money?.moneyMade?.value ?? 0
                let patch_moneySpent = this.mapper.properties.patch.money?.moneySpent?.value ?? 0
                let patch_moneyLost = this.mapper.properties.patch.money?.moneyLost?.value ?? 0
                let patch_itemsPickedUp = this.mapper.properties.patch.items?.itemsPickedUp?.value ?? 0
                let patch_itemsBought = this.mapper.properties.patch.items?.itemsBought?.value ?? 0
                let patch_itemsSold = this.mapper.properties.patch.items?.itemsSold?.value ?? 0
                let patch_ballsThrown = this.mapper.properties.patch.catching?.ballsThrown?.value ?? 0
                let patch_pokemonCaughtInBalls = this.mapper.properties.patch.catching?.pokemonCaughtInBalls ?? 0
                let patch_movesLearnt = this.mapper.properties.patch.movesLearnt ?? 0

                //definitions for what split data is logged to file
                let simple_data = [
                    player_name, pokemon, trainer_name, real_time_hmmss, 
                    resets, blackouts, level, game_time, battle_duration, 
                    move1, move2, move3, move4
                ]
                let full_data = [
                    date_string, time_string, player_name, pokemon, trainer_name, 
                    trainer_id, location, total_pokemon, real_time_total, 
                    real_time_hmmss, real_time_file_label, resets, blackouts, failures, 
                    level, game_time, battle_duration, move1, move2, move3, move4, 
                    saves, steps, bonks, trainerBattles, wildBattles, battleTurns, 
                    playerTurns, enemyTurns, itemsInBag, money, rivalTeam,
                    statusCondition, type1, type2, experience,
                    runIdentifier, this.starterName, trainerName,
                    startTime, realTime, gameTime, level, this.playerResets,
                    RTHours, RTMinutes, RTSeconds, RTMilliseconds,
                    move1, move2, move3, move4, move1pp, move2pp, move3pp, move4pp, move1ppUp, move2ppUp, move3ppUp, move4ppUp,
                    hp, maxHp, atk, def, spA, spD, spe,
                    statExp_hp, statExp_atk, statExp_def, statExp_spA, statExp_spD, statExp_spe,
                    dvAttack, dvDefense, dvSpeed, dvSpecial,
                    mod_atk, mod_def, mod_spA, mod_spD, mod_spe, mod_acc, mod_eva,
                    battle_atk, battle_def, battle_spA, battle_spD, battle_spe,
                    patch_frameCount, patch_oWFrameCount, patch_battleFrameCount, patch_menuFrameCount, patch_introsFrameCount,
                    patch_saveCount, patch_reloadCount, patch_clockResetCount,
                    patch_stepsCount, patch_stepsCountWalk, patch_stepsCountBike, patch_stepsCountSurf, patch_bonks,
                    patch_battles, patch_trainerBattles, patch_wildBattles, patch_battlesFled, patch_failedRuns,
                    patch_totalDamageDealt, patch_actualDamageDealt, patch_totalDamageTaken, patch_actualDamageTaken,
                    patch_ownMovesHit, patch_ownMovesMissed, patch_enemyMovesHit, patch_enemyMovesMissed, 
                    patch_ownMovesSE, patch_ownMovesNVE, patch_enemyMovesSE, patch_enemyMovesNVE, 
                    patch_criticalsDealt, patch_oHKOsDealt, patch_criticalsTaken, patch_oHKOsTaken,
                    patch_wasConfused, patch_enemyBecameConfused, patch_wasParalyzed, patch_enemyWasParalyzed, 
                    patch_wasBurned, patch_enemyWasBurned, patch_wasFrozen, patch_enemyWasFrozen,
                    patch_wasPoisoned, patch_enemyWasPoisoned, patch_wasPoisonedBadly, patch_enemyWasPoisonedBadly,
                    patch_fellAsleep, patch_enemyFellAsleep, patch_playerTurnsConfused, patch_playerTurnsConfusedHitSelf, 
                    patch_playerTurnsParalyzed, patch_playerTurnsParalyzedFully, patch_enemyTurnsConfused, patch_enemyTurnsConfusedHitSelf, 
                    patch_enemyTurnsParalyzed, patch_enemyTurnsParalyzedFully, patch_PlayerTurnsAsleep, patch_EnemyTurnsAsleep,
                    patch_playerHpHealed, patch_enemyHpHealed, 
                    patch_playerPokemonFainted, patch_enemyPokemonFainted, patch_experienceGained, patch_switchout,
                    patch_moneyMade, patch_moneySpent, patch_moneyLost,
                    patch_itemsPickedUp, patch_itemsBought, patch_itemsSold,
                    patch_ballsThrown, patch_pokemonCaughtInBalls,
                    patch_movesLearnt,
                    //new properties
                    blackouts, this.attempt_number, failures, rivalTeam
                ]
                let deprecated_data = [
                    runIdentifier, this.starterName, trainerName,
                    startTime, realTime, gameTime, level, this.playerResets,
                    RTHours, RTMinutes, RTSeconds, RTMilliseconds,
                    move1, move2, move3, move4,
                    atk, def, spA, spD, spe,
                    mod_atk, mod_def, mod_spA, mod_spD, mod_spe, mod_acc, mod_eva,
                    battle_atk, battle_def, battle_spA, battle_spD, battle_spe,
                    patch_frameCount, patch_oWFrameCount, patch_battleFrameCount, patch_menuFrameCount, patch_introsFrameCount,
                    patch_saveCount, patch_reloadCount, patch_clockResetCount,
                    patch_stepsCount, patch_stepsCountWalk, patch_stepsCountBike, patch_stepsCountSurf, patch_bonks,
                    patch_battles, patch_trainerBattles, patch_wildBattles, patch_battlesFled, patch_failedRuns,
                    patch_totalDamageDealt, patch_actualDamageDealt, patch_totalDamageTaken, patch_actualDamageTaken,
                    patch_ownMovesHit, patch_ownMovesMissed, patch_enemyMovesHit, patch_enemyMovesMissed, 
                    patch_ownMovesSE, patch_ownMovesNVE, patch_enemyMovesSE, patch_enemyMovesNVE, 
                    patch_criticalsDealt, patch_oHKOsDealt, patch_criticalsTaken, patch_oHKOsTaken,
                    patch_wasConfused, patch_enemyBecameConfused, patch_wasParalyzed, patch_enemyWasParalyzed, 
                    patch_wasBurned, patch_enemyWasBurned, patch_wasFrozen, patch_enemyWasFrozen,
                    patch_wasPoisoned, patch_enemyWasPoisoned, patch_wasPoisonedBadly, patch_enemyWasPoisonedBadly,
                    patch_fellAsleep, patch_enemyFellAsleep, patch_playerTurnsConfused, patch_playerTurnsConfusedHitSelf, 
                    patch_playerTurnsParalyzed, patch_playerTurnsParalyzedFully, patch_enemyTurnsConfused, patch_enemyTurnsConfusedHitSelf, 
                    patch_enemyTurnsParalyzed, patch_enemyTurnsParalyzedFully,
                    patch_playerHpHealed, patch_enemyHpHealed, 
                    patch_playerPokemonFainted, patch_enemyPokemonFainted, patch_experienceGained, patch_switchout,
                    patch_moneyMade, patch_moneySpent, patch_moneyLost,
                    patch_itemsPickedUp, patch_itemsBought, patch_itemsSold,
                    patch_ballsThrown, patch_pokemonCaughtInBalls,
                    patch_movesLearnt,
                    //new properties
                    blackouts, this.attempt_number, failures, rivalTeam
                ]
                
                let simple_data_str = simple_data.join(",") + "\n";
                let full_data_str = full_data.join(",") + "\n";
                let deprecated_data_str = deprecated_data.join(",") + "\n";
                this.simple_data_str = simple_data_str // assign within Data so it can be recalled on future loops
                this.full_data_str = full_data_str // assign within Data so it can be recalled on future loops
                this.deprecated_data_str = deprecated_data_str // assign within Data so it can be recalled on future loops
                this.simple_data = simple_data // assign within Data so it can be recalled on future loops
                if (this.collect_split_data == true && (this.mapper.properties.meta.state.value == "Battle" || this.mapper.properties.meta.state.value == "From Battle")) {
                    this.current_splits.push({
                        trainer: trainer_name, 
                        time:    real_time_hmmss,
                    })
                }
            }
        }

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
                let gameName_Path = gameName == 'Yellow' ? 'Yellow' : 'Red and Blue' // Used for split data   

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
                logData(gameName, gameName_Path, this.full_data_str, this.attempt_number, this.starterName, "Full", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                
                //write deprecated split data (this is written for only pre-defined trainers)
                //a list of these trainers can be found within `autosplitter.js` and inside the parent `Yellow` or `Red and Blue`
                if (this.autosplitter[this.mapper.properties.meta.gameName.value][unique]) {
                    logData(gameName, gameName_Path, this.deprecated_data_str, this.attempt_number, this.starterName, "Deprecated", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                }
                
                //write simple split data
                //a list of these can be found within `autosplitter.js` and inside the parent `Simple`
                const simpleSplit = () => {
                    log_split()
                    logData(gameName, gameName_Path, this.simple_data_str, this.attempt_number, this.starterName, "Simple", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
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
                    log_split() //log the final split
                    if (this.automatic_post_battle_splits == true) {
                        this.right_panel = "Splits"
                        this.automatic_splits = true
                    }
                    if (this.test_run == false && this.refilming_mode == false && this.no_attempt == false) {
                        this.finished_run_count++ //increment finished count if this is not a test run
                    };
                    // this.stopTime() //stop the timer
                    this.timer.stopTime();
                    logData(gameName, gameName_Path, this.simple_data_str, this.attempt_number, this.starterName, "Simple", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish) //log a simple split
                    this.split_data.push(this.simple_data) //push the split data into the data variable
                }
            }   
        });
        
        //log the final times with the final gametime
        //I am watching tile1 for a specifc tile that appears when the gametime displays on screen
        this.mapper.properties.screen.tiles.column1.tile1.change((newProp) => {
            let gameName = this.game_name == 'Yellow' ? "Y" : this.game_name == 'Red' ? "R" : "B"
            let gameName_Path = gameName == 'Yellow' ? 'Yellow' : 'Red and Blue' // Used for split data     
            if (newProp.value == 122) {
                if (this.mapper.properties.events.beatChampion.value == true && this.mapper.properties.overworld.map.value == "Hall of Fame") {
                    autosplitter_process()
                    console.log("Run Ended - Backing up split data now...")
                    let gameName = this.mapper.properties.meta.gameName.value
                    logData(gameName, gameName_Path, this.simple_data_str, this.finished_run_count, this.starterName, "Simple", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    logData(gameName, gameName_Path, this.deprecated_data_str, this.finished_run_count, this.starterName, "Deprecated", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
                    logData(gameName, gameName_Path, this.full_data_str, this.finished_run_count, this.starterName, "Full", this.test_run, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish)
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
                logCopy(gameName, gameName_Path, this.attempt_number, this.starterName, this.finished_run_count, this.refilming_mode, this.refilmed_attempt, this.refilmed_finish) //copy the current `attempt_number` split data to the finished folder
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

        //keybinds
        keyhook.registerShortCut('F13', async () => { // Show IVs
            console.log("Key: F13 pressed: EVs displayed.")
            this.stats_display = "DVs";
        });
        keyhook.registerShortCut('F14', async () => { // Show EVs
            console.log("Key: F14 pressed: IVs displayed.")
            if (this.stats_display == "EVs") {
                this.stats_display = "Detailed EVs";
                return
            }
            this.stats_display = "EVs";
        });
        keyhook.registerShortCut('F15', async () => { // Show Base Stats
            console.log("Key: F15 pressed. Base Stats displayed.")
            this.stats_display = "Base Stats";
        });
        keyhook.registerShortCut('F16', async () => { // Automatic
            console.log("Key: F16 pressed. Stats are displaying automatically now.")
            if (this.stats_display == "Automatic") {
                this.stats_display = "Badge Boosts";
                return
            }
            this.stats_display = "Automatic";
        });

        keyhook.registerShortCut('F17', async () => { // Inventory
            console.log("Key: F17 pressed. Automatic battle graphics will be displayed.")
            if (this.disallow_right_panel_switching == true) { 
                this.right_panel = "Automatic"
                return 
            }
            this.right_panel = "Automatic";
        });
        keyhook.registerShortCut('F18', async () => { // Trainer Graphic during Battle
            console.log("Key: F18 pressed. Splits displayed.")
            if (this.disallow_right_panel_switching == true) { 
                this.right_panel = "Automatic"
                return 
            }
            this.right_panel = "Movepool";
        });
        keyhook.registerShortCut('F19', async () => { // Trainer Graphic during Battle
            console.log("Key: F19 pressed. Movepool displayed.")
            if (this.disallow_right_panel_switching == true) { 
                this.right_panel = "Automatic"
                return 
            }
            this.right_panel = "Splits";
        });
        //F20 used 
        //F21 used
        //F22 unused

        keyhook.registerShortCut('F23', async () => {
            this.newRun()
        });
        keyhook.registerShortCut('F24', async () => {
            // this.pauseUnpauseTime()
            this.timer.pauseUnpauseTime();
        });
    },
}).mount('#app')