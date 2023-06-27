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
            gametimeDisplay:            true, //shows the options menu when set to true
            inventory:                  true, //uses inventory when in the department store & marts
            battleGraphic:              true, //uses battle graphic with enemy moveset & stats
            showAllTrainers:            true, //when false only shows gym leaders and rivals, when true shows all enemy trainers
            expBarAnimation:            true,
            showSpecialTrainerGraphics: true, //shows drawn art for defined trainers
            battlePopUps:               true, //shows reflect, lightscreen, safeguard, weather, accuracy, evasion, etc
            typeCalcs:                  true, //calculates effective power based on the pokemon in battle
            showCritMultiplierInEP:     true, //shows high crit ratio moves with adjusted power if the move always scores a crit

            help_menus: "Settings",

            //ENCOUNTERS ---------------------------------------------------------------------------------------//
            route1:         true,
            viridianForest: true,
            route3:         true,
            mtMoon:         true,
            route6:         true,
            safariZone:     true,
            mansion:        true,
            route21:        true,
            route22:        true,

            //DATA ---------------------------------------------------------------------------------------------//
            g1MoveData:         g1MoveData,
            g1PokemonData:      g1PokemonData,
            g1YellowTrainers:   g1YellowTrainers,
            g1RedBlueTrainers:  g1RedBlueTrainers,
            typeData:           typeData,
            stageModifiersData: stageModifiersData,
            tmhmMapping:        tmhmMapping,
            
            //VARS ---------------------------------------------------------------------------------------------//
            pkmnMoves:       ["move1","move2","move3","move4"],
            pkmnSlots:       [0, 1, 2, 3, 4, 5],
            fieldEffects:    ["reflect","lightScreen","bide","thrash","multiHit","flinch","charging","multiTurn","invulnerable","confusion","xAccuracy","mist","focusEnergy","hasSubstitute","recharge","rage","leechSeeded","toxic","transformed"],
            accuracyEvasion: ["accuracy", "evasion"],
            g1stateVariable: "Base Stats",
            prevSpecies:     undefined,
            enemyModColour:  ["0", "background: #d84444;"],
            enemyState:      "Not In Battle", //"Pokemon", "Fainted"

            //resets
            playerId: 0,
            playerName: "NINTEN",
            resetCatcher: "NINTEN",
            playerResets: 0,
            resetCounter: true,

            //Pokemon settings for local storage
            overlay_color:   "#000000",
            imageXOffset: 0,
            imageYOffset: 0,
            imageScale: 1,
            imageFlip: false,
        }
    },

    watch: {
        //Encounter Checkboxes
        route1(newProp) {
            if (newProp == false && this.mapper.properties.overworld.map.value == "Route 1") { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
        },   
        viridianForest(newProp) {
            if (newProp == false && this.mapper.properties.overworld.map.value == "Viridian Forest") { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
        },   
        route3(newProp) {
            if (newProp == false && this.mapper.properties.overworld.map.value == "Route 3") { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
        },            
        mtMoon(newProp) {
            if (newProp == false && (newProp.value == "Mt Moon - 1" || newProp.value == "Mt Moon - 2" || newProp.value == "Mt Moon - 3")) { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
        },            
        route6(newProp) {
            if (newProp == false && this.mapper.properties.overworld.map.value == "Route 6") { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
        },            
        safariZone(newProp) {
            if (newProp == false && (newProp.value == "Safari Zone (East)" || newProp.value == "Safari Zone (West)" || newProp.value == "Safari Zone (Center)" || newProp.value == "Safari Zone (North)")) { this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) }
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
        starterName(newProp) {
            MyStorage.currentStarter = newProp
        },
        playerId() {
            this.playerResets = 0;
        },          
    },

    computed: {
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
        gametime_frames() {
            f = this.mapper.properties.gameTime.frames
            if (f < 10) f = "0" + f.toString();
            return f
        },
        currentTrainer() {
            if (this.mapper.meta.gameName == "Pokemon Yellow") { return g1YellowTrainers[this.mapper.properties.battle.trainer.class.value + " " + this.mapper.properties.battle.trainer.number.value] }
            else if (this.mapper.meta.gameName == "Pokemon Red and Blue") { return g1RedBlueTrainers[this.mapper.properties.battle.trainer.class.value + " " + this.mapper.properties.battle.trainer.number.value] }
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
            if (this.g1stateVariable == `Battle`) {
                return this.mapper?.properties?.battle?.yourPokemon
            }
            else {
                return this.mapper?.properties?.player?.team[0]
            }
        },
        s1dynamicReset() {
            if (this.g1stateVariable == `Battle`) {
                return this.mapper?.properties?.battle?.yourPokemon
            }
            else if (this.g1stateVariable == `Base Stats` || this.mapper?.properties?.player?.team[0].species.value == null) {
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
            if (this.map.overworld.map.value == "Pallet Town - Oak's Lab" || this.g1stateVariable == "Base Stats") {
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
          
            if (validStates.includes(this.g1stateVariable) &&
                (trainerClasses.includes(this.batt.trainer.class.value) ||
                 this.g1stateVariable != "From Battle")) {
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
            return this.g1PokemonData[this.starterName].growth_rate
        },
        getStarterType() {
            var type1 = this.g1PokemonData[this.starterName].type1.toLowerCase()
            var type2 = this.g1PokemonData[this.starterName].type2.toLowerCase()
            return { "type1": type1, "type2": type2 }
        },
    },

    //FUNCTIONS -----------------------------------------------------------------------------------------------//
    methods: {
        //! Refactor with co-pilot
        save_all_settings() {
            this.set_setting_prop("this.route1", this.route1)
            this.set_setting_prop("this.viridianForest", this.viridianForest)
            this.set_setting_prop("this.route3", this.route3)
            this.set_setting_prop("this.mtMoon", this.mtMoon)
            this.set_setting_prop("this.route6", this.route6)
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
            // console.log(MyStorage.entries())
        },
        load_all_settings() {
            this.route1 = MyStorage["this.route1"] ?? true
            this.viridianForest = MyStorage["this.viridianForest"] ?? true
            this.route3 = MyStorage["this.route3"] ?? true
            this.mtMoon = MyStorage["this.mtMoon"] ?? true
            this.route6 = MyStorage["this.route6"] ?? true
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
        },
        //string can be: clear, increment, decrement
        resets_clear() {
            this.playerResets = 0
        },
        resets_increment() {
            this.playerResets++
        },
        resets_decrement() {
            this.playerResets--
        },
        async colorPick() {
            return new EyeDropper().open().then(res => res.sRGBHex)
        },
        async color_picker() {
            var color = await this.colorPick()
            this.set_pokemon_prop("overlay_color", color)
            this.overlay_color = color
            console.log(MyStorage.entries())
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
        first_playthrough_settings() {
            this.route1 = true
            this.viridianForest = true
            this.route3 = true
            this.mtMoon = true
            this.route6 = true
            this.safariZone = true
            this.mansion = true
            this.route21 = true
            this.route22 = true
        },
        second_playthrough_settings() {
            this.route1 = false
            this.viridianForest = true
            this.route3 = false
            this.mtMoon = false
            this.route6 = false
            this.safariZone = true
            this.mansion = true
            this.route21 = true
            this.route22 = true
        },
        save_pokemon_sprite_settings() {
            this.set_pokemon_prop("imageXOffset", this.imageXOffset)
            this.set_pokemon_prop("imageYOffset", this.imageYOffset)
            this.set_pokemon_prop("imageScale", this.imageScale)
            this.set_pokemon_prop("imageFlip", this.imageFlip)
            console.log(MyStorage.entries())
        },
        load_pokemon_sprite_settings() {
            this.imageXOffset = MyStorage[this.starterName]?.imageXOffset ?? 0
            this.imageYOffset = MyStorage[this.starterName]?.imageYOffset ?? 0
            this.imageScale = MyStorage[this.starterName]?.imageScale ?? 1
            this.imageFlip = MyStorage[this.starterName]?.imageFlip ?? false
            this.overlay_color = MyStorage[this.starterName]?.overlay_color ?? "#000000"
        },
        load_starter_pokemon_settings() {
            this.starterName = MyStorage[this.currentStarter] ?? "Venomoth"
        },
        clear_overlay_color() {
            this.set_pokemon_prop("overlay_color", "#000000")
            this.overlay_color = "#000000"
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

        //ENEMY MOD STYLING
        enemyMods(modValue) {
            if (this.g1stateVariable != "Battle") { return this.enemyModColour }
            var neutral = ["0", "background: #a1a1a1;"]
            var raised = [modValue, "background: #d84444;"]
            var lowered = [modValue, "background: #21c500"]
            if (modValue < 0) { this.enemyModColour = raised }
            if (modValue > 0) { this.enemyModColour = lowered }
            return this.enemyModColour 
        },
        enemyDynamic(activePkmn, currentSlot) {
            if (activePkmn == currentSlot && this.g1stateVariable == "Battle") {
                return this.mapper?.properties?.battle?.enemyPokemon
            }
            else { 
                return this.mapper?.properties?.battle?.trainer?.team[activePkmn]
            }
        },
        
        //Movepool Graphic
        dataSearch(dataObject, pointerValue) {
            if (!pointerValue) return ""
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
            if (type1 && this.g1stateVariable != `Base Stats`) {
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
            if (this.enemyState == "Fainted" || this.g1stateVariable == "From Battle") {
                return stat 
            }
            else if (this.enemyState == "Pokemon" || this.enemyState == "Pokemon Sent Out" || this.enemyState == "Fainting") {
                if (activePkmn == currentSlot && this.g1stateVariable == "Battle") {
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
            const gameName = this.mapper.meta.gameName;
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
              } else if (trainerName == "RIVAL2") {
                return rival2Teams[trainerNumber - 1];
              } else if (trainerName == "RIVAL3") {
                return "champion's team";
              } else {
                return trainerName.toLowerCase() + "'s team";
              }
            } else if (gameName == "Pokemon Red and Blue") {
              if (trainerName == "RIVAL1") {
                return rival1Teams[trainerNumber - 1];
              } else if (trainerName == "RIVAL2") {
                return rival2Teams[trainerNumber - 1];
              } else if (trainerName == "RIVAL3") {
                return "champion's team";
              } else {
                return trainerName.toLowerCase() + "'s team";
              }
            }
        },

        specialTrainerGraphics() {
            if (this.showSpecialTrainerGraphics) {
              const { class: trainerClass, number: trainerNumber } = this.mapper.properties.battle.trainer;
              switch (`${trainerClass}_${trainerNumber}`) {
                case "JR TRAINER F_5":
                  return "images/trainers/JR TRAINER F_5.png";
                case "YOUNGSTER_1":
                  return "images/trainers/BEN.png";
                case "POKEMANIAC_7":
                  return "images/trainers/POKEMANIAC_7.png";
                case "SUPER NERD_2":
                  return "images/trainers/FOSSIL_NERD.png";
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
                case "JR TRAINER F_3":
                  return "images/trainers/JR TRAINER F_3.png";
                case "CHANNELER_10":
                  return "images/trainers/AGATHAJR.png";
                case "RIVAL1_1":
                  return "images/trainers/RIVAL1.png";
                case "RIVAL1_2":
                  return "images/trainers/RIVAL1.png";
                case "RIVAL1_3":
                  return "images/trainers/RIVAL2.png";
                case "RIVAL2_1":
                  return "images/trainers/RIVAL2.png";
                case "BROCK":
                  return "images/trainers/BROCK.png";
                case "MISTY":
                  return "images/trainers/MISTY.png";
                case "LT.SURGE":
                  return "images/trainers/LTSURGE.png";
                case "ERIKA":
                  return "images/trainers/ERIKA.png";
                case "KOGA":
                  return "images/trainers/KOGA.png";
                case "GIOVANNI_3":
                  return "images/trainers/GIOVANNI.png";
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
                if (this.g1stateVariable == `Battle` || this.g1stateVariable == `From Battle`) {
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
                if (this.g1stateVariable != `Battle`) { return Math.floor(move_power * multiplier_stab) } //returns the move's base power if not in battle

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
        this.starterName = MyStorage.currentStarter ?? "Venomoth"
        this.load_all_settings()

        // reset tracking
        this.mapper.properties.player.playerId.change((newProp, oldProp) => {
            if (newProp.value == 0 && oldProp.value > 0) {
                this.playerResets++;
            } 
            // if (newProp.value > 0 && oldProp.value == 0 && this.mapper.properties.player.name.value == "NINTEN") {
            //     this.playerResets = 0;
            // }
            // else if (newProp.value > 0 && this.mapper.properties.player.name.value == "NINTEN" && this.mapper.properties.gameTime.minutes.value == 0) {
            //     this.playerResets = 0;
            // }
        })
        this.mapper.properties.player.playerId.change((newProp) => {
            if (newProp.value > 0) {
                if (newProp.value != this.playerId) {
                    this.playerResets = 0;
                    this.playerId = newProp.value;
                }
            }
        })

        // Encounters (set initial value)
        if (this.route1 == false && this.mapper.properties.overworld.map.value == "Route 1") {
            this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
        }
        else if (this.viridianForest == false && this.mapper.properties.overworld.map.value == "Viridian Forest") {
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

        //Set value on map change
        this.mapper.properties.overworld.encounterRate.change(async (newProp) => {
            if (this.route1 == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Route 1") {
                this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
            }
            else if (this.route3 == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Route 3") {
                this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
            }
            else if (this.route6 == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Route 6") {
                this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
            }
            if (this.viridianForest == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Viridian Forest") {
                this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
            }
            if (this.safariZone == false && newProp.value > 0 && (this.mapper.properties.overworld.map.value == "Safari Zone (East)" || this.mapper.properties.overworld.map.value == "Safari Zone (West)" || this.mapper.properties.overworld.map.value == "Safari Zone (Center)" || this.mapper.properties.overworld.map.value == "Safari Zone (North)")) {
                this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
            }
            if (this.mtMoon == false && newProp.value > 0 && (this.mapper.properties.overworld.map.value == "Mt Moon - 1" || this.mapper.properties.overworld.map.value == "Mt Moon - 2" || this.mapper.properties.overworld.map.value == "Mt Moon - 3")) {
                this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
            }
            if (this.mansion == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Cinnabar Mansion") {
                this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
            }
            if (this.route21 == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Route 21") {
                this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
            }
            if (this.route22 == false && newProp.value > 0 && this.mapper.properties.overworld.map.value == "Route 22") {
                this.mapper.properties.overworld.encounterRate.setBytes([0x00], false) 
            }
        });

        //Functions to track the game's state
        // set initial gamestate value when the layout is loaded
        if (this.mapper.properties.player.team[0].level.value == 0) 
            this.g1stateVariable = "Base Stats";
        else if (this.mapper.properties.battle.type.value == "None")
            this.g1stateVariable = "Overworld";
        else if (this.mapper.properties.battle.turnInfo.battleStart.value == 0)
            this.g1stateVariable = "To Battle";
        else if (this.mapper.properties.battle.lowHealthAlarm.value ==  "Disabled")
            this.g1stateVariable = "From Battle";
        else
            this.g1stateVariable = "Battle";

        // wait for events to change the state
        this.mapper.properties.player.team[0].level.change((prop) => {
            if (prop.value == 0) {
                this.g1stateVariable = "Base Stats";
            } else if (this.g1stateVariable == "Base Stats" && this.map.overworld.map.value == "Pallet Town - Oak's Lab") {
                this.g1stateVariable = "Base Stats";
            } else if (this.g1stateVariable == "Base Stats") {
                this.g1stateVariable = "Overworld";
            }
        });
        this.mapper.properties.battle.type.change((prop) => {
            if (this.g1stateVariable == "Base Stats" && this.map.overworld.map.value == "Pallet Town - Oak's Lab") { //FIX for graphical flicker in Oak's lab
                this.g1stateVariable = "To Battle";
            }; 
            if (this.g1stateVariable == "Base Stats") return; // ignore everything if we still dont have a pokemon

            if (prop.value == "Wild" || prop.value == "Trainer") {
                this.g1stateVariable = "To Battle";
            } else if (prop.value == "None") {
                this.g1stateVariable = "Overworld";
            }
        });
        this.mapper.properties.battle.turnInfo.battleStart.change((prop) => {
            if (this.g1stateVariable == "Base Stats") return; // ignore everything if we still dont have a pokemon

            if (prop.value != 0 && this.g1stateVariable == "To Battle") {
                this.g1stateVariable = "Battle";
            }
        });
        this.mapper.properties.battle.lowHealthAlarm.change((prop) => {
            if (this.g1stateVariable == "Base Stats") return; // ignore everything if we still dont have a pokemon

            if (prop.value == "Disabled") {
                this.g1stateVariable = "From Battle";
            }
        });
        this.mapper.properties.overworld.map.change((newProp, oldProp) => {
            if (newProp == "Lance's Room" && oldProp == "Agatha's Room") { 
                this.g1stateVariable = "Overworld"
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
            if (prop.value != 0 && this.g1stateVariable == "To Battle") {
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
        })

        //EXP BAR
        var species = this.s1dynamicReset.species.value;
        var growthRate = this.g1PokemonData[species].growth_rate
        var expStats = this.calcExpStats(growthRate, this.mapper.properties.player.team[0].expPoints.value);
        this.$refs.expBar.style.width = (expStats.percent * 100) + "%";
        this.prevSpecies = species
        this.mapper.properties.player.team[0].expPoints.change(async (newProp, oldProp) => {
            if (this.expBarAnimation == true) {
                const currSpecies = this.s1dynamicReset.species.value;
                const growthRate = this.g1PokemonData[species].growth_rate
                const oldExpStats = this.calcExpStats(growthRate, oldProp.value);
                const newExpStats = this.calcExpStats(growthRate, newProp.value);
                const animationMaxDuration = 600

                if (oldProp.value == newProp.value) { return }
                if (this.g1stateVariable == `Overworld` || this.g1stateVariable == "Base Stats") {
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
            }
        })
    },
}).mount('#app')