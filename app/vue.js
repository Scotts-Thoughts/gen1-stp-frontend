const MyStorage = new Proxy({}, {
    set: (_, prop, value) => {
        if (value === undefined || value === null)
            localStorage.removeItem(prop);
        else
            localStorage.setItem(prop, JSON.stringify(value));
    },
    get: (_, prop) => {
        if (prop === "clear")
            return () => localStorage.clear();
        if (prop === "entries")
            return () => Object.entries(localStorage);
        if (prop === "keys")
            return () => Object.keys(localStorage);
        if (prop === "has")
            return (key) => localStorage.getItem(key) == null;
        return JSON.parse(localStorage.getItem(prop));
    }
});

// Open the folder ./splits/ in the file explorer with node.js
function openFolder() {
    require('child_process').exec('start .\\splits\\');
}

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
            console.log(err)
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
        this.process.on("spawn", () => console.log("Keyboard hook started!"));
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
function logToFile_BattleSummary(str, file_name, starterName, time, trainer, id) {
    return new Promise((resolve, reject) => {
        const dirPath = "./battle_summaries/";
        const filePath = path.join(dirPath, `/${starterName}-${file_name}/${time}-${trainer}-${id}.csv`);

        fs.mkdir(dirPath, { recursive: true }, (err) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }

            if (!fs.existsSync(filePath)) {
                fs.writeFile(filePath, header, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        fs.appendFile(filePath, str, (err) => {
                            err ? reject(err) : resolve();
                        });
                    }
                });
            } else {
                fs.appendFile(filePath, str, (err) => err ? reject(err) : resolve());
            }
        });
    });
}
function logToFileSimpleSplits(str, file_name, starterName) {
    return new Promise((resolve, reject) => {
        const dirPath = "./splits/";
        const filePath = path.join(dirPath, `${starterName}-${file_name}-simple.csv`);
        const header = "player_name,pokemon,trainer_name,real_time_hmmss,resets,blackouts,level,game_time,battle_duration,move1,move2,move3,move4\n"; // Replace with your actual header

        fs.mkdir(dirPath, { recursive: true }, (err) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }

            if (!fs.existsSync(filePath)) {
                fs.writeFile(filePath, header, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        fs.appendFile(filePath, str, (err) => {
                            err ? reject(err) : resolve();
                        });
                    }
                });
            } else {
                fs.appendFile(filePath, str, (err) => err ? reject(err) : resolve());
            }
        });
    });
}
function logToFileFullSplits(str, file_name, starterName) {
    return new Promise((resolve, reject) => {
        const dirPath = "./splits/";
        const filePath = path.join(dirPath, `${starterName}-${file_name}-full.csv`);
        const header = "date_string,time_string,player_name,pokemon,trainer_name, trainer_id,location,total_pokemon,real_time_total,real_time_hmmss,real_time_file_label,resets,blackouts,level,game_time,battle_duration,move1,move2,move3,move4,saves,steps,bonks,trainerBattles,wildBattles,battleTurns,playerTurns,enemyTurns,itemsInBag,money,rivalTeam\n"; // Replace with your actual header

        fs.mkdir(dirPath, { recursive: true }, (err) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }

            if (!fs.existsSync(filePath)) {
                fs.writeFile(filePath, header, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        fs.appendFile(filePath, str, (err) => {
                            err ? reject(err) : resolve();
                        });
                    }
                });
            } else {
                fs.appendFile(filePath, str, (err) => err ? reject(err) : resolve());
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
    //DATA & DEFINITIONS
    data() {
        return {
            ready: false,
            mapper: null,

            // USER CONFIG --------------------------------------------------------------------------------------//
            starterName: "Venomoth", //Enter starter name, Special cases: Mr. Mime, Farfetchd
            overlayName: "", // add "-yellow" or "-red" here based on the game being played (or "-type" for Venomoth's type randomizer)
            
            perfectDVs:                 true, //sets all DVs to 15
            dvSetting:                  "Max", //Max, Min, NPC, or Random
            trashCans:                  true, //solves the trash can puzzle
            options:                    true, //shows the options menu when set to true
            gametimeDisplay:            MyStorage["this.gametimeDisplay"] ?? false, //shows the options menu when set to true
            inventory:                  true, //uses inventory when in the department store & marts
            battleGraphic:              MyStorage["this.battleGraphic"] ?? true, //uses battle graphic with enemy moveset & stats
            showAllTrainers:            MyStorage["this.showAllTrainers"] ?? true, //when false only shows gym leaders and rivals, when true shows all enemy trainers
            expBarAnimation:            true,
            showSpecialTrainerGraphics: MyStorage["this.showSpecialTrainerGraphics"] ?? true, //shows drawn art for defined trainers
            battlePopUps:               MyStorage["this.battlePopUps"] ?? true, //shows reflect, lightscreen, safeguard, weather, accuracy, evasion, etc
            typeCalcs:                  true, //calculates effective power based on the pokemon in battle
            showCritMultiplierInEP:     MyStorage["this.showCritMultiplierInEP"] ?? true, //shows high crit ratio moves with adjusted power if the move always scores a crit
            show_wild_battles:          MyStorage["this.show_wild_battles"] ?? false, //shows wild battles in the battle screen
            automaticallySavePBSplits:  true, //saves splits if the player beats their PB (this overwrites currently saved PB splits)


            help_menus: "Settings",

            //KEYHOOK SHORTCUTS
            lastExecuted: 0,
            cycleValues_rightDisplay: ["movepool", "inventory", "splits", "none"], //F13
            cycleIndex_rightDisplay: MyStorage["this.cycleIndex_rightDisplay"] ?? 0, //F13
            cycleValues_stats: ["base", "stats", "evs", "ivs"], //F15
            cycleIndex_stats: MyStorage["this.cycleIndex_stats"] ?? 0, //F15
            cycleValues_failures: ["resets", "blackouts"], //F16
            cycleIndex_failures: MyStorage["this.cycleIndex_failures"] ?? 0, //F17
            cycleValues_screens: ["screens", "bonks"], //F17
            cycleIndex_screens: MyStorage["this.cycleIndex_screens"] ?? 0, //F16
            key_F13: MyStorage["this.key_F13"] ?? "movepool", //rightDisplay
            key_F14: MyStorage["this.key_F14"] ?? true, //show movepool
            key_F15: MyStorage["this.key_F15"] ?? "stats", //stat display type
            key_F16: MyStorage["this.key_F16"] ?? "resets",
            key_F17: MyStorage["this.key_F17"] ?? "screens",
            key_F18: MyStorage["this.key_F18"] ?? "",
            key_F19: MyStorage["this.key_F19"] ?? "",
            key_F20: MyStorage["this.key_F20"] ?? "",
            key_F21: MyStorage["this.key_F21"] ?? "",
            key_F22: MyStorage["this.key_F22"] ?? "",
            key_F23: MyStorage["this.key_F23"] ?? "",
            key_F24: MyStorage["this.key_F24"] ?? "",

            //ENCOUNTERS ---------------------------------------------------------------------------------------//
            route1:         MyStorage["this.route1"] ?? true,
            viridianForest: MyStorage["this.viridianForest"] ?? true,
            route3:         MyStorage["this.route3"] ?? true,
            mtMoon:         MyStorage["this.mtMoon"] ?? true,
            route6:         MyStorage["this.route6"] ?? true,
            rockTunnel:     MyStorage["this.rockTunnel"] ?? true,
            pokemonTower:   MyStorage["this.pokemonTower"] ?? true,
            safariZone:     MyStorage["this.safariZone"] ?? true,
            powerPlant:     MyStorage["this.powerPlant"] ?? true,
            mansion:        MyStorage["this.mansion"] ?? true,
            route21:        MyStorage["this.route21"] ?? true,
            route22:        MyStorage["this.route22"] ?? true,
            victoryRoad:    MyStorage["this.victoryRoad"] ?? true,

            goal_level:    MyStorage["this.goal_level"] ?? 13,
            goal_speed:    MyStorage["this.goal_speed"] ?? 24,

            rockTunnelDarkness: MyStorage["this.rockTunnelDarkness"] ?? false, //if true it will make rock tunnel bright
            

            //DATA ---------------------------------------------------------------------------------------------//
            g1MoveData:         g1MoveData,
            g1PokemonData:      g1PokemonData,
            g1PokemonDataRB:    g1PokemonDataRB,
            g1YellowTrainers:   g1YellowTrainers,
            g1RedBlueTrainers:  g1RedBlueTrainers,
            typeData:           typeData,
            stageModifiersData: stageModifiersData,
            tmhmMapping:        tmhmMapping,
            settings:           settings,
            
            //VARS ---------------------------------------------------------------------------------------------//
            pkmnMoves:       ["move1","move2","move3","move4"],
            pkmnSlots:       [0, 1, 2, 3, 4, 5],
            fieldEffects:    ["reflect","lightScreen","bide","thrash","multiHit","flinch","charging","multiTurn","invulnerable","confusion","xAccuracy","mist","focusEnergy","hasSubstitute","recharge","rage","leechSeeded","toxic","transformed"],
            accuracyEvasion: ["accuracy", "evasion"],
            g1stateVariable: "Base Stats",
            state: "Base Stats",
            prevSpecies:     undefined,
            enemyModColour:  ["0", "background: #d84444;"],
            enemyState:      "Not In Battle", //"Pokemon", "Fainted"
            oldExpValue: 0,

            //resets
            playerId: 0,
            playerName: "NINTEN",
            resetCatcher: "NINTEN",
            playerResets: MyStorage["playerResets"] ?? 0,
            blackout_counter: MyStorage["blackout_counter"] ?? 0,
            resetCounter: true,
            game_over: false,
            attempt_number: MyStorage["this.attempt_number"] ?? 0,
            most_recent_move: "",

            blackouts_as_resets: false, //counts blackouts as resets
            blackout:            false,

            //Pokemon settings for local storage
            overlay_color: MyStorage["this.overlay_color"] ?? "#000000",
            imageXOffset:  MyStorage["this.imageXOffset"] ?? 0,
            imageYOffset:  MyStorage["this.imageYOffset"] ?? 0,
            imageScale:    MyStorage["this.imageScale"] ?? 1,
            imageFlip:     MyStorage["this.imageFlip"] ?? false,

            //
            playerNameChoice: MyStorage["playerNameChoice"] ?? "NINTEN",

            //timer variables
            timer_startTime: MyStorage["timer_startTime"] ?? 0,
            timer_pause: MyStorage["timer_pause"] ?? true,
            timer_formatted_time: ["0", ".00"],
            timer_pause_time: MyStorage["timer_pause_time"] ?? 0,
            battle_start: 0,
            timer_settings: MyStorage["this.timer_settings"] ?? "Real-Time",
            viridian_forest: MyStorage["this.viridian_forest"] ?? "Encounters On",

            //splits
            split_data: MyStorage["split_data"] ?? [],
            pb_splits: MyStorage[`${this.starterName}_pb_splits`] ?? [],
        }
    },

    created() {
        for (let i = 13; i <= 24; i++) {
            this.$watch(`key_F${i}`, function (newValue) {
                MyStorage[`this.key_F${i}`] = newValue;
            });
        }
    },
    watch: {
        starterName() {
            MyStorage["this.starterName"] = this.starterName
        },
        timer_settings() {
            MyStorage["this.timer_settings"] = this.timer_settings
        },
        //splits
        attempt_number() {
            MyStorage["this.attempt_number"] = this.attempt_number
        },
        split_data() {
            MyStorage["split_data"] = this.split_data
        },
        //timer functions
        timer_pause() {
            MyStorage["timer_pause"] = this.timer_pause
        },
        timer_startTime() {
            MyStorage["timer_startTime"] = this.timer_startTime
        },
        timer_pause_time() {
            MyStorage["timer_pause_time"] = this.timer_pause_time
        },
        //Encounter Checkboxes
        route1(newProp) {
            if (newProp == false && this.mapper.properties.overworld.map.value == "Route 1") { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
            if (newProp == true && this.mapper.properties.overworld.map.value == "Route 1") { this.mapper.properties.overworld.encounterRate.set(25, false) }
        },   
        // viridianForest(newProp) {
        //     if (newProp == false && this.mapper.properties.overworld.map.value == "Viridian Forest") { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
        //     if (newProp == true && this.mapper.properties.overworld.map.value == "Viridian Forest") { this.mapper.properties.overworld.encounterRate.set(25, false) }
        // },   
        route3(newProp) {
            if (newProp == false && this.mapper.properties.overworld.map.value == "Route 3") { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
            if (newProp == true && this.mapper.properties.overworld.map.value == "Route 3") { this.mapper.properties.overworld.encounterRate.set(20, false) }
        },            
        mtMoon(newProp) {
            if (newProp == false && (this.mapper.properties.overworld.map.value == "Mt Moon - 1" || this.mapper.properties.overworld.map.value == "Mt Moon - 2" || this.mapper.properties.overworld.map.value == "Mt Moon - 3")) { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
            if (newProp == true && (this.mapper.properties.overworld.map.value == "Mt Moon - 1" || this.mapper.properties.overworld.map.value == "Mt Moon - 2" || this.mapper.properties.overworld.map.value == "Mt Moon - 3")) { this.mapper.properties.overworld.encounterRate.set(10, false) }
        },                     
        route6(newProp) {
            if (newProp == false && this.mapper.properties.overworld.map.value == "Route 6") { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
            if (newProp == true && this.mapper.properties.overworld.map.value == "Route 6") { this.mapper.properties.overworld.encounterRate.set(15, false) }
        },   
        rockTunnel(newProp) {
            if (newProp == false && (this.mapper.properties.overworld.map.value == "Rock Tunnel - 1" || this.mapper.properties.overworld.map.value == "Rock Tunnel")) { this.mapper.properties.overworld.encounterRate.set(0, false) }
            if (newProp == true && (this.mapper.properties.overworld.map.value == "Rock Tunnel - 1" || this.mapper.properties.overworld.map.value == "Rock Tunnel")) { this.mapper.properties.overworld.encounterRate.set(15, false) }
        },            
        pokemonTower(newProp) {
            if (newProp == false && (this.mapper.properties.overworld.map.value == "Pokemon Tower - 2F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 3F" || 
            this.mapper.properties.overworld.map.value == "Pokemon Tower - 4F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 5F" || 
            this.mapper.properties.overworld.map.value == "Pokemon Tower - 6F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 7F")) { this.mapper.properties.overworld.encounterRate.set(0, false) }
            if (newProp == true && (this.mapper.properties.overworld.map.value == "Pokemon Tower - 2F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 3F" || 
            this.mapper.properties.overworld.map.value == "Pokemon Tower - 4F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 5F" || 
            this.mapper.properties.overworld.map.value == "Pokemon Tower - 6F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 7F")) { this.mapper.properties.overworld.encounterRate.set(10, false) }
        },            
        safariZone(newProp) {
            if (newProp == false && (this.mapper.properties.overworld.map.value == "Safari Zone (East)" || this.mapper.properties.overworld.map.value == "Safari Zone (West)" || this.mapper.properties.overworld.map.value == "Safari Zone (Center)" || this.mapper.properties.overworld.map.value == "Safari Zone (North)")) { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
        },       
        mansion(newProp) {
            if (newProp == false && this.mapper.properties.overworld.map.value == "Cinnabar Mansion") { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
        },
        route21(newProp) {
            if (newProp == false && this.mapper.properties.overworld.map.value == "Route 21") { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
        },
        route22(newProp) {
            if (newProp == false && this.mapper.properties.overworld.map.value == "Route 22") { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
        },
        victoryRoad(newProp) {
            if (newProp == false && this.mapper.properties.overworld.map.value == "Victory Road") { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
        },
        goal_level(newProp) {
            if (this.mapper.properties.player.team[0].level.value >= newProp && this.mapper.properties.overworld.map.value == "Viridian Forest" && this.mapper.properties.player.team[1].species.value == "Pidgey") { 
                this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
            }
            if (this.mapper.properties.player.team[0].level.value < newProp) {
                this.viridianEncounterEnable()
            }
        },
        goal_speed(newProp) {
            if (this.mapper.properties.player.team[0].speed.value >= newProp && this.mapper.properties.overworld.map.value == "Viridian Forest" && this.mapper.properties.player.team[1].species.value == "Pidgey") { 
                this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
            }
            if (this.mapper.properties.player.team[0].speed.value < newProp) {
                this.viridianEncounterEnable()
            }
        },
        viridian_forest(newProp) {
            const encountersOff = 0x00
            if (newProp == "Pidgey") {
                if (this.mapper.properties.player.team[1].species.value == "Pidgey") {
                    this.mapper.properties.overworld.encounterRate.setBytes([encountersOff], false)
                }
                else {
                    this.viridianEncounterEnable()
                }
            }
            if (newProp == "Level") {
                if (this.mapper.properties.player.team[0].level.value >= this.goal_level && this.mapper.properties.player.team[1].species.value == "Pidgey") {
                    this.mapper.properties.overworld.encounterRate.setBytes([encountersOff], false)
                }
                else {
                    this.viridianEncounterEnable()
                }
            }
            if (newProp == "Speed") {
                if (this.mapper.properties.player.team[0].speed.value >= this.goal_speed && this.mapper.properties.player.team[1].species.value == "Pidgey") {
                    this.mapper.properties.overworld.encounterRate.setBytes([encountersOff], false)
                }
                else {
                    this.viridianEncounterEnable()
                }
            }
            if (newProp == "Encounters On") {
                this.viridianEncounterEnable()
            }
        },
        async starterName(newValue, oldValue) {
            //transition between background textures
            this.$refs.old_background_texture.src = `images/textures/${g1PokemonData[oldValue].type1}.png`
            this.$refs.old_background_texture.style.opacity = 1
            
            await transition((t) => {
                this.$refs.old_background_texture.style.opacity = 1 - t
            }, 500)
            
            this.$refs.old_background_texture.src = ""

            //update the saved starter in the overlay's local storage
            MyStorage.currentStarter = newValue
        },
        playerId() {
            this.game_over = false;
            MyStorage["playerResets"] = 0
            this.playerResets = 0;
            MyStorage["blackout_counter"] = 0
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
            MyStorage["playerResets"] = this.playerResets
        },
        blackout_counter(newProp) {
            if (this.blackout_counter < 0) {
                this.blackout_counter = 0;
            }
            MyStorage["blackout_counter"] = this.blackout_counter
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
            MyStorage["playerNameChoice"] = this.playerNameChoice
            MyStorage["overlay_color"] = this.overlay_color
        }
    },

    computed: {
        playerResetsDisplay() {
            if (this.blackouts_as_resets == true) {
                return this.playerResets + this.blackout_counter
            }
            else {
                return this.playerResets
            }
        },
        mew_movepool_style() {
            if (this.starterName == "Mew") {
                return "font-size: 15px; line-height: 15.5px;"
            }
        },
        pokemon_version_specific_data() {
            if (this.mapper.properties.meta.gameName.value == "Pokemon Yellow") { return this.g1PokemonData }
            if (this.mapper.properties.meta.gameName.value == "Pokemon Red and Blue") { return this.g1PokemonDataRB }
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
        currentTrainer() {
            if (this.mapper.properties.meta.gameName.value == "Pokemon Yellow") { return g1YellowTrainers[this.mapper.properties.battle.trainer.class.value + " " + this.mapper.properties.battle.trainer.number.value] }
            else if (this.mapper.properties.meta.gameName.value == "Pokemon Red and Blue") { return g1RedBlueTrainers[this.mapper.properties.battle.trainer.class.value + " " + this.mapper.properties.battle.trainer.number.value] }
            else { return g1YellowTrainers[this.mapper.properties.battle.trainer.class.value + " " + this.mapper.properties.battle.trainer.number.value] }
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
            if (this.state == `Battle`) {
                return this.mapper?.properties?.battle?.yourPokemon
            }
            else if (this.state == `Base Stats` || this.mapper?.properties?.player?.team[0].species.value == null) {
                var data = this.g1PokemonData?.[this.starterName]
                return {
                    species: { value: data.name },
                    ...data
                }
            }
            else {
                return this.mapper?.properties?.player?.team[0]
            }
        },
        starting_type_fix() {
            if (this.map.overworld.map.value == "Pallet Town - Oak's Lab" || this.state == "Base Stats") {
                return [this.g1PokemonData[this.starterName].type1.toLowerCase(), this.g1PokemonData[this.starterName].type2.toLowerCase()]
            }
            else {
                return [this.s1dynamicReset.type1.toString().toLowerCase(), this.s1dynamicReset.type2.toString().toLowerCase()]
            }
        },

        //CO-PILOT REFACTOR
        battle_fade() {
            const trainerClasses = ["LORELEI", "BRUNO", "AGATHA", "LANCE", "RIVAL3"];
            const validStates = ["To Battle", "Battle", "From Battle"];
          
            if (validStates.includes(this.state) &&
                (trainerClasses.includes(this.batt.trainer.class.value) ||
                 this.state != "From Battle")) {
              return true;
            } else {
              return false;
            }
        },
        // SCREENS
        screen() {
            if (this.batt.yourPokemon.effects.reflect.value == true && this.batt.yourPokemon.effects.lightScreen.value == true) {
                return ["Both","font-size: 20px","Screens",]
            }
            if (this.batt.yourPokemon.effects.lightScreen.value == true) {
                return ["Light Screen","font-size: 16px","Screen",]
            }
            if (this.batt.yourPokemon.effects.reflect.value == true) {
                return ["Reflect","font-size: 20px","Screen",]
            }
            else {
                return [" ","font-size: 20px","Screen",]
            }
        },
        growthRate() {
            var species = this.s1dynamicReset.species.value
            // debugger
            return this.g1PokemonData[species ?? this.starterName].growth_rate
        },
        getStarterType() {
            var type1 = this.g1PokemonData[this.starterName].type1.toLowerCase()
            var type2 = this.g1PokemonData[this.starterName].type2.toLowerCase()
            return { "type1": type1, "type2": type2 }
        },
    },

    //FUNCTIONS -----------------------------------------------------------------------------------------------//
    methods: {
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
            //*autosplitter methods
        //format trainer names so they can be written to csv
        format_trainer_name(trainer_class, trainer_number) {
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
            // if (trainer_class == "YOUNGSTER"    && this.mapper.properties.battle.trainer.number == 1)   { return "Youngster Ben" }
            // if (trainer_class == "LASS"         && this.mapper.properties.battle.trainer.number == 10)  { return "Oddish Lass" } 
            // if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 1)   { return "Pecking Lass" } 
            // if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 3)   { return "Sandy" } 
            if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 5)   { return "Wrapping Lass" } 
            // if (trainer_class == "SUPER NERD"   && this.mapper.properties.battle.trainer.number == 2)   { return "Fossil Nerd" }
            // if (trainer_class == "POKEMANIAC"   && this.mapper.properties.battle.trainer.number == 7)   { return "Slowbone" }
            // if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 10)  { return "Status-Condition-Jr-Trainer" }
            if (trainer_class == "HIKER"        && this.mapper.properties.battle.trainer.number == 9)   { return "Selfdestructing Hiker" }
            // if (trainer_class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 18)  { return "Finisher" }
            // if (trainer_class == "ROCKET"       && this.mapper.properties.battle.trainer.number == 38)  { return "Hypno Rocket" }
            // if (trainer_class == "CHANNELER"    && this.mapper.properties.battle.trainer.number == 10)  { return "Agatha Jr" }
            else return this.capitalization_format(trainer_class)
        },

        //*timer methods
        //start the timer
        startTime() {
            this.timer_startTime = Date.now()
            this.timer_pause = false
            this.updateTime()
        },
        //stop the timer
        stopTime() {
            this.timer_pause_time = Date.now()
            this.timer_pause = true
        },
        //animate the timer
        updateTime() {
            var time = Date.now() - this.timer_startTime
            if (this.timer_pause == true) {
                time = this.timer_pause_time - this.timer_startTime
            }
            var f = (x) => x.toString().padStart(2, "0")
            var c = (Math.floor(time / 10) % 100)
            var s = (Math.floor(time / 1000) % 60)
            var m = (Math.floor(time / 60000) % 60)
            var h = (Math.floor(time / 3600000))
            if (h != 0) 
                this.timer_formatted_time = [ h + ":" + f(m) + ":" + f(s), "." + f(c), h + "h" + m + "m" + s + "s", ]
            else if (m != 0) 
                this.timer_formatted_time = [ m + ":" + f(s), "." + f(c), h + "h" + m + "m" + s + "s", ]
            else 
                this.timer_formatted_time = [ s, "." + f(c), h + "h" + m + "m" + s + "s", ]
            if (this.timer_pause == false) {
                requestAnimationFrame(this.updateTime)
            }
        },
        //pause the timer
        pauseUnpauseTime() {
            if (this.timer_pause == true) {
                this.timer_pause = false
                this.timer_startTime += Date.now() - this.timer_pause_time
                this.updateTime()
                retro.resume()
            }
            else {
                this.timer_pause = true
                this.timer_pause_time = Date.now()
                retro.pause()
            }
        },
        resetTime() {
            this.timer_pause = true
            this.timer_startTime = 0
            this.timer_pause_time = 0
            this.timer_formatted_time = [ "0", ".00" ]
        },
        newRun() {
            this.timer_pause = true
            this.most_recent_move = ""
            this.timer_startTime = 0
            this.timer_pause_time = 0
            this.attempt_number++;
            this.timer_formatted_time = [ "0", ".00" ]
            this.playerResets = 0
            this.blackout_counter = 0
            this.playerId = 0
            this.playerName = "NINTEN"
            this.second_playthrough_settings()
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
                return this.mapper?.properties?.battle?.yourPokemon?.["type" + typeNumber.toString()].value.toLowerCase()
            }
            if (this.state == `Overworld` || this.state == `To Battle` || this.state == `From Battle`) {
                return this.mapper?.properties?.player?.team[0]?.["type" + typeNumber.toString()].value.toLowerCase()
            }
            if (this.state != `Battle`) {
                return data["type" + typeNumber.toString()].toLowerCase()
            }
        },
        //! Refactor with co-pilot
        save_all_settings() {
            this.set_setting_prop("this.route1", this.route1)
            this.set_setting_prop("this.viridianForest", this.viridianForest)
            this.set_setting_prop("this.route3", this.route3)
            this.set_setting_prop("this.mtMoon", this.mtMoon)
            this.set_setting_prop("this.route6", this.route6)
            this.set_setting_prop("this.rockTunnel", this.rockTunnel)
            this.set_setting_prop("this.pokemonTower", this.pokemonTower)
            this.set_setting_prop("this.safariZone", this.safariZone)
            this.set_setting_prop("this.mansion", this.mansion)
            this.set_setting_prop("this.help_menus", this.help_menus)
            this.set_setting_prop("this.dvSetting", this.dvSetting)
            this.set_setting_prop("this.trashCans", this.trashCans)
            this.set_setting_prop("this.options", this.options)
            this.set_setting_prop("this.gametimeDisplay", this.gametimeDisplay)
            this.set_setting_prop("this.resetCounter", this.resetCounter)
            this.set_setting_prop("this.playerResets", this.playerResets)
            this.set_setting_prop("this.route21", this.route21)
            this.set_setting_prop("this.route22", this.route22)
            this.set_setting_prop("this.victoryRoad", this.victoryRoad)
            this.set_setting_prop("this.powerPlant", this.powerPlant)
            this.set_setting_prop("this.blackouts_as_resets", this.blackouts_as_resets)
            this.set_setting_prop("this.showCritMultiplierInEP", this.showCritMultiplierInEP)
            this.set_setting_prop("this.show_wild_battles", this.show_wild_battles)
            this.set_setting_prop("this.battleGraphic", this.battleGraphic)
            this.set_setting_prop("this.showAllTrainers", this.showAllTrainers)
            this.set_setting_prop("this.showSpecialTrainerGraphics", this.showSpecialTrainerGraphics)
            this.set_setting_prop("this.battlePopUps", this.battlePopUps)
            this.set_setting_prop("this.rockTunnelDarkness", this.rockTunnelDarkness)
            this.set_setting_prop("this.goal_level", this.goal_level)
            this.set_setting_prop("this.goal_speed", this.goal_speed)
            this.set_setting_prop("this.viridian_forest", this.viridian_forest)
        },
        save_all_settings() {
            const propertiesToSave = [
                "route1", "viridianForest", "route3", "mtMoon", "route6", 
                "rockTunnel", "pokemonTower", "safariZone", "mansion", "help_menus", 
                "dvSetting", "trashCans", "options", "gametimeDisplay", "resetCounter", 
                "playerResets", "route21", "route22", "victoryRoad", "powerPlant", 
                "blackouts_as_resets", "showCritMultiplierInEP", "show_wild_battles", 
                "battleGraphic", "showAllTrainers", "showSpecialTrainerGraphics", 
                "battlePopUps", "rockTunnelDarkness", "goal_level", "goal_speed", 
                "viridian_forest, blackout_counter"
            ];
            propertiesToSave.forEach(prop => {
                this.set_setting_prop(`this.${prop}`, this[prop]);
            });
        },
        load_all_settings() {
            this.route1 = MyStorage["this.route1"] ?? true
            this.viridianForest = MyStorage["this.viridianForest"] ?? true
            this.goal_level = MyStorage["this.goal_level"] ?? 13
            this.goal_speed = MyStorage["this.goal_speed"] ?? 24
            this.route3 = MyStorage["this.route3"] ?? true
            this.mtMoon = MyStorage["this.mtMoon"] ?? true
            this.route6 = MyStorage["this.route6"] ?? true
            this.route6 = MyStorage["this.rockTunnel"] ?? true
            this.route6 = MyStorage["this.pokemonTower"] ?? true
            this.safariZone = MyStorage["this.safariZone"] ?? true
            this.mansion = MyStorage["this.mansion"] ?? true
            this.help_menus = MyStorage["this.help_menus"] ?? "Settings"
            this.dvSetting = MyStorage["this.dvSetting"] ?? "Max"
            this.trashCans = MyStorage["this.trashCans"] ?? true
            this.options = MyStorage["this.options"] ?? true
            this.gametimeDisplay = MyStorage["this.gametimeDisplay"] ?? true
            this.resetCounter = MyStorage["this.resetCounter"] ?? true
            this.playerResets = MyStorage["this.playerResets"] ?? 0
            this.route21 = MyStorage["this.route21"] ?? true
            this.route22 = MyStorage["this.route22"] ?? true
            this.victoryRoad = MyStorage["this.victoryRoad"] ?? true
            this.powerPlant = MyStorage["this.powerPlant"] ?? true
            this.blackouts_as_resets = MyStorage["this.blackouts_as_resets"] ?? true
            this.blackout_counter = MyStorage["this.blackout_counter"] ?? 0
            this.show_wild_battles = MyStorage["this.show_wild_battles"] ?? false
            this.showCritMultiplierInEP = MyStorage["this.showCritMultiplierInEP"] ?? true
            this.battleGraphic = MyStorage["this.battleGraphic"] ?? true
            this.showAllTrainers = MyStorage["this.showAllTrainers"] ?? true
            this.showSpecialTrainerGraphics = MyStorage["this.showSpecialTrainerGraphics"] ?? true
            this.battlePopUps = MyStorage["this.battlePopUps"] ?? true
            this.rockTunnelDarkness = MyStorage["this.rockTunnelDarkness"] ?? false
            this.playerResets = MyStorage["playerResets"] ?? 0
            this.goal_level = MyStorage["goal_level"] ?? 13
            this.goal_speed = MyStorage["goal_speed"] ?? 24
            this.attempt_number = MyStorage["attempt_number"] ?? 0
            this.viridian_forest = MyStorage["this.viridian_forest"] ?? "Encounters On"
            this.pb_splits = MyStorage[`${this.starterName}_pb_splits`] ?? ["","","",""]
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
        },
        resets_decrement() {
            if (this.key_F16 == "blackouts") {
                this.blackout_counter--
            }
            if (this.key_F16 == "resets") {
                this.playerResets--
            }
        },
        async colorPick() {
            return new EyeDropper().open().then(res => res.sRGBHex)
        },
        async color_picker() {
            var color = await this.colorPick()
            this.set_pokemon_prop("overlay_color", color)
            this.overlay_color = color
            // console.log(MyStorage.entries())
        },
        set_pokemon_prop(property_name, value) {
            MyStorage[this.starterName] = {
                ...MyStorage[this.starterName],
                [property_name]: value,
            }
        },
        set_setting_prop(property_name, value) {
            MyStorage[property_name] = value
        },
        warn(...vars) {
            console.log(...vars)
        },
        reset_advanced_settings() {
            this.battleGraphic = true
            this.showAllTrainers = true
            this.showSpecialTrainerGraphics = true
            this.show_wild_battles = false
            this.battlePopUps = true
            this.showCritMultiplierInEP = true
            this.rockTunnelDarkness = false
        },
        first_playthrough_settings() {
            this.route1 = true
            this.viridianForest = true
            this.route3 = true
            this.mtMoon = true
            this.route6 = true
            this.rockTunnel = true
            this.pokemonTower = true
            this.safariZone = true
            this.powerPlant = true
            this.mansion = true
            this.route21 = true
            this.route22 = true
            this.victoryRoad = true
        },
        second_playthrough_settings() {
            this.route1 = false
            this.viridianForest = true
            this.route3 = false
            this.mtMoon = false
            this.route6 = false
            this.rockTunnel = true
            this.pokemonTower = true
            this.safariZone = true
            this.powerPlant = true
            this.mansion = true
            this.route21 = true
            this.route22 = true
            this.victoryRoad = true
            this.viridian_forest == "Pidgey"
        },
        all_off() {
            this.route1 = false
            this.viridianForest = false
            this.route3 = false
            this.mtMoon = false
            this.route6 = false
            this.rockTunnel = false
            this.pokemonTower = false
            this.safariZone = false
            this.powerPlant = false
            this.mansion = false
            this.route21 = false
            this.route22 = false
            this.victoryRoad = false
        },
        apply_settings(setting_group) { //pass in the name of the group of settings that are to have values assigned
            keys = this.settings[setting_group]

            Object.keys(keys).forEach(key => {
                this[key] = keys[key];
            });
        },
        save_pokemon_sprite_settings() {
            this.set_pokemon_prop("imageXOffset", this.imageXOffset)
            this.set_pokemon_prop("imageYOffset", this.imageYOffset)
            this.set_pokemon_prop("imageScale", this.imageScale)
            this.set_pokemon_prop("imageFlip", this.imageFlip)
            // console.log(MyStorage.entries())
        },
        save_pb_splits() {
            this.set_setting_prop(`${this.starterName}_pb_splits`, this.split_data)
            this.pb_splits = this.split_data
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
                return String(remainingSeconds);
            }
        },
        addDurations(duration1, duration2) {
            const totalSeconds = convertDurationToSeconds(duration1) + convertDurationToSeconds(duration2);
            return convertSecondsToDuration(totalSeconds);
        },
        subtractDurations(duration1, duration2) {
            const totalSeconds = convertDurationToSeconds(duration1) - convertDurationToSeconds(duration2);
            return convertSecondsToDuration(totalSeconds);
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
            const currentTimeInSeconds = convertTimeToSeconds(currentTime);
            const splitTimeInSeconds = convertTimeToSeconds(splitTime);
            const differenceInSeconds = currentTimeInSeconds - splitTimeInSeconds;
            return convertSecondsToTime(differenceInSeconds);
        },
        
        clear_pokemon_sprite_settings() {
            this.imageXOffset = 0
            this.imageYOffset = 0
            this.imageScale = 1
            this.imageFlip = false
            this.set_pokemon_prop("imageXOffset", this.imageXOffset)
            this.set_pokemon_prop("imageYOffset", this.imageYOffset)
            this.set_pokemon_prop("imageScale", this.imageScale)
            this.set_pokemon_prop("imageFlip", this.imageFlip)
            // console.log(MyStorage.entries())
        },
        load_pokemon_sprite_settings(pokemon_species) {
            this.imageXOffset = MyStorage[pokemon_species]?.imageXOffset ?? 0
            this.imageYOffset = MyStorage[pokemon_species]?.imageYOffset ?? 0
            this.imageScale = MyStorage[pokemon_species]?.imageScale ?? 1
            this.imageFlip = MyStorage[pokemon_species]?.imageFlip ?? false
            if (MyStorage[pokemon_species]?.overlay_color) {
                this.overlay_color = MyStorage[pokemon_species]?.overlay_color
            }
            else {
                this.overlay_color = `var(--${this.s1dynamicReset.type1})`
            }
        },
        load_starter_pokemon_settings() {
            this.starterName = MyStorage[this.currentStarter] ?? "Venomoth"
        },
        clear_overlay_color() {
            this.set_pokemon_prop("overlay_color", null)
            this.load_pokemon_sprite_settings()
            // this.overlay_color = "#000000"
        },
        keys_function(object) {
            return Object.keys(object)
        },
        select_starter(pokemon_species) {
            this.starterName = pokemon_species
        },
        g1CritRate(baseSpeed) {
            return Math.round((Math.floor(baseSpeed/2)/256) * 10000) / 100
        },
        move_name(move_string) {
            if (move_string == null) { return "" }
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
              "sonicboom":    "SonicBoom"
            };
            const formattedMove = moveMappings[move_string];
            return formattedMove || this.capitalization_format(move_string);
        },

        wild_pkmn_name(species_string) {
            if (species_string == null || species_string == undefined) { return "" }
            species_string = species_string.toLowerCase()
            const speciesMappings = {
              "nidoranm":     "Nidoran M",
              "nidoranf":     "Nidoran F",
              "mr. mime":     "Mr. Mime",
              "farfetch'd":   "Farfetch'd",
            };
            const formattedMove = speciesMappings[species_string];
            // console.log(formattedMove, species_string)
            return formattedMove || this.capitalization_format(species_string);
        },

        //ENEMY MOD STYLING
        enemyMods(modValue) {
            if (this.state != "Battle") { return this.enemyModColour }
            var neutral = ["0", "background: #a1a1a1;"]
            var raised = [modValue, "background: #d84444;"]
            var lowered = [modValue, "background: #21c500"]
            if (modValue < 0) { this.enemyModColour = raised }
            if (modValue > 0) { this.enemyModColour = lowered }
            return this.enemyModColour 
        },
        enemyDynamic(activePkmn, currentSlot) {
            if (activePkmn == currentSlot && this.state == "Battle") {
                return this.mapper?.properties?.battle?.enemyPokemon
            }
            else { 
                return this.mapper?.properties?.battle?.trainer?.team[activePkmn]
            }
        },
        
        //Movepool Graphic
        dataSearch(dataObject, pointerValue) {
            if (!pointerValue) return ""
            if (!dataObject) return ""
            const key = Object.keys(dataObject).find(x => x.toLowerCase() == pointerValue.toLowerCase())
            return dataObject[key] || "ERROR"
        },
        getMovepool(gen1PkmnData, moveData, tmhmMapping, species) {
            const pkmn = this.dataSearch(gen1PkmnData, species)
            if (pkmn.initial_moveset == undefined) {  }
            let obj = {
                initial: pkmn.initial_moveset.map(x => {
                    return this.dataSearch(moveData, x)
                }),
                level: pkmn.levelup_moveset.map(x => {
                    return {
                        ...{Level: x[0]},
                        ...this.dataSearch(moveData, x[1]) //searching for index 1
                    }
                }),     
                tmhm: pkmn.tm_hm_learnset.map(x => {
                    return {
                        ...{tmhm: tmhmMapping.find(y => y.Move == x)?.tmhmIndex??"TM01"},
                        ...this.dataSearch(moveData, x)
                    }
                }),     
            }
            return obj
        },
        
        getEnemyPkmnStyles(pkmnData) {
            const isFainted = pkmnData.hp.value == 0;
            return {
              faint: isFainted
                ? "filter: drop-shadow(2px 2px 2px #000) saturate(1.3) grayscale(100%); opacity: .5;"
                : "filter: drop-shadow(2px 2px 2px #000) saturate(1.3) grayscale(0%);",
              faintStats: isFainted
                ? "filter: grayscale(100%); opacity: .4;"
                : "filter: grayscale(0%);",
              text: isFainted ? "opacity: .3" : "",
              species: isFainted ? "opacity: .3" : "opacity: .7"
            };
        },

        accEva(mod) {
            if (mod > 0) {
                return "+" + mod
            }
            else return mod
        },

        //REMOVES CAPITALIZATION (TACKLE -> Tackle) OR (Tail Whip -> Tail whip)
        capitalization_format(str) {
            if (str == null) { return "" }
            return str.toLowerCase().replace(/(^|\s|\-|\.)(\w)/g, function(match, p1, p2) {
              return p1 + p2.toUpperCase();
            });
        },
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
        
        //BADGE GRAPHIC RECALL
        badgeGraphic(x) {
            if (x.value == true) {
                var badge = x.path.toString().substring(14)
                return `images/badges/${badge}.png`
            }
            else if (x.value == false) {   
                return null
            }
        },

        pokemon(y) {
            if (y != null)
                y = parseInt(y)
            return this.g1PokemonData[this.starterName]
        },
        stageModifiers(y) {
            if (y === null) {
                return " "
            }
            else
                if (y > 0) {
                    return "+" + y.toString()
                }
                else
                    if (y < 0) {
                        return y.toString()
                    }
                    else
                        return " "
        },
        statLabelOpacity(x) {
            if (x.bytes != 7)
                return 0
            else
                return 1
        },

        // STAGE MULTIPLIERS
        activeSlot(activePkmn, currentSlot, statLabel, stat, side) {
            if (this.enemyState == "Fainted" || this.state == "From Battle") {
                return stat 
            }
            else if (this.enemyState == "Pokemon" || this.enemyState == "Pokemon Sent Out" || this.enemyState == "Fainting") {
                if (activePkmn == currentSlot && this.state == "Battle") {
                    return this.mapper.properties.battle[side][statLabel].value
                }
                else { 
                    return stat
                }
            }
            else {
                return stat
            }
        },

        //MOVE ICON DISPLAY
        moveTypeIcon(y) { //y = move1.value
            if (y != null && y != undefined) {
                var moveName = this.move_name(y)
                var move = this.g1MoveData[moveName]
                var moveType = move.Type.toLowerCase()
                return `images/elements/type-icons/${moveType}.png`
            }
            return null
        },

        g1trainerEnemySelector(trainerClass) {
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
        },

        fixTrainerName(trainerName, trainerNumber) {
            const gameName = this.mapper.properties.meta.gameName.value;
            const rival1Teams = ["rival1's team", "rival1A's team", "rival2's team"];
            const rival2Teams = [
              "rival3's team",
              "rival4's team",
              "rival4's team",
              "rival4's team",
              "rival5's team",
              "rival5's team",
              "rival5's team",
              "rival6's team",
              "rival6's team",
              "rival6's team",
            ];
          
            if (gameName == "Pokemon Yellow") {
              if (trainerName == "RIVAL1") {
                return rival1Teams[trainerNumber - 1];
              } 
              else if (trainerName == "RIVAL2") {
                return rival2Teams[trainerNumber - 1];
              } 
              else if (trainerName == "RIVAL3") {
                return "champion's team";
              } 
              else {
                return trainerName.toLowerCase() + "'s team";
              }
            } 
            else if (gameName == "Pokemon Red and Blue") {
              if (trainerName == "RIVAL1" && (trainerNumber == 1 || trainerNumber == 2 || trainerNumber == 3)) {
                return "rival1's team";
              } 
              else if (trainerName == "RIVAL1" && (trainerNumber == 4 || trainerNumber == 5 || trainerNumber == 6)) {
                return "rival1a's team";
              }
              else if (trainerName == "RIVAL1" && (trainerNumber == 7 || trainerNumber == 8 || trainerNumber == 9)) {
                return "rival2's team";
              }
              else if (trainerName == "RIVAL2" && (trainerNumber == 1 || trainerNumber == 2 || trainerNumber == 3)) {
                return "rival3's team";
              } 
              else if (trainerName == "RIVAL2" && (trainerNumber == 4 || trainerNumber == 5 || trainerNumber == 6)) {
                return "rival4's team";
              } 
              else if (trainerName == "RIVAL2" && (trainerNumber == 7 || trainerNumber == 8 || trainerNumber == 9)) {
                return "rival5's team";
              } 
              else if (trainerName == "RIVAL2" && (trainerNumber == 10 || trainerNumber == 11 || trainerNumber == 12)) {
                return "rival6's team";
              } 
              else if (trainerName == "RIVAL3") {
                return "champion's team";
              } 
              else {
                return trainerName.toLowerCase() + "'s team";
              }
            }
        },

        //! TODO Why do trainer graphics not appear in Red & Blue?
        //! Requires testing
        specialTrainerGraphics() {
            if (this.showSpecialTrainerGraphics) {
              const { class: trainerClass, number: trainerNumber } = this.mapper.properties.battle.trainer;
              if (this.mapper.properties.meta.gameName.value == "Pokemon Yellow") {
                switch (`${trainerClass}_${trainerNumber}`) {
                    case "LT.SURGE_1":
                        return "images/trainers/ltsurge.png";
                    case "SABRINA_1":
                        return "images/trainers/sabrina.png";
                    case "BLAINE_1":
                        return "images/trainers/BLAINE.png";
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
                }
              }
              if (this.mapper.properties.meta.gameName.value == "Pokemon Red and Blue") {
                switch (`${trainerClass}_${trainerNumber}`) {
                    case "LT.SURGE_1":
                        return "images/trainers/LTSURGE-RED.png";
                    case "SABRINA_1":
                        return "images/trainers/SABRINA-RED.png";
                    case "BLAINE_1":
                        return "images/trainers/BLAINE-RED.png";
                    case "RIVAL1_1":
                        return "images/trainers/RIVAL1.png";
                    case "RIVAL1_2":
                        return "images/trainers/RIVAL1.png";
                    case "RIVAL1_3":
                        return "images/trainers/RIVAL1.png";
                    case "RIVAL1_4":
                        return "images/trainers/RIVAL1.png";
                    case "RIVAL1_5":
                        return "images/trainers/RIVAL1.png";
                    case "RIVAL1_6":
                        return "images/trainers/RIVAL1.png";
                    case "RIVAL1_7":
                        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_8":
                        return "images/trainers/RIVAL2.png";
                    case "RIVAL1_9":
                        return "images/trainers/RIVAL2.png";
                    case "RIVAL2_1":
                        return "images/trainers/RIVAL2.png";
                    case "RIVAL2_2":
                        return "images/trainers/RIVAL2.png";
                    case "RIVAL2_3":
                        return "images/trainers/RIVAL2.png";
                }
              }
              switch (`${trainerClass}_${trainerNumber}`) {
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
                case "JR TRAINER F_10":
                  return "images/trainers/JR TRAINER F_10.png";
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
                default:
                  return null;
              }
            }
        },

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

        //CO-PILOT REFACTOR
        battlePokemonCrop() {
            const totalPokemon = this.mapper.properties.battle.trainer.totalPokemon;
            const heights = {
              1: "242px",
              2: "402px",
              3: "562px",
              4: "722px",
              5: "888px",
              6: "1080px"
            };
            return `height: ${heights[totalPokemon]};`;
        },
        
        //GAMETIME FUNCTIONS
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
        leadZero(y) {
            if (y < 10) return "0" + y.toString();
            return y;
        },

        //EXPERIENCE FUNCTIONS
        calcExpStats(growthRate, exp) {
            const expTable = {
                "Erratic":     [0,15,52,122,237,406,637,942,1326,1800,2369,3041,3822,4719,5737,6881,8155,9564,11111,12800,14632,16610,18737,21012,23437,26012,28737,31610,34632,37800,41111,44564,48155,51881,55737,59719,63822,68041,72369,76800,81326,85942,90637,95406,100237,105122,110052,115015,120001,125000,131324,137795,144410,151165,158056,165079,172229,179503,186894,194400,202013,209728,217540,225443,233431,241496,249633,257834,267406,276458,286328,296358,305767,316074,326531,336255,346965,357812,367807,378880,390077,400293,411686,423190,433572,445239,457001,467489,479378,491346,501878,513934,526049,536557,548720,560922,571333,583539,591882,600000],
                "Fast":        [0,6,21,51,100,172,274,409,583,800,1064,1382,1757,2195,2700,3276,3930,4665,5487,6400,7408,8518,9733,11059,12500,14060,15746,17561,19511,21600,23832,26214,28749,31443,34300,37324,40522,43897,47455,51200,55136,59270,63605,68147,72900,77868,83058,88473,94119,100000,106120,112486,119101,125971,133100,140492,148154,156089,164303,172800,181584,190662,200037,209715,219700,229996,240610,251545,262807,274400,286328,298598,311213,324179,337500,351180,365226,379641,394431,409600,425152,441094,457429,474163,491300,508844,526802,545177,563975,583200,602856,622950,643485,664467,685900,707788,730138,752953,776239,800000],
                "Medium Fast": [0,8,27,64,125,216,343,512,729,1000,1331,1728,2197,2744,3375,4096,4913,5832,6859,8000,9261,10648,12167,13824,15625,17576,19683,21952,24389,27000,29791,32768,35937,39304,42875,46656,50653,54872,59319,64000,68921,74088,79507,85184,91125,97336,103823,110592,117649,125000,132651,140608,148877,157464,166375,175616,185193,195112,205379,216000,226981,238328,250047,262144,274625,287496,300763,314432,328509,343000,357911,373248,389017,405224,421875,438976,456533,474552,493039,512000,531441,551368,571787,592704,614125,636056,658503,681472,704969,729000,753571,778688,804357,830584,857375,884736,912673,941192,970299,1000000],
                "Medium Slow": [0,9,57,96,135,179,236,314,419,560,742,973,1261,1612,2035,2535,3120,3798,4575,5460,6458,7577,8825,10208,11735,13411,15244,17242,19411,21760,24294,27021,29949,33084,36435,40007,43808,47846,52127,56660,61450,66505,71833,77440,83335,89523,96012,102810,109923,117360,125126,133229,141677,150476,159635,169159,179056,189334,199999,211060,222522,234393,246681,259392,272535,286115,300140,314618,329555,344960,360838,377197,394045,411388,429235,447591,466464,485862,505791,526260,547274,568841,590969,613664,636935,660787,685228,710266,735907,762160,789030,816525,844653,873420,902835,932903,963632,995030,1027103,1059860],
                "Slow":        [0,10,33,80,156,270,428,640,911,1250,1663,2160,2746,3430,4218,5120,6141,7290,8573,10000,11576,13310,15208,17280,19531,21970,24603,27440,30486,33750,37238,40960,44921,49130,53593,58320,63316,68590,74148,80000,86151,92610,99383,106480,113906,121670,129778,138240,147061,156250,165813,175760,186096,196830,207968,219520,231491,243890,256723,270000,283726,297910,312558,327680,343281,359370,375953,393040,410636,428750,447388,466560,486271,506530,527343,548720,570666,593190,616298,640000,664301,689210,714733,740880,767656,795070,823128,851840,881211,911250,941963,973360,1005446,1038230,1071718,1105920,1140841,1176490,1212873,1250000],
                "Fluctuating": [0,4,13,32,65,112,178,276,393,540,745,967,1230,1591,1957,2457,3046,3732,4526,5440,6482,7666,9003,10506,12187,14060,16140,18439,20974,23760,26811,30146,33780,37731,42017,46656,50653,55969,60505,66560,71677,78533,84277,91998,98415,107069,114205,123863,131766,142500,151222,163105,172697,185807,196322,210739,222231,238036,250562,267840,281456,300293,315059,335544,351520,373744,390991,415050,433631,459620,479600,507617,529063,559209,582187,614566,639146,673863,700115,737280,765275,804997,834809,877201,908905,954084,987754,1035837,1071552,1122660,1160499,1214753,1254796,1312322,1354652,1415577,1460276,1524731,1571884,1640000]
            };

            // makes searching a bit easiser
            expTable["Erratic"][100]     = expTable["Erratic"][99] + 1;
            expTable["Fast"][100]        = expTable["Fast"][99] + 1;
            expTable["Medium Fast"][100] = expTable["Medium Fast"][99] + 1;
            expTable["Medium Slow"][100] = expTable["Medium Slow"][99] + 1;
            expTable["Slow"][100]        = expTable["Slow"][99] + 1;
            expTable["Fluctuating"][100] = expTable["Fluctuating"][99] + 1;
        
            const index = expTable[growthRate].findIndex(x => x > exp);
            const currLvlExp = expTable[growthRate][index - 1];
            const nextLvlExp = expTable[growthRate][index];
            return {
                level: index,
                percent: (exp - currLvlExp) / (nextLvlExp - currLvlExp),
            };
        },

        // MOVE MANAGEMENT
        movePower(y) { //y = move1.value
            if (y) {
                // var move = this.gen1moves.find(x => x.Move.toLowerCase() === y.toLowerCase())
                var move = this.g1MoveData[this.move_name(y)]
                if (this.showCritMultiplierInEP == true && (y.toUpperCase() == "RAZOR LEAF" || y.toUpperCase() == "CRABHAMMER" || y.toUpperCase() == "SLASH" || y.toUpperCase() == "KARATE CHOP")) {
                    level = this.mapper.properties.player.team[0].level.value
                    critModifier = (2*level+5)/(level+5) //This part of the function is currently an approximation
                    power = move.Power
                    pokemon = this.g1PokemonData[this.starterName]
                    baseSpeed = pokemon.base_spd
                    //test to see if the Pokemon always crits
                    if (baseSpeed > 64) { //if the Pokemon has 63 or less base speed it will crit less often
                        return power * critModifier
                    }
                    else {
                        return power
                    }
                }
                else if (move) { return move.Power }
            }
            return null
        },

        moveAccuracyEvasionDynamic(move) {
            if (move) {
                var move_name = this.move_name(move)
                var moveObject = this.g1MoveData[move_name]
                var moveAccuracy = moveObject.Accuracy
                var accuracyStageMods = this.stageModifiersData.find(x => x.modType === "accuracy")
                var currentAccuracyModStage = this.batt.yourPokemon.modStageAccuracy.value
                var evasionStageMods = this.stageModifiersData.find(x => x.modType === "evasion")
                var currentEvasionModStage = this.batt.enemyPokemon.modEnemyStageEvasion.value
                if (this.state == `Battle` || this.state == `From Battle`) {
                    if (moveAccuracy == `-`) {
                        return `-`
                    }
                    else {
                        return Math.floor(moveAccuracy * accuracyStageMods[currentAccuracyModStage] * evasionStageMods[currentEvasionModStage])
                    }
                }
                else {
                    return moveAccuracy
                }
            }
            else return ""
        },

        sleep(ms) {
            return new Promise((res) => setTimeout(res, ms))
        },

        type_effectiveness(pkmnData, moveNumber, enemyData) { //pkmnData = team[0] etc
            if (this.typeCalcs == true) {
                const move_data_array = Object.values(this.g1MoveData);
                var move_name          = pkmnData[moveNumber].value
                
                if (move_name == null) { return "" } //stop the function if there is no move in that slot
                
                var move_type          = move_data_array.find(x => x.Move.toLowerCase() == move_name.toLowerCase()).Type
                var move_info          = this.typeData.find(x => x.moveType === move_type)
                var move_power         = this.movePower(move_name)
                var move_category      = move_data_array.find(x => x.Move.toLowerCase() == move_name.toLowerCase()).Category
                var attacker_type1     = pkmnData.type1.value
                var attacker_type2     = pkmnData.type2.value
                var defender_type1     = enemyData.type1.value
                var defender_type2     = enemyData.type2.value
                var multiplier_stab    = 1
                var multiplier_type1   = move_info[defender_type1]
                var multiplier_type2   = 1
                var screen_reflect     = 1
                var screen_lightscreen = 1
                
                //update variables
                if (move_type == attacker_type1 || move_type == attacker_type2)                { multiplier_stab = 1.5 }
                if (defender_type1 != defender_type2)                                          { multiplier_type2 = this.typeData.find(x => x.moveType === move_type)[defender_type2] }
                if (move_type == "Normal" || move_type == "Fighting" || move_type == "Flying" || move_type == "Bug" || move_type == "Poison" || move_type == "Ghost" || move_type == "Ground" || move_type == "Rock" || move_type == "Steel") {
                    move_category = "Physical" }
                if (move_type == "Fire" || move_type == "Water" || move_type == "Grass" || move_type == "Electric" || move_type == "Psychic" || move_type == "Ice" || move_type == "Dragon" || move_type == "Dark") {
                    move_category = "Special" }
                if (enemyData.effects.reflect.value == true && move_category == "Physical")    { screen_reflect = 0.5 }
                if (enemyData.effects.lightScreen.value == true && move_category == "Special") { screen_lightscreen = 0.5 }

                //return if further updates aren't required
                if (move_power == "-")                { return move_power } //returns "-" if the move has no power
                if (this.state != `Battle`) { return Math.floor(move_power * multiplier_stab) } //returns the move's base power if not in battle

                //calculate the move's effective power
                return Math.floor(move_power * multiplier_stab * multiplier_type1 * multiplier_type2 * screen_reflect * screen_lightscreen)
            }
            else { return this.movePower(pkmnData[moveNumber].value) }
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
        
        //prevent windows scaling from affecting the programs dimensions
        document.body.style.scale = 1 / window.devicePixelRatio

        this.starterName = MyStorage.currentStarter ?? "Venomoth"
        this.updateTime()
        this.load_all_settings()
        // retro.fastForward()

        if (this.playerResets.toString().length == 1) {
            document.getElementById("reset_counter").style.fontSize = "75px"
        }
        if (this.playerResets.toString().length == 3) {
            document.getElementById("reset_counter").style.fontSize = "54px"
        }
        if (this.playerResets.toString().length == 4) {
            document.getElementById("reset_counter").style.fontSize = "40px"
        }

        //image transition
        await transition(t => {
            // this part gets called at every frame of the browser
            // the variable t starts at 0 and advances to 1
            }, 500)

        this.mapper.properties.player.team[0].species.change(async (newValue, oldValue) => {
            //transition between pokemon art
            const newSpecies = newValue.species.value
            const oldSpecies = oldValue.species.value
            console.log(newSpecies, oldSpecies)

            const newSpeciesParameters = MyStorage[newSpecies] ?? { imageXOffset: 0, imageYOffset: 0, imageScale: 1, imageFlip: false }
            const oldSpeciesParameters = MyStorage[oldSpecies] ?? { imageXOffset: 0, imageYOffset: 0, imageScale: 1, imageFlip: false }

            this.$refs.old_pokemon_art.src = `images/pokemon/${oldSpecies}.png`
            this.$refs.old_pokemon_art.style.transform = `scale(${oldSpeciesParameters.imageScale}) ${oldSpeciesParameters.imageFlip ? 'rotateY(180deg)' : ''} translate(${oldSpeciesParameters.imageXOffset}px, ${-oldSpeciesParameters.imageYOffset}px)`
            this.$refs.old_pokemon_art.style.opacity = 1
            
            this.$refs.pokemon_art.src = `images/pokemon/${newSpecies}.png`
            this.$refs.pokemon_art.style.transform = `scale(${newSpeciesParameters.imageScale}) ${newSpeciesParameters.imageFlip ? 'rotateY(180deg)' : ''} translate(${newSpeciesParameters.imageXOffset}px, ${-newSpeciesParameters.imageYOffset}px)`
            this.$refs.pokemon_art.style.opacity = 0
            
            await transition((t) => {
                this.$refs.old_pokemon_art.style.opacity = 1 - t
                this.$refs.pokemon_art.style.opacity = t
            }, 500)
            
            this.$refs.old_pokemon_art.src = ""
        })
        

        // reset tracking
        this.mapper.properties.player.playerId.change((newProp, oldProp) => {
            if (newProp.value == 0 && oldProp.value > 0 && this.game_over == false) {
                this.blackout = false;
                this.playerResets++;
            } 
        })
        this.mapper.properties.player.playerId.change((newProp) => {
            if (newProp.value > 0 && this.game_over == false) {
                if (newProp.value != this.playerId) {
                    this.playerResets = 0;
                    this.blackout_counter = 0;
                    this.attempt_number++;
                    this.most_recent_move = "";
                    MyStorage["attempt_number"] = this.attempt_number;
                    // console.log(`Attempt ${this.attempt_number}`)
                    this.startTime();
                    this.playerId = newProp.value;
                }
            }
        })
        this.mapper.properties.events.beatChampion.change((newProp) => {
            if (newProp.value == true) {
                this.game_over = true;
            }
        })
        this.mapper.properties.player.name.change((newProp) => {
            if (this.game_over == true && newProp.value == "NINTEN") {
                this.game_over = false;
            }
        })
        
        //*autosplitter
        //log the start of a battle
        this.mapper.properties.battle.type.change((newProp) => {
            var log_start = (x) => console.log(`Autosplitter: Battle Started - Tracked Battle: ${this.mapper.properties.battle.trainer.class.value} started at ${this.timer_formatted_time[0]}${this.timer_formatted_time[1]} (Gametime: ${this.gametimeSplit})`)
            if (newProp.value == "Trainer") {
                this.battle_start = Date.now()
                log_start()
            }
        });

        //write to file at the end of a key battle
        this.mapper.properties.battle.lowHealthAlarm.change((prop) => {
            d = new Date()
            battle_end = Date.now()
            var log_end = (x) => console.log(`Autosplitter: Battle Ended - Split: ${this.mapper.properties.battle.trainer.class.value} at ${this.timer_formatted_time[0]}${this.timer_formatted_time[1]} (Gametime: ${this.gametimeSplit})`)

            //data to be collected with the autosplitter
            let date_string = (d.getMonth() + 1) + "-" + d.getDate().toString().padStart(2, "0")
            let time_string = d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0") + ":" + d.getSeconds().toString().padStart(2, "0")
            let player_name = this.playerNameChoice
            let pokemon = this.starterName
            let trainer_name = this.format_trainer_name(this.mapper.properties.battle.trainer.class.value, this.mapper.properties.battle.trainer.number.value)
            let trainer_id = this.mapper.properties.battle.trainer.number.value
            let location = this.mapper.properties.overworld.map.value
            let total_pokemon = this.mapper.properties.battle.trainer.totalPokemon
            let real_time_total = this.timer_formatted_time[0].toString() + this.timer_formatted_time[1].toString()
            let real_time_hmmss = this.timer_formatted_time[0].toString()
            let real_time_file_label = this.timer_formatted_time[2].toString()
            let resets = this.playerResets.toString()
            let blackouts = this.blackout_counter.toString()
            let level = this.mapper.properties.player.team[0].level.value.toString()
            let game_time = this.gametimeSplit.toString()
            let battle_duration = (battle_end - this.battle_start)/1000 
            let move1 = this.mapper.properties.player.team[0].move1.value
            let move2 = this.mapper.properties.player.team[0].move2.value
            let move3 = this.mapper.properties.player.team[0].move3.value
            let move4 = this.mapper.properties.player.team[0].move4.value
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

            let simple_data = [player_name, pokemon, trainer_name, real_time_hmmss, resets, blackouts, level, game_time, battle_duration, move1, move2, move3, move4 ]
            let full_data = [date_string, time_string, player_name, pokemon, trainer_name, trainer_id, location, total_pokemon, real_time_total, real_time_hmmss, real_time_file_label, resets, blackouts, level, game_time, battle_duration, move1, move2, move3, move4, saves, steps, bonks, trainerBattles, wildBattles, battleTurns, playerTurns, enemyTurns, itemsInBag, money, rivalTeam]
            let simple_data_str = simple_data.join(",") + "\n";
            let full_data_str = full_data.join(",") + "\n";

            var write_simple_split_data = (x) => {
                log_end()
                this.split_data.push(simple_data)
                logToFileSimpleSplits(simple_data_str, this.attempt_number, this.starterName)
            }
            var write_full_split_data = (x) => {
                log_end()
                logToFileFullSplits(full_data_str, this.attempt_number, this.starterName)
            }
            var end_run = (x) => {
                this.stopTime()
                log_end()
                this.split_data.push(simple_data)
                logToFileSimpleSplits(simple_data_str, this.attempt_number, this.starterName)
                logToFileFullSplits(full_data_str, this.attempt_number, this.starterName)
            }

            if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "RIVAL1")    { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "RIVAL2")    { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "BROCK" )    { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "MISTY" )    { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "LT.SURGE" ) { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "ERIKA" )    { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "KOGA" )     { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "SABRINA" )  { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "BLAINE" )   { write_simple_split_data() }
            // else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "GIOVANNI" && this.mapper.properties.battle.trainer.number.value == 2) { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "GIOVANNI" && this.mapper.properties.battle.trainer.number.value == 3) { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "LORELEI" )  { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "BRUNO" )    { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "AGATHA" )   { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "LANCE" )    { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "ROCKET" && this.mapper.properties.battle.trainer.number.value == 5)   { write_simple_split_data() }
            else if (prop.value == "Disabled" && this.mapper.properties.battle.trainer.class.value == "RIVAL3") { end_run() }
            if (prop.value == "Disabled" && this.mapper.properties.battle.type.value == "Trainer") { write_full_split_data() }
        }); 
        
        //*blackout tracking
        //track when the player has a blackout
        this.mapper.properties.player.team[0].hp.change((newProp, oldProp) => {
            if (newProp.value > 0 && this.blackout == true) {
                this.blackout = false;
                this.blackout_counter++;
            }
            if (newProp.value == 0 && this.state == `Battle`) {
                this.blackout = true;
                this.blackout_counter++;
            }
            if (this.state == `Base Stats`) {
                this.blackout = false;
            }
        })
        this.mapper.properties.player.team[0].hp.change((newProp) => {

        });

        // Encounters (set initial value)
        if (this.route1 == false && this.mapper.properties.overworld.map.value == "Route 1") {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.viridianForest == false && this.mapper.properties.overworld.map.value == "Viridian Forest") {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.viridian_forest == "Level" && this.mapper.properties.player.team[0].level.value >= this.goal_level && this.mapper.properties.player.team[1].species.value == "Pidgey") {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.viridian_forest == "Speed" && this.mapper.properties.player.team[0].speed.value >= this.goal_speed && this.mapper.properties.player.team[1].species.value == "Pidgey") {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.viridian_forest == "Pidgey" && this.mapper.properties.player.team[1].species.value == "Pidgey") {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.route3 == false && this.mapper.properties.overworld.map.value == "Route 3") {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.mtMoon == false && (this.mapper.properties.overworld.map.value == "Mt Moon - 1" || this.mapper.properties.overworld.map.value == "Mt Moon - 2" || this.mapper.properties.overworld.map.value == "Mt Moon - 3")) {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.route6 == false && this.mapper.properties.overworld.map.value == "Route 6") {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.rockTunnel == false && (this.mapper.properties.overworld.map.value == "Rock Tunnel - 1" || this.mapper.properties.overworld.map.value == "Rock Tunnel")) {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.pokemonTower == false && (this.mapper.properties.overworld.map.value == "Pokemon Tower - 2F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 3F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 4F"
        || this.mapper.properties.overworld.map.value == "Pokemon Tower - 5F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 6F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 7F")) {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.safariZone == false  && (this.mapper.properties.overworld.map.value == "Safari Zone (East)" && this.mapper.properties.overworld.map.value == "Safari Zone (West)" && this.mapper.properties.overworld.map.value == "Safari Zone (Center)" && this.mapper.properties.overworld.map.value == "Safari Zone (North)")) {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.mansion == false && this.mapper.properties.overworld.map.value == "Cinnabar Mansion") {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.route21 == false && this.mapper.properties.overworld.map.value == "Route 21") {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.route22 == false && this.mapper.properties.overworld.map.value == "Route 22") {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.victoryRoad == false && this.mapper.properties.overworld.map.value == "Victory Road") {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }

        //Set value on map change
        this.mapper.properties.overworld.encounterRate.change(async (newProp) => {
            if (this.route1 == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Route 1") {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.route3 == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Route 3") {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.route6 == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Route 6") {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.viridian_forest == "Level" && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Viridian Forest" && this.mapper.properties.player.team[0].level.value >= this.goal_level && this.mapper.properties.player.team[1].species.value == "Pidgey") {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.viridian_forest == "Speed" && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Viridian Forest" && this.mapper.properties.player.team[0].speed.value >= this.goal_speed && this.mapper.properties.player.team[1].species.value == "Pidgey") {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.viridian_forest == "Pidgey" && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Viridian Forest") {
                if (this.mapper.properties.player.team[1].species.value == "Pidgey") {
                    this.mapper.properties.overworld.encounterRate.set(0, false) 
                }
                else if (this.mapper.properties.player.team[1].species.value == undefined) {
                    const viridianForestPidgey = 0x24
                    const viridianForestEncounterRate = 0x19
                    const pidgeyLevelFour = 0x04
                    const pidgeyLevelSix = 0x06
                    const pidgeyLevelEight = 0x08
                    await Promise.all([
                        await this.mapper.properties.overworld.encounters.common[0].level.setBytes([pidgeyLevelFour], false),
                        await this.mapper.properties.overworld.encounters.common[0].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.common[1].level.setBytes([pidgeyLevelFour], false),
                        await this.mapper.properties.overworld.encounters.common[1].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.common[2].level.setBytes([pidgeyLevelFour], false),
                        await this.mapper.properties.overworld.encounters.common[2].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.common[3].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.common[3].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.uncommon[0].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.uncommon[0].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.uncommon[1].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.uncommon[1].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.uncommon[2].level.setBytes([pidgeyLevelEight], false),
                        await this.mapper.properties.overworld.encounters.uncommon[2].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.uncommon[3].level.setBytes([pidgeyLevelEight], false),
                        await this.mapper.properties.overworld.encounters.uncommon[3].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounterRate.setBytes([viridianForestEncounterRate], false),
                    ])  
                }
            }
            // if (this.viridianForest == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Viridian Forest") {
            //     this.mapper.properties.overworld.encounterRate.set(0, false) 
            // }
            if (this.rockTunnel == false && newProp.value > 0 && (this.mapper.properties.overworld.map.value == "Rock Tunnel - 1" || this.mapper.properties.overworld.map.value == "Rock Tunnel")) {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.pokemonTower == false && newProp.value > 0 && (this.mapper.properties.overworld.map.value == "Pokemon Tower - 2F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 3F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 4F"
            || this.mapper.properties.overworld.map.value == "Pokemon Tower - 5F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 6F" || this.mapper.properties.overworld.map.value == "Pokemon Tower - 7F")) {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.safariZone == false && newProp.value > 0 && (this.mapper.properties.overworld.map.value == "Safari Zone (East)" || this.mapper.properties.overworld.map.value == "Safari Zone (West)" || this.mapper.properties.overworld.map.value == "Safari Zone (Center)" || this.mapper.properties.overworld.map.value == "Safari Zone (North)")) {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.mtMoon == false && newProp.value > 0 && (this.mapper.properties.overworld.map.value == "Mt Moon - 1" || this.mapper.properties.overworld.map.value == "Mt Moon - 2" || this.mapper.properties.overworld.map.value == "Mt Moon - 3")) {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.mansion == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Cinnabar Mansion") {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.route21 == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Route 21") {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.route22 == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Route 22") {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.victoryRoad == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Victory Road") {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
        });

        this.mapper.properties.battle.type.change(async (newProp) => {
            if (this.viridian_forest == "Level" && this.mapper.properties.overworld.map.value == "Viridian Forest" && this.mapper.properties.player.team[0].level.value >= this.goal_level && this.mapper.properties.player.team[1].species.value == "Pidgey") {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.viridian_forest == "Speed" && this.mapper.properties.overworld.map.value == "Viridian Forest" && this.mapper.properties.player.team[0].speed.value >= this.goal_speed && this.mapper.properties.player.team[1].species.value == "Pidgey") {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.viridian_forest == "Pidgey" && this.mapper.properties.overworld.map.value == "Viridian Forest") {
                if (this.mapper.properties.player.team[1].species.value == "Pidgey") {
                    this.mapper.properties.overworld.encounterRate.set(0, false) 
                }
                else if (this.mapper.properties.player.team[1].species.value == undefined) {
                    const viridianForestPidgey = 0x24
                    const viridianForestEncounterRate = 0x19
                    const pidgeyLevelFour = 0x04
                    const pidgeyLevelSix = 0x06
                    const pidgeyLevelEight = 0x08
                    await Promise.all([
                        await this.mapper.properties.overworld.encounters.common[0].level.setBytes([pidgeyLevelFour], false),
                        await this.mapper.properties.overworld.encounters.common[0].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.common[1].level.setBytes([pidgeyLevelFour], false),
                        await this.mapper.properties.overworld.encounters.common[1].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.common[2].level.setBytes([pidgeyLevelFour], false),
                        await this.mapper.properties.overworld.encounters.common[2].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.common[3].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.common[3].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.uncommon[0].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.uncommon[0].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.uncommon[1].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.uncommon[1].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.uncommon[2].level.setBytes([pidgeyLevelEight], false),
                        await this.mapper.properties.overworld.encounters.uncommon[2].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.uncommon[3].level.setBytes([pidgeyLevelEight], false),
                        await this.mapper.properties.overworld.encounters.uncommon[3].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounterRate.setBytes([viridianForestEncounterRate], false),
                    ])  
                }
            }
        });

        this.mapper.properties.player.team[1].species.change((newProp) => {
            if (this.mapper.properties.overworld.map.value == "Viridian Forest") {
                if (this.viridian_forest == "Level" && this.mapper.properties.player.team[0].level.value >= this.goal_level && newProp.value == "Pidgey") {
                    this.mapper.properties.overworld.encounterRate.set(0, false) 
                }
                else if (this.viridian_forest == "Speed" && this.mapper.properties.player.team[0].speed.value >= this.goal_speed && newProp.value == "Pidgey") {
                    this.mapper.properties.overworld.encounterRate.set(0, false) 
                }
                else if (this.viridian_forest == "Pidgey" && newProp.value == "Pidgey") {
                    this.mapper.properties.overworld.encounterRate.set(0, false) 
                }
            }
        });

        this.mapper.properties.overworld.map.change(async (newProp) => {
            if (this.rockTunnel == false && this.mapper.properties.overworld.encounterRate.value > 0 && (this.mapper.properties.overworld.map.value == "Rock Tunnel - 1" || this.mapper.properties.overworld.map.value == "Rock Tunnel")) {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
            }
            if (this.victoryRoad == false && this.mapper.properties.overworld.encounterRate.value > 0 && this.mapper.properties.overworld.map.value == "Victory Road" ) {
                this.mapper.properties.overworld.encounterRate.set(0, false) 
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

        // SETTING THE STARTER POKEMON'S STATS ----------------------------------------------------------------------------------------------//
        const setStartingStats = async () => {
            const pkmn = this.pokemon(this.starterName) // slot 1 species
            const perfectDVs = 0xff // desired DV value
            var dv = [15,15,15,15,15]
            var dvHex = [0xff,0xff,0xff,0xff,0xff]
            if (this.dvSetting == "Random") { return }
            if (this.dvSetting == "Min") { 
                dv = [0,0,0,0,0]
                dvHex = [0x00,0x00,0x00,0x00,0x00]
            }
            if (this.dvSetting == "NPC") { 
                dv = [8,9,8,8,8]
                dvHex = [0x88,0x98,0x98,0x88,0x88]
            }
            if (this.dvSetting == "Max with Min Atk") { 
                dv = [15,1,15,15,15]
                dvHex = [0xff,0x1f,0x1f,0xff,0xff]
            }

            //calculates the Pokemon's starting stats with the desired DVs
            hitpoints = Math.floor((((this.pokemon(this.starterName).base_hp + dv[0]) * 2 * 5) / 100) + 10 + 5)
            attack = Math.floor((((this.pokemon(this.starterName).base_atk + dv[1]) * 2 * 5) / 100) + 5) 
            defense = Math.floor((((this.pokemon(this.starterName).base_def + dv[2]) * 2 * 5) / 100) + 5)
            special = Math.floor((((this.pokemon(this.starterName).base_spc + dv[4]) * 2 * 5) / 100) + 5)
            speed = Math.floor((((this.pokemon(this.starterName).base_spd + dv[3]) * 2 * 5) / 100) + 5)
            //only recalculate stats when DVs change if the player is in Oak's Lab, at level 5, with exactly 1 Pokemon
            if (this.mapper.properties.overworld.map.value == "Pallet Town - Oak's Lab" && this.mapper.properties.player.team[0].level.value == 5 && this.mapper.properties.player.teamCount.value == 1) {
                await Promise.all([
                    await this.mapper.properties.player.team[0].dvAttack.setBytes([dvHex[1]], false), //Set DVs perfect and freeze them
                    await this.mapper.properties.player.team[0].dvDefense.setBytes([dvHex[2]], false),
                    await this.mapper.properties.player.team[0].dvSpeed.setBytes([dvHex[3]], false),
                    await this.mapper.properties.player.team[0].dvSpecial.setBytes([dvHex[4]], false),
                    await this.mapper.properties.player.team[0].hp.setBytes([0x00, hitpoints], false), //Apply stat recalculation (don't freeze)
                    await this.mapper.properties.player.team[0].maxHp.setBytes([0x00, hitpoints], false),
                    await this.mapper.properties.player.team[0].attack.setBytes([0x00, attack], false), 
                    await this.mapper.properties.player.team[0].defense.setBytes([0x00, defense], false),
                    await this.mapper.properties.player.team[0].special.setBytes([0x00, special], false),
                    await this.mapper.properties.player.team[0].speed.setBytes([0x00, speed], false),
                ])
            }
        }

        // SETTING THE STARTER POKEMON'S STATS ----------------------------------------------------------------------------------------------//
        const optionsSet = async () => {
            const regularOptions = 0xC1
            const championOptions = 0x41
            if (this.options == true) {
                if (this.mapper.properties.overworld.map.bytes === 0x78)
                await Promise.all([
                    await this.mapper.properties.options.soloChallenge.setBytes([championOptions]),
                ])
            else
                await Promise.all([
                    await this.mapper.properties.options.soloChallenge.setBytes([regularOptions]),
                ])
            }
        }
        // SETTING THE STARTER POKEMON'S STATS ----------------------------------------------------------------------------------------------//
        const trashCans = async () => {
            const solved = 0x03 //0x03 finds first can and solves the puzzle, leaves all trainers battlable
            if (this.mapper.properties.events.trashCanPuzzle.bytes < 3 && this.trashCans == true) //check to see if the puzzle is unsolved
                await Promise.all([
                    await this.mapper.properties.events.trashCanPuzzle.setBytes([solved], false), //don't freeze this property
                ])
        }
        
        //Move info popups
        this.mapper.properties.player.team[0].move1.change(async (newProp, oldProp) => {
           if (newProp.value) { this.most_recent_move = newProp.value }
        });
        this.mapper.properties.player.team[0].move2.change(async (newProp, oldProp) => {
            if (newProp.value) { this.most_recent_move = newProp.value }
        });
        this.mapper.properties.player.team[0].move3.change(async (newProp, oldProp) => {
            if (newProp.value) { this.most_recent_move = newProp.value }
        });
        this.mapper.properties.player.team[0].move4.change(async (newProp, oldProp) => {
            if (newProp.value) { this.most_recent_move = newProp.value }
        });


        //Recalculate starting stats when the DVs in slot 1 change (when you receive your starter)
        this.mapper.properties.player.team[0].level.change(async (x) => { await setStartingStats() })
        this.mapper.properties.player.team[0].dvAttack.change(async (x) => { await setStartingStats() })
        this.mapper.properties.player.team[0].dvDefense.change(async (x) => { await setStartingStats() })
        this.mapper.properties.player.team[0].dvSpeed.change(async (x) => { await setStartingStats() })
        this.mapper.properties.player.team[0].dvSpecial.change(async (x) => { await setStartingStats() })

        //Whenever the player moves to a different map
        this.mapper.properties.overworld.map.change(async (x) => {
            await optionsSet() //Set options to Fast Text, No Animations, Set Battle (Except during the champion fight)
            await trashCans() //Solve the trash can puzzle if it isn't already solved
            if (this.rockTunnelDarkness == true) {
                await this.mapper.properties.overworld.mapData.palette.set(0, false)
            }
        })

        //the Pokemon species and then it changes, update the sprite
        this.mapper.properties.player.team[0].species.change(async (x) => {
            if (x.value == undefined) { this.load_pokemon_sprite_settings(this.starterName) }
            this.load_pokemon_sprite_settings(x.value)
        })

        this.load_pokemon_sprite_settings(this.s1dynamicReset.species.value)

        //EXP BAR
        var species = this.s1dynamicReset.species.value;
        var growthRate = this.g1PokemonData[species].growth_rate
        var expStats = this.calcExpStats(growthRate, this.mapper.properties.player.team[0].expPoints.value);
        this.$refs.expBar.style.width = (expStats.percent * 100) + "%";
        this.prevSpecies = species
        this.oldExpValue = this.mapper.properties.player.team[0].expPoints.value
        this.mapper.properties.player.team[0].expPoints.change(async (newProp, oldProp) => {
            if (this.mapper.properties.player.team[0].level.value == 100) {
                this.$refs.expBar.style.width = "0%";
                return
            }
            if (newProp.value < this.oldExpValue) {
                this.$refs.expBar.style.transition = null;
            }
            if (this.expBarAnimation == true) {
                const currSpecies = this.s1dynamicReset.species.value;
                const growthRate = this.g1PokemonData[currSpecies].growth_rate
                const oldExpStats = this.calcExpStats(growthRate, this.oldExpValue);
                const newExpStats = this.calcExpStats(growthRate, newProp.value);
                const animationMaxDuration = 600
                if (this.oldExpValue == newProp.value) { 
                    return 
                }
                if (this.state == `Overworld` || this.state == "Base Stats") {
                    this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                }
                else if (this.prevSpecies != currSpecies) {
                    this.prevSpecies = currSpecies; 
                    this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                } 
                else {
                    if (oldExpStats.level == newExpStats.level) {
                        var diffExp = newExpStats.percent - oldExpStats.percent
                        var animationDuration = Math.ceil(diffExp * animationMaxDuration)
                        this.$refs.expBar.style.transition = `width ${animationDuration}ms ease-in-out`;
                        this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                        await this.sleep(animationDuration + 50);
                    } else {
                        var diffExp1 = 1 - oldExpStats.percent
                        var animationDuration1 = Math.ceil(diffExp1 * animationMaxDuration)
                        var diffExp2 = newExpStats.percent
                        var animationDuration2 = Math.ceil(diffExp2 * animationMaxDuration)
                        this.$refs.expBar.style.transition = `width ${animationDuration1}ms ease-in`;
                        this.$refs.expBar.style.width = "100%";
                        await this.sleep(animationDuration1 + 50);
                        this.$refs.expBar.style.transition = null;
                        this.$refs.expBar.style.width = "0%";
                        await this.sleep(50);
                        this.$refs.expBar.style.transition = `width ${animationDuration2}ms ease-out`;
                        this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                        await this.sleep(animationDuration2 + 50);
                    }
                }
                this.$refs.expBar.style.transition = null;
                this.oldExpValue = newProp.value
            }
        })

        keyhook.registerShortCut('F14', async () => {
            const now = Date.now();
            if (now - this.lastExecuted >= 150) { // 500 milliseconds = half a second
                this.key_F14 = !this.key_F14;
                this.lastExecuted = Date.now();
            }
        });
        keyhook.registerShortCut('F13', async () => {
            const now = Date.now();
            if (now - this.lastExecuted >= 150) { // 500 milliseconds = half a second
                // Cycle through the values
                this.key_F13 = this.cycleValues_rightDisplay[this.cycleIndex_rightDisplay];
                this.cycleIndex_rightDisplay = (this.cycleIndex_rightDisplay + 1) % this.cycleValues_rightDisplay.length;
                this.set_setting_prop("this.cycleIndex_rightDisplay", this.cycleIndex_rightDisplay)
                this.lastExecuted = Date.now();
            }
        });
        keyhook.registerShortCut('F15', async () => {
            const now = Date.now();
            if (now - this.lastExecuted >= 150) { // 500 milliseconds = half a second
                // Cycle through the values
                this.key_F15 = this.cycleValues_stats[this.cycleIndex_stats];
                this.cycleIndex_stats = (this.cycleIndex_stats + 1) % this.cycleValues_stats.length;
                this.set_setting_prop("this.cycleIndex_stats", this.cycleIndex_stats)
                this.lastExecuted = Date.now();
            }
        });
        keyhook.registerShortCut('F16', async () => {
            const now = Date.now();
            if (now - this.lastExecuted >= 150) { // 500 milliseconds = half a second
                // Cycle through the values
                this.key_F16 = this.cycleValues_failures[this.cycleIndex_failures];
                this.cycleIndex_failures = (this.cycleIndex_failures + 1) % this.cycleValues_failures.length;
                this.set_setting_prop("this.cycleIndex_failures", this.cycleIndex_failures)
                this.lastExecuted = Date.now();
            }
        });
        keyhook.registerShortCut('F17', async () => {
            const now = Date.now();
            if (now - this.lastExecuted >= 150) { // 500 milliseconds = half a second
                // Cycle through the values
                this.key_F17 = this.cycleValues_screens[this.cycleIndex_screens];
                this.cycleIndex_screens = (this.cycleIndex_screens + 1) % this.cycleValues_screens.length;
                this.set_setting_prop("this.cycleIndex_screens", this.cycleIndex_screens)
                this.lastExecuted = Date.now();
            }
        });
    },
}).mount('#app')