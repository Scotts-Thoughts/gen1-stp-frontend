const app = Vue.createApp({
    //DATA & DEFINITIONS
    data() {
        return {
            ready: false,
            mapper: null,

            // USER CONFIG --------------------------------------------------------------------------------------//
            starterName:     "Pidgeotto", //string name
            overlayName:     "", // add "-yellow" or "-red" here based on the game being played (or "-type" for Venomoth's type randomizer)
            secondPlaythrough: true, //used to mitigate luck on second playthroughs
            moonEncounters: true, //true turns Mt Moon encounters off for second playthroughs
            
            developmentFeatures: true, //turn on new features
            
            pick:            true, //turns on the ability to pick your starter
            movepool:        true, //uses dynamic movepool when in the overworld & in wild battles
            inventory:       true, //uses inventory when in the department store & marts
            battleGraphic:   true, //uses battle graphic with enemy moveset & stats
            showAllTrainers: true, //when false only shows gym leaders and rivals, when true shows all enemy trainers
            trainerArt:      true, //shows custom trainer art
            expBarAnimation: true,
            showSpecialTrainerGraphics: true, //shows drawn art for defined trainers
            battlePopUps: true, //shows reflect, lightscreen, safeguard, weather, accuracy, evasion, etc
            
            typeIcons:         true, //turns on dynamic type icons
            typeCalcs:         true, //calculates effective power based on the pokemon in battle
            overlay:           true, //overrides with starter & fixed ovelay (must be new style)
            
            badgeBoostGraphics: true, //turns on opaque badge icons for boosts
            addStabBonus:       true,
            expBarToggle:       true,
            showCritMultiplierInEP: true, //shows high crit ratio moves with adjusted power if the move always scores a crit
            
            // CUSTOM STARTING MOVES
            customMoves: false, //if custom moves is turned off, custom trainer ID will be turned off as well
            randomStartingSet: false,
            customMove1: 0x96,
            customMove1pp: 0x28,
            customMove2: 0x52,
            customMove2pp: 0x0A,
            customMove3: 0x00,
            customMove3pp: 0x00,
            customMove4: 0x00,
            customMove4pp: 0x00,
            customLevel: 0x05, //set to 0x05 unless you want a different level at the start
            customTrainerID: false, //when set to true it will ensure the Pokemon receives boosted EXP; and the level is set to a custom value

            //DATA ---------------------------------------------------------------------------------------------//
            gen1data: gen1data, //base stats, typings, pokedex numbers, etc
            gen1dataGrowthMovepool: gen1dataGrowthMovepool, //contains growth rate and movepools; also constants base stats and typing but these are formatted poorly
            gen1moves: gen1moves, //moves, type, power, accuracy, pp, category, description
            typeData: typeData, //type effectiveness tables
            g1YellowTrainers: g1YellowTrainers,
            g1RedBlueTrainers: g1RedBlueTrainers,
            statusConditions: statusConditions,
            venomothStartingMoves: venomothStartingMoves,
            stageModifiersData: stageModifiersData,
            tmhmMapping: tmhmMapping,
            g1MoveData: g1MoveData,
            g1PokemonData: g1PokemonData,
            
            //LOOPS
            pkmnMoves: ["move1","move2","move3","move4"],
            pkmnSlots: [0, 1, 2, 3, 4, 5],
            boostingBadges: ["badge1", "badge3", "badge6", "badge7"],
            inventorySlots: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],
            fieldEffects: ["reflect","lightScreen","bide","thrash","multiHit","flinch","charging","multiTurn","invulnerable","confusion","xAccuracy","mist","focusEnergy","hasSubstitute","recharge","rage","leechSeeded","toxic","transformed"],
            accuracyEvasion: ["accuracy", "evasion"],

            //VARIABLES THAT TRACK IN GAME PROGRESS ------------------------------------------------------------//
            // playerId: 999,
            // routeEncounters: [],
            // route1Encounters: 0,
            // forestEncounters: 0,
            // mtmoonEncounters: 0,
            // totalEncounters:  0,
            // totalTrainers:    0,
            // centerHeals:  0,
            // resets:       0,
            // saves:        0,
            // badges:       0,
            // gamestateLogging: false,
            slotTimingFix: false,

            //VARIABLES THAT STYLE ELEMENTS
            statLabelOpacityValue: 0,
            // modColor: true,
            // modRaise: "rgb(0, 0, 0)",
            // modLower: "rgb(0, 0, 0)",
            // modDefault: "rgb(0, 0, 0)",
            // ppColor: false,
            // ppHigh: "rgb(0, 0, 0)",
            // ppMid: "rgb(114, 0, 0)",
            // ppLow: "rgb(114, 0, 0)",

            //STORING DATA
            g1stateVariable: "Base Stats",
            prevSpecies: undefined,
            splitData: [],
            enemyModColour: ["0", "background: #d84444;"],
            enemyState: "Not In Battle", //"Pokemon", "Fainted"
        }
    },
    
    computed: {
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
        starter() {
            return this.gen1data.find(x => x.Pokemon === this.starterName).dexNumber
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
    },

    //FUNCTIONS -----------------------------------------------------------------------------------------------//
    methods: {
        //MOVE NAME CAPITALIZATION
        move_name(move_string) {
            if (move_string == null) { return "" }
            move_string = move_string.toLowerCase()
            const moveMappings = {
              "vicegrip": "ViceGrip",
              "doubleslap": "DoubleSlap",
              "double-edge": "Double-Edge",
              "solarbeam": "SolarBeam",
              "extremespeed": "ExtremeSpeed",
              "dynamicpunch": "DynamicPunch",
              "thunderpunch": "ThunderPunch",
              "bubblebeam": "BubbleBeam",
              "grasswhistle": "GrassWhistle",
              "softboiled": "Softboiled",
              "sand-attack": "Sand-Attack",
              "mud-slap": "Mud-Slap",
              "featherdance": "FeatherDance",
              "poisonpowder": "PoisonPowder",
              "dragonbreath": "DragonBreath",
              "ancientpower": "AncientPower",
              "smellingsalt": "SmellingSalt",
              "selfdestruct": "Selfdestruct",
              "smokescreen": "SmokeScreen",
              "sonicboom": "SonicBoom"
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
        
        //SPLITS
        currentSplit(splitData) {
            var arrayLength = splitData.length
            var split = splitData[arrayLength]["realtime.end"]
            return this.formatDuration(split)
        },
        lastSplit(splitData) {
            var arrayLength = splitData.length
            var splitNumber = arrayLength - 1
            var split = splitData[splitNumber]["realtime.end"]
            return this.formatDuration(split)
        },
        formatDuration(x) {
            if (x.startsWith("00:")) {
                x = x.substring(3)
            }
            if (x.startsWith(0)) {
                x = x.substring(1)
            }
            x = x.substring(0, x.length-4)
            return x
        },
        split(splitName, splits) {
            console.log(splits)
            var split = splits.find(x => x.trainer_name === splitName)
            debugger
            if (split == undefined) return
            return split["realtime.end.hours"] + ":" + split["realtime.end.minutes"] + ":" + split["realtime.end.seconds"]
        },

        //AUTOMATION MOVEPOOL GRAPHIC
        dataSearch(dataObject, pointerValue) {
            if (!pointerValue) return ""
            const key = Object.keys(dataObject).find(x => x.toLowerCase() == pointerValue.toLowerCase())
            return dataObject[key] || "ERROR"
        },
        getMovepool(gen1PkmnData, moveData, tmhmMapping, species) {
            const pkmn = this.dataSearch(gen1PkmnData, species)
            if (pkmn.initial_moveset == undefined) { debugger }
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

        //DAMAGE CALCULATION
        damageCalculation(userPkmnData, targetPkmnData, move) {
            if (this.g1stateVariable == "Overworld" || this.g1stateVariable == "Base Stats") { return "" }
            if (move == null) { return "" }
            //Setup data for calculation
            var lvl = userPkmnData.level.value
            var userAttack = userPkmnData.attack.value
            var userSpecial = userPkmnData.special.value
            var userType1 = userPkmnData.type1.value
            var userType2 = userPkmnData.type2.value
            
            var targetDefense = targetPkmnData.defense.value
            var targetSpecial = targetPkmnData.special.value
            var targetMaxHp = targetPkmnData.maxHp.value
            var targetType1 = targetPkmnData.type1.value
            var targetType2 = targetPkmnData.type2.value
            var defenderScreen = undefined

            var moveData = this.gen1moves.find(x => x.Move.toLowerCase() === move.toLowerCase())
            var moveType = moveData.Type
            var movePower = moveData.Power
            var moveCategory = moveData.Category
            
            var stab = 1
            var AttackingTypeEffectiveness = this.typeData.find(x => x.moveType === moveType)
            var critical = 1
            var screens = 1

            var userOffensiveStat = undefined
            var targetDefensiveStat = undefined

            var AttackingTypeEffectiveness = this.typeData.find(x => x.moveType === moveType)
            var type1 = AttackingTypeEffectiveness[targetType1]
            var type2 = AttackingTypeEffectiveness[targetType2]

            //Check values & update modifiers
            if (moveType == userType1 || moveType == userType2) {
                stab = 1.5
            }
            if (moveCategory == "Physical") {
                userOffensiveStat = userAttack
                targetDefensiveStat = targetDefense
                if (targetPkmnData.effects?.reflect?.value) {
                    defenderScreen = targetPkmnData.effects.reflect.value
                }
                else {
                    defenderScreen = false
                } 
            }
            if (moveCategory == "Special") {
                userOffensiveStat = userSpecial
                targetDefensiveStat = targetSpecial
                if (targetPkmnData.effects?.lightScreen?.value) {
                    defenderScreen = targetPkmnData.effects.lightScreen.value
                }
                else {
                    defenderScreen = false
                } 
            }
            if (moveCategory == "Status") {
                return ""
            }
            if (defenderScreen == true) {
                screens = .5
            }
            //Run damage calculation
            part1 = Math.floor(Math.floor((2 * lvl * critical)/5 + 2) * movePower * userOffensiveStat)
            part2 = Math.floor(part1/targetDefensiveStat)
            part3 = Math.floor(part2/50) + 2
            part4 = undefined
            if (targetType1 == targetType2) {
                part4 = Math.floor(Math.floor(Math.floor(part3 * stab) * type1) * screens)
            }
            else {
                part4 = Math.floor(Math.floor(Math.floor(Math.floor(part3 * stab) * type1) * type2) * screens)
            }
            //Results to return
            damageMin = Math.floor(part4 * (217/255))
            damageMax = part4

            //UNIQUE MOVES & FIXED DAMAGE
            if (move == "GUILLOTINE") { return ["OHKO", "OHKO", 100, 100, 0, 0, move] }
            if (move == "FISSURE") { return ["OHKO", "OHKO", 100, 100, 0, 0, move] }
            if (move == "DRAGON RAGE") { 
                damageMin = 40
                damageMax = 40
            }
            if (move == "SonicBoom") { 
                damageMin = 20
                damageMax = 20
            }
            if (move == "NIGHT SHADE") { 
                damageMin = userPkmnData.level
                damageMax = userPkmnData.level
            }
            if (move == "PSYWAVE") { 
                damageMin = 1
                damageMax = Math.floor(userPkmnData.level * 1.5)
            }
            if (move == "DOUBLESLAP" || 
            move == "PIN MISSILE" || 
            move == "COMET PUNCH" || 
            move == "FURY SWIPES" || 
            move == "SPIKE CANNON" || 
            move == "BARRAGE" || 
            move == "FURY ATTACK") { 
                damageMin = damageMin * 2
                damageMax = damageMax * 5
            }
            if (move == "WRAP" || 
            move == "CLAMP" || 
            move == "FIRE SPIN" || 
            move == "BIND") { 
                damageMin = damageMin * 2
                damageMax = damageMax * 5
            }
            if (move == "BONEMERANG" || 
            move == "DOUBLE KICK" || 
            move == "TWINEEDLE") { 
                damageMin = damageMin * 2
                damageMax = damageMax * 2
            }
            if (move == "COUNTER") {
                if (this.batt.enemyMove.type.value == "Normal" || this.batt.enemyMove.type.value == "Fighting") {
                    damageMin = this.batt.attackDamage.value * 2
                    damageMax = this.batt.attackDamage.value * 2
                }
                else {
                    damageMin = 0
                    damageMax = 0
                }
            }

            minPercentage = Math.round((damageMin/targetMaxHp) * 100)
            maxPercentage = Math.round((damageMax/targetMaxHp) * 100)
            var recoilMin = 0
            var recoilMax = 0
            if (move == "TAKE DOWN" || move == "SUBMISSION" || move == "DOUBLE-EDGE") {
                recoilMin = Math.floor(damageMin * 0.25)
                recoilMax = Math.floor(damageMax * 0.25)
            }

            return [damageMin, damageMax, minPercentage, maxPercentage, recoilMin, recoilMax, move]
        },
        damageComparisonPlayer(userPkmnData, targetPkmnData) {
            var damage1 = this.damageCalculation(userPkmnData, targetPkmnData, this.batt.yourPokemon.move1.value)
            var damage2 = this.damageCalculation(userPkmnData, targetPkmnData, this.batt.yourPokemon.move2.value)
            var damage3 = this.damageCalculation(userPkmnData, targetPkmnData, this.batt.yourPokemon.move3.value)
            var damage4 = this.damageCalculation(userPkmnData, targetPkmnData, this.batt.yourPokemon.move4.value)
            var damageComparison = [damage1, damage2, damage3, damage4]
            var maxArr = [0,-1,0,0,0,0,0]
            for(var i = 0; i < damageComparison.length; i++) {
                if (!isNaN(damageComparison[i][1])) {
                    if(maxArr[1] < damageComparison[i][1]) {
                        maxArr = damageComparison[i];
                    }
                }
            }
            if (maxArr[1] == -1) {
                return [null,"No damaging move",null,null,null,null,null]
            }
            return maxArr
        },
        damageComparisonEnemy(userPkmnData, targetPkmnData, x) {
            var damage1 = this.damageCalculation(userPkmnData, targetPkmnData, this.batt.trainer.team[x].move1.value)
            var damage2 = this.damageCalculation(userPkmnData, targetPkmnData, this.batt.trainer.team[x].move2.value)
            var damage3 = this.damageCalculation(userPkmnData, targetPkmnData, this.batt.trainer.team[x].move3.value)
            var damage4 = this.damageCalculation(userPkmnData, targetPkmnData, this.batt.trainer.team[x].move4.value)
            var damageComparison = [damage1, damage2, damage3, damage4]
            var maxArr = [0,-1]
            for(var i = 0; i < damageComparison.length; i++) {
                if (!isNaN(damageComparison[i][1])) {
                    // if(maxArr = damageComparison[i][1]) {
                        //NEEDS A WAY TO MANAGE TIES
                    // }
                    if(maxArr[1] < damageComparison[i][1]) {
                        maxArr = damageComparison[i];
                    }
                }
            }
            if (maxArr[1] == -1) {
                return [null,"No damaging move",null,null,null,null,null]
            }
            return maxArr
        },
        speedComparison(playerPkmnData, enemyPkmnData) {
            const playerSpeed = playerPkmnData.speed.value;
            const enemySpeed = enemyPkmnData.speed.value;
          
            if (playerSpeed === enemySpeed) {
              return "Speed-Tie";
            }
          
            return playerSpeed > enemySpeed ? "Outspeeds" : "Outsped";
        },
        speedColouration(speedComparison, pkmnData) {
            const { hp } = pkmnData;
          
            if (hp === 0) {
              return "background-color: #dfdfdfad; opacity: .5;";
            }
          
            switch (speedComparison) {
              case "Outsped":
                return "background-color: #9ff789;";
              case "Speed-Tie":
                return "background-color: #f0e9b0;";
              case "Outspeeds":
                return "background-color: #e7a59a;";
              default:
                return "";
            }
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
        getStarterType1() {
            var type = this.gen1data.find(y => y.Pokemon === this.starterName)
            var lowerType = type.type1.toLowerCase()
            return `images/elements/types/${lowerType}.png`
        },
        getStarterType2() {
            var type = this.gen1data.find(y => y.Pokemon === this.starterName)
            if (type.type2 != null) {
                var lowerType = type.type2.toLowerCase()
                return `images/elements/types/${lowerType}.png`
            }
        },
        pkmnType(typeNumber, type1, type2) {
            if (type1 && this.g1stateVariable != `Base Stats`) {
                if (type1 == type2) {
                    return `images/elements/types/${type1}.png`
                }
                else if (type1 != type2 && typeNumber == 1) {
                    return `images/elements/types/${type1}.png`
                }
                else if (type1 != type2 && typeNumber == 2) {
                    return `images/elements/types/${type2}.png`
                }
            }
            else {
                if (typeNumber == 1) {
                    return this.getStarterType1()
                }
                else if (typeNumber == 2) {
                    return this.getStarterType2()
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
            return this.gen1data.find(x => x.dexNumber === y)
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
                return this.statLabelOpacityValue
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
                var move = this.gen1moves.find(x => x.Move.toLowerCase() === y.toLowerCase())
                var moveType = move[`Type`].toLowerCase()
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

        //CO-PILOT REFACTOR
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

        // //CO-PILOT REFACTOR
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
                var move = this.gen1moves.find(x => x.Move.toLowerCase() === y.toLowerCase())
                if (this.showCritMultiplierInEP == true && (y.toUpperCase() == "RAZOR LEAF" || y.toUpperCase() == "CRABHAMMER" || y.toUpperCase() == "SLASH" || y.toUpperCase() == "KARATE CHOP")) {
                    level = this.mapper.properties.player.team[0].level.value
                    critModifier = (2*level+5)/(level+5) //This part of the function is currently an approximation
                    power = move.Power
                    pokemon = this.gen1data.find(y => y.Pokemon === this.starterName)
                    baseSpeed = pokemon.baseSpd
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

        moveDynamic(slot) {
            if (this.g1stateVariable == `Battle`) {
                return this.mapper?.properties?.battle?.yourPokemon[`move${slot}`].value
            }
            else {
                return this.mapper?.properties?.player?.team[0][`move${slot}`].value
            }
        },
        moveType(y) { //y = move1.value
            if (y) {
                var move = this.gen1moves.find(x => x.Move.toLowerCase() === y.toLowerCase())
                if (move) return move.Type
            }
            return null
        },

        moveAccuracyEvasionDynamic(move) {
            if (move) {
                var move_name = this.capitalization_format(move)
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

        ////THIS FUNCTION IS DEPRECATED WITH typeEffectiveness()
        determineSTAB(x) { //x = move1.value
            if (this.addStabBonus == true) {
                var pkmnType1 = this.mapper.properties.player.team[0].type1.value
                var pkmnType2 = this.mapper.properties.player.team[0].type2.value
                if (pkmnType1 == this.moveType(x) || pkmnType2 == this.moveType(x))
                    return 1.5
                else
                    return 1
            }
            else
                return 1
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

        // //!MOVE FORMATTING --- OLD CODE
        // move_name(move_string) { //converts move strings so that they are formatted correctly
        //     if (move_string != undefined) {
        //         if (move_string.toLowerCase() == "vicegrip")     { return "ViceGrip" }
        //         if (move_string.toLowerCase() == "doubleslap")   { return "DoubleSlap" }
        //         if (move_string.toLowerCase() == "double-edge")  { return "Double-Edge" }
        //         if (move_string.toLowerCase() == "solarbeam")    { return "SolarBeam" }
        //         if (move_string.toLowerCase() == "extremespeed") { return "ExtremeSpeed" }
        //         if (move_string.toLowerCase() == "dynamicpunch") { return "DynamicPunch" }
        //         if (move_string.toLowerCase() == "thunderpunch") { return "ThunderPunch" }
        //         if (move_string.toLowerCase() == "bubblebeam")   { return "BubbleBeam" }
        //         if (move_string.toLowerCase() == "grasswhistle") { return "GrassWhistle" }
        //         if (move_string.toLowerCase() == "softboiled")   { return "Softboiled" }
        //         if (move_string.toLowerCase() == "sand-attack")  { return "Sand-Attack" }
        //         if (move_string.toLowerCase() == "mud-slap")     { return "Mud-Slap" }
        //         if (move_string.toLowerCase() == "featherdance") { return "FeatherDance" }
        //         if (move_string.toLowerCase() == "poisonpowder") { return "PoisonPowder" }
        //         if (move_string.toLowerCase() == "dragonbreath") { return "DragonBreath" }
        //         if (move_string.toLowerCase() == "ancientpower") { return "AncientPower" }
        //         if (move_string.toLowerCase() == "smellingsalt") { return "SmellingSalt" }
        //         if (move_string.toLowerCase() == "selfdestruct") { return "Selfdestruct" }
        //         if (move_string.toLowerCase() == "smokescreen")  { return "SmokeScreen" }
        //         if (move_string.toLowerCase() == "sonicboom")    { return "SonicBoom" }
        //         else { return move_string }
        //     }
        //     else { return move_string }
        // },

        // //!OLD CODE
        //BATTLE FADE
        // battle_fade() {
        //     if (
        //     (this.batt.trainer.class.value == "LORELEI" ||
        //     // this.batt.trainer.class.value == "CLAIR" ||
        //     this.batt.trainer.class.value == "BRUNO" ||
        //     this.batt.trainer.class.value == "AGATHA" ||
        //     this.batt.trainer.class.value == "LANCE" ||
        //     this.batt.trainer.class.value == "RIVAL3") &&
        //     (this.g1stateVariable == "To Battle" ||
        //     this.g1stateVariable == "Battle" ||
        //     this.g1stateVariable == "From Battle")
        //     ) {
        //         return true
        //     }
        //     else if (
        //     this.g1stateVariable == "To Battle" ||
        //     this.g1stateVariable == "Battle") {
        //         return true
        //     }
        //     else {
        //         return false
        //     }
        // },

        // //!UNUSED
        //STATUS CONDITION FUNCTIONS
        // statusCheck(y) {
        //     if (y == null)
        //         return " "
        //     else
        //         return y
        // },

        // //!UNUSED
        //GENERAL FUNCTIONS
        // nullCheck(y) {
        //     if (y != null || y != undefined)
        //         return y
        //     else
        //         return " "
        //     },

        // //!UNUSED
        // species(x) {
        //     if (x != null && x.value != null)
        //         return x.value.name
        //     else
        //         return null
        // },

        // //!UNUSED
        // inventoryDisplayItem(item) {
        //     if (item == "--End of list--") {
        //         return " "
        //     }
        //     else return item
        // },

        // inventoryDisplayQuality(item, quantity) {
        //     if (item == "--End of list--") {
        //         return " "
        //     }
        //     else return quantity
        // },

        // //!UNUSED
        // activeSlot(activePkmn, currentSlot, statLabel, stat, side) {
        //     if (this.slotTimingFix == true) {
        //         return stat 
        //     }
        //     else {
        //         if (activePkmn == currentSlot && this.g1stateVariable == "Battle") {
        //             return this.mapper.properties.battle[side][statLabel].value
        //         }
        //         else { 
        //             return stat
        //         }
        //     }
        // },

        // //!UNUSED
        // pkmnDataPath() {
        //     if (this.g1state() == "Overworld" || this.g1state() == "To Battle") {
        //         return "mapper.properties.player.team[0]"
        //     }
        //     else if (this.g1state() == "Battle") {
        //         return "mapper.properties.battle.yourPokemon"
        //     }
        // },
        // //!DEPRECATED
        // camelCase: function (str) {
        //     if (!str || !str.toString()) { return '' }
        //     return str.toString().replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        //         return index == 0 ? word.toUpperCase() : word.toLowerCase();
        //     })
        // },
        // pascalCaseSpace(str) {
        //     let words = str.split(' ');
        //     for (let char of words) {
        //         words[words.indexOf(char)] = char.charAt(0).toUpperCase() + char.slice(1);
        //     }
        //     return words.join(' ');
        // },
        // pascalCaseDot(str) {
        //     let words = str.split('.');
        //     for (let char of words) {
        //         words[words.indexOf(char)] = char.charAt(0).toUpperCase() + char.slice(1);
        //     }
        //     return words.join(' ');
        // },
        // pascalCaseDash(str) {
        //     let words = str.split('-');
        //     for (let char of words) {
        //         words[words.indexOf(char)] = char.charAt(0).toUpperCase() + char.slice(1);
        //     }
        //     return words.join('-');
        // },
        // capitalization_format(str) {
        //     if (str == null) { return "" }
        //     return str.replace(/(^|\s|\-|\.)(\w)/g, function(match, p1, p2) {
        //       return p1 + p2.toUpperCase();
        //     });
        // },

        // //!UNUSED - OLD GAMESTATE FUNCTION
        // setGamestate(state, number) {
        //     if (this.gamestateLogging == true)
        //         // console.log("Gamestate: "+"("+number+") "+state)
        //     this.currentGamestate = string
        //     return string
        // },
        // g1state() {
        //     if (this.mapper.properties.battle.specialType.value === `Oak Catching Starter`) {
        //         string = "Base Stats"
        //         gamestate = 1
        //         return this.setGamestate(string, gamestate)
        //     }
        //     else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.turnInfo.battleStart.value >= 1 && this.mapper.properties.battle.type.bytes >= 1 && this.mapper.properties.battle.lowHealthAlarm.value == "Disabled") {
        //         string = "From Battle"
        //         gamestate = 2
        //         return this.setGamestate(string, gamestate)
        //     }
        //     else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.turnInfo.battleStart.value >= 1 && this.mapper.properties.battle.type.bytes >= 1) {
        //         string = "Battle"
        //         gamestate = 2
        //         return this.setGamestate(string, gamestate)
        //     }
        //     else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.turnInfo.battleStart.value === 0 && this.mapper.properties.battle.type.bytes >= 1) {
        //         string = "To Battle"
        //         gamestate = 3
        //         return this.setGamestate(string, gamestate)
        //     }
        //     else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.type.value === `None`) {
        //         string = "Overworld"
        //         gamestate = 4
        //         return this.setGamestate(string, gamestate)
        //     }
        //     else {
        //         string = "Base Stats"
        //         gamestate = 5
        //         return this.setGamestate(string, gamestate)
        //     }
        // },

        // //!UNUSED
        // g1trainer(x, y) {
        //     return (x + " " + y)
        // },

        // //!UNUSED
        // currentTrainer() {
        //     return (this.mapper.properties.battle.trainer.class.value + " " + this.mapper.properties.battle.trainer.number.value)
        // },

        //CO-PILOT REFACTOR
        // fixTrainerName(trainerName, trainerNumber) {
        //     const yellowMappings = {
        //       "RIVAL1": {
        //         1: "rival1's team",
        //         2: "rival1A's team",
        //         3: "rival2's team"
        //       },
        //       "RIVAL2": {
        //         1: "rival3's team",
        //         2: "rival4's team",
        //         3: "rival4's team",
        //         4: "rival4's team",
        //         5: "rival5's team",
        //         6: "rival5's team",
        //         7: "rival5's team",
        //         8: "rival6's team",
        //         9: "rival6's team",
        //         10: "rival6's team"
        //       },
        //       "RIVAL3": "champion's team"
        //     };
          
        //     const redAndBlueMappings = {
        //       "RIVAL1": {
        //         1: "rival1's team",
        //         2: "rival1A's team",
        //         3: "rival2's team",
        //         4: "rival1A's team",
        //         5: "rival1A's team",
        //         6: "rival1A's team",
        //         7: "rival2's team",
        //         8: "rival2's team",
        //         9: "rival2's team"
        //       },
        //       "RIVAL2": {
        //         1: "rival3's team",
        //         2: "rival3's team",
        //         3: "rival3's team",
        //         4: "rival4's team",
        //         5: "rival4's team",
        //         6: "rival4's team",
        //         7: "rival5's team",
        //         8: "rival5's team",
        //         9: "rival5's team",
        //         10: "rival6's team",
        //         11: "rival6's team",
        //         12: "rival6's team"
        //       },
        //       "RIVAL3": "champion's team"
        //     };
          
        //     const mappings = this.mapper.meta.gameName === "Pokemon Yellow" ? yellowMappings : redAndBlueMappings;
          
        //     if (mappings[trainerName]) {
        //       const teamName = mappings[trainerName][trainerNumber] || mappings[trainerName];
        //       return teamName.toLowerCase() + "'s team";
        //     } 
        //     else {
        //       return trainerName.toLowerCase() + "'s team";
        //     }
        // },

        // specialTrainerGraphics() {
        //     if (this.showSpecialTrainerGraphics == true) {
        //         if (this.mapper.properties.battle.trainer.class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 5) return `images/trainers/${this.mapper.properties.battle.trainer.class.value}_${this.mapper.properties.battle.trainer.number}.png`
        //         else if (this.mapper.properties.battle.trainer.class == "YOUNGSTER" && this.mapper.properties.battle.trainer.number == 1) return `images/trainers/BEN.png` //YOUNGSTER BEN
        //         else if (this.mapper.properties.battle.trainer.class == "POKEMANIAC" && this.mapper.properties.battle.trainer.number == 7) return `images/trainers/${this.mapper.properties.battle.trainer.class.value}_${this.mapper.properties.battle.trainer.number}.png`
        //         else if (this.mapper.properties.battle.trainer.class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 10) return `images/trainers/${this.mapper.properties.battle.trainer.class.value}_${this.mapper.properties.battle.trainer.number}.png`
        //         else if (this.mapper.properties.battle.trainer.class == "ROCKET" && this.mapper.properties.battle.trainer.number == 38) return `images/trainers/${this.mapper.properties.battle.trainer.class.value}_${this.mapper.properties.battle.trainer.number}.png`
        //         else if (this.mapper.properties.battle.trainer.class == "HIKER" && this.mapper.properties.battle.trainer.number == 9) return `images/trainers/${this.mapper.properties.battle.trainer.class.value}_${this.mapper.properties.battle.trainer.number}.png`
        //         else if (this.mapper.properties.battle.trainer.class == "LASS" && this.mapper.properties.battle.trainer.number == 3) return `images/trainers/${this.mapper.properties.battle.trainer.class.value}_${this.mapper.properties.battle.trainer.number}.png`
        //         else if (this.mapper.properties.battle.trainer.class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 1) return `images/trainers/GOLDEEN.png` //CERULEAN GYM GOLDEEN TRAINER
        //         else if (this.mapper.properties.battle.trainer.class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 3) return `images/trainers/${this.mapper.properties.battle.trainer.class.value}_${this.mapper.properties.battle.trainer.number}.png`
        //         else if (this.mapper.properties.battle.trainer.class == "CHANNELER" && this.mapper.properties.battle.trainer.number == 10) return `images/trainers/AGATHAJR.png`
        //         else if (this.mapper.properties.battle.trainer.class == "RIVAL1" && this.mapper.properties.battle.trainer.number == 1) return `images/trainers/RIVAL1.png` //LAB RIVAL
        //         else if (this.mapper.properties.battle.trainer.class == "RIVAL1" && this.mapper.properties.battle.trainer.number == 2) return `images/trainers/RIVAL1.png` //ROUTE22 RIVAL
        //         else if (this.mapper.properties.battle.trainer.class == "RIVAL1" && this.mapper.properties.battle.trainer.number == 3) return `images/trainers/RIVAL2.png` //CERULEAN RIVAL
        //         else if (this.mapper.properties.battle.trainer.class == "RIVAL2" && this.mapper.properties.battle.trainer.number == 1) return `images/trainers/RIVAL2.png` //SS ANNE RIVAL
        //         // else if (this.mapper.properties.battle.trainer.class == "RIVAL2" && this.mapper.properties.battle.trainer.number == 2) return `images/trainers/RIVAL2.png` //POKEMON TOWER RIVAL, 5 member team
        //         // else if (this.mapper.properties.battle.trainer.class == "RIVAL2" && this.mapper.properties.battle.trainer.number == 3) return `images/trainers/RIVAL2.png` //POKEMON TOWER RIVAL, 5 member team
        //         // else if (this.mapper.properties.battle.trainer.class == "RIVAL2" && this.mapper.properties.battle.trainer.number == 4) return `images/trainers/RIVAL2.png` //POKEMON TOWER RIVAL, 5 member team
        //         else if (this.mapper.properties.battle.trainer.class == "BROCK") return "images/trainers/BROCK.png"
        //         else if (this.mapper.properties.battle.trainer.class == "MISTY") return "images/trainers/MISTY.png"
        //         else if (this.mapper.properties.battle.trainer.class == "LT.SURGE" && this.mapper.meta.gameName == `Pokemon Yellow`) return "images/trainers/LTSURGE.png"
        //         else if (this.mapper.properties.battle.trainer.class == "LT.SURGE" && this.mapper.meta.gameName == `Pokemon Red and Blue`) return "images/trainers/LTSURGE-RED.png"
        //         else if (this.mapper.properties.battle.trainer.class == "ERIKA") return "images/trainers/ERIKA.png"
        //         else if (this.mapper.properties.battle.trainer.class == "KOGA") return "images/trainers/KOGA.png"
        //         else if (this.mapper.properties.battle.trainer.class == "SABRINA" && this.mapper.meta.gameName == `Pokemon Yellow`) return "images/trainers/SABRINA.png"
        //         else if (this.mapper.properties.battle.trainer.class == "SABRINA" && this.mapper.meta.gameName == `Pokemon Red and Blue`) return "images/trainers/SABRINA-RED.png"
        //         else if (this.mapper.properties.battle.trainer.class == "BLAINE" && this.mapper.meta.gameName == `Pokemon Yellow`) return "images/trainers/BLAINE.png"
        //         else if (this.mapper.properties.battle.trainer.class == "BLAINE" && this.mapper.meta.gameName == `Pokemon Red and Blue`) return "images/trainers/BLAINE-RED.png"
        //         else if (this.mapper.properties.battle.trainer.class == "GIOVANNI" && this.mapper.properties.battle.trainer.number == 3) return "images/trainers/GIOVANNI.png"
        //         else return null;
        //     }
        // },

        // //!OLD EXP CALCULATIONS - UNUSED
        // expPercent(x) {
        //     if (this.mapper.properties.player.team[0].species.value != null) {
        //         var growthRate = this.gen1dataGrowthMovepool.find(y => y.name === x.species.value)
        //         var newExp = 0
        //         if (growthRate.growth_rate == "Slow") {
        //             newExp = this.expPercentSlow(x)
        //         }
        //         else if (growthRate.growth_rate == "Medium Slow") {
        //             newExp = this.expPercentMediumSlow(x)
        //         }
        //         else if (growthRate.growth_rate == "Medium Fast") {
        //             newExp = this.expPercentMediumFast(x)
        //         }
        //         else if (growthRate.growth_rate == "Fast") {
        //             newExp = this.expPercentFast(x)
        //         }
        //         else    
        //             return 0
        //         return newExp
        //     }
        //     return 0
        // },
        // expPercentFast(x) {
        //     expBar = ((x.expPoints.value) - ((4 * (Math.pow(x.level.value, 3))) / 5)) / (((4 * (Math.pow(x.level.value + 1, 3))) / 5) - ((4 * (Math.pow(x.level.value, 3))) / 5)) // errors could lurk here
        //     if ((expBar*100) > 100)
        //         return 100
        //     else if ((expBar*100) < 0)
        //         return 0
        //     else
        //         return expBar * 100
        // },
        // expPercentMediumFast(x) {
        //     expBar = (((x.expPoints.value) - (Math.pow(x.level.value, 3))) / ((Math.pow(x.level.value + 1, 3)) - (Math.pow(x.level.value, 3))))
        //     if ((expBar*100) > 100)
        //         return 100
        //     else if ((expBar*100) < 0)
        //         return 0
        //     else
        //         return expBar * 100
        // },
        // expPercentMediumSlow(x) { //this formula may be incorrect
        //     var medSlow = (((((6 / 5) * (Math.pow(x.level.value, 3))) - (15 * (Math.pow(x.level.value, 2))) + (100 * x.level.value) - 140)))
        //     expBar = (((x.expPoints.value) - medSlow) / ((((((6 / 5) * (Math.pow((x.level.value + 1), 3))) - (15 * (Math.pow((x.level.value + 1), 2))) + (100 * (x.level.value + 1)) - 140))) - medSlow)) // errors could lurk here
        //     if ((expBar*100) > 100)
        //         return 100
        //     else if ((expBar*100) < 0)
        //         return 0
        //     else
        //         return expBar * 100
        // },
        // expPercentSlow(x) {
        //     expBar = (((x.expPoints.value) - (Math.floor((5 * (Math.pow(x.level.value, 3))) / 4))) / ((Math.floor((5 * (Math.pow(x.level.value + 1, 3))) / 4)) - (Math.floor((5 * (Math.pow(x.level.value, 3))) / 4)))) // errors could lurk here
        //     if ((expBar*100) > 100)
        //         return 100
        //     else if ((expBar*100) < 0)
        //         return 0
        //     else
        //         return expBar * 100
        // },

        // //!DEPRECATED
        // battlePokemonCrop() {
        //     if (this.mapper.properties.battle.trainer.totalPokemon == 1) {
        //         return "height: 242px;"
        //     }
        //     else if (this.mapper.properties.battle.trainer.totalPokemon == 2) {
        //         return "height: 402px;"
        //     }
        //     else if (this.mapper.properties.battle.trainer.totalPokemon == 3) {
        //         return "height: 562px;"
        //     }
        //     else if (this.mapper.properties.battle.trainer.totalPokemon == 4) {
        //         return "height: 722px;"
        //     }
        //     else if (this.mapper.properties.battle.trainer.totalPokemon == 5) {
        //         return "height: 888px;"
        //     }
        //     else if (this.mapper.properties.battle.trainer.totalPokemon == 6) {
        //         return "height: 1080px;"
        //     }
        // },

        // //!DEPRECATED
        // g1martSelector(map) { //map value
        //     if (this.inventory == false) {
        //         return "Overworld"
        //     }
        //     else if (map == "Viridian City - Mart" ||
        //     map == "Pewter City - Mart" ||
        //     map == "Cerulean City - Mart" ||
        //     map == "Vermilion City - Mart" ||
        //     map == "Lavender Town - Mart" ||
        //     map == "Fuchsia City - Mart" ||
        //     map == "Cinnabar Island - Mart" ||
        //     map == "CINNABAR_MART_COPY" ||
        //     map == "Saffron City - Mart" ||
        //     map == "Indigo Plateau - Lobby" ||
        //     map == "Celadon City - Pokecenter" ||
        //     map == "Saffron City - Pokecenter"
        //     ) {
        //         return "Mart" //currently unused
        //     }
        //     else if (map == "Celadon City - Department Store - 1F" ||
        //     map == "Celadon City - Department Store - 2F" ||
        //     map == "Celadon City - Department Store - 3F" ||
        //     map == "Celadon City - Department Store - 4F" ||
        //     map == "Celadon City - Department Store - 5F" ||
        //     map == "Celadon City - Department Store - Roof" ||
        //     map == "Celadon City - Department Store - Elevator") {
        //         return "Department" //shows vitamins
        //     }
        //     else if (map == "Cinnabar Mansion" ||
        //     map == "Safari Zone (Center)" ||
        //     map == "Safari Zone (East)" ||
        //     map == "Safari Zone (North)" ||
        //     map == "Safari Zone (West)" ||
        //     map == "Safari Zone - Secret House"
        //     ) { //show vitamins in mansion & safari zone
        //         return "Department" //shows vitamins
        //     }
        //     else {
        //         return "Overworld" //shows regular stat labels
        //     }
        // },

        // //!DEPRECATED
        // moveAccuracyStatic(move) {
        //     var moveObject = this.gen1moves.find(x => x.Move.toLowerCase() === move.toLowerCase())
        //     return moveObject.Accuracy
        // },
        // //!DEPRECATED
        // moveAccuracyDynamic(move) {
        //     var moveObject = this.gen1moves.find(x => x.Move.toLowerCase() === move.toLowerCase())
        //     var moveAccuracy = moveObject.Accuracy
        //     var stageMods = this.stageModifiersData.find(x => x.modType === "accuracy")
        //     var currentModStage = this.batt.yourPokemon.modStageAccuracy.value
        //     if (moveAccuracy == `-`) {
        //         return `-`
        //     }
        //     else {
        //         return Math.floor(moveAccuracy * stageMods[currentModStage])
        //     }
        // },

        // //!DEPRECATED
        // // TYPE EFFECTIVENESS
        // checkTypes(x, y) { //x = type1.value, y = type2.value
        //     if (x.value == y.value)
        //         return true
        //     else
        //         return false
        // },

        // //!DEPRECATED
        // logicalStatementCheck() {
        //     if (this.mapper.properties.overworld.map.value == "Pallet Town - Oak's Lab" && this.mapper.properties.player.team[0].level.value == 5 && this.mapper.properties.player.teamCount.value == 1)
        //         return true
        //     else
        //         return false
        // },

        // //!UNUSED
        // hpDvCalculation() {
        //     return (((this.mapper.properties.player.team[0].dvAttack.value % 2) * 8) + ((this.mapper.properties.player.team[0].dvDefense.value % 2) * 4) + ((this.mapper.properties.player.team[0].dvSpeed.value % 2) * 2) + ((this.mapper.properties.player.team[0].dvSpecial.value % 2) * 1))
        // },

        // //!DEPRECATED - test other type effectiveness function first REFACTORED
        // typeEffectiveness(x) { //x = move1.value
        //     if (this.typeCalcs == true) {
        //         var stab = this.determineSTAB(x)
        //         if (x != null) {
        //             if (this.typeCalcs == true && this.mapper.properties.battle.turnInfo.battleStart.value >= 1 && this.mapper.properties.battle.type.bytes >= 1) { //calculates effective power when in battle
        //                 var attackingType = this.moveType(x)
        //                 var defendingTypeMono = this.mapper.properties.battle.enemyPokemon.type1.value
        //                 var defendingType1 = this.mapper.properties.battle.enemyPokemon.type1.value
        //                 var defendingType2 = this.mapper.properties.battle.enemyPokemon.type2.value
        //                 var multipliers = this.typeData.find(x => x.moveType === attackingType)
        //                 //NO MOVE POWER (STATUS MOVE)
        //                 if (this.movePower(x) == "-") {
        //                     return this.movePower(x)
        //                 }
        //                 //NO ENEMY DATA (HAVEN'T BATTLED SINCE RELOADING ROM OR SAVE)
        //                 else if (this.mapper.properties.battle.enemyPokemon.type1 == null) {
        //                     return Math.floor(this.movePower(x) * stab)
        //                 }
        //                 //ATTACKING A MONO-TYPE POKEMON
        //                 else if (this.mapper.properties.battle.enemyPokemon.type1.value === this.mapper.properties.battle.enemyPokemon.type2.value) {
        //                     var multiplier1 = multipliers[defendingTypeMono]
        //                     return Math.floor(this.movePower(x) * multiplier1 * stab)
        //                 }
        //                 //ATTACKING A DUAL-TYPE POKEMON
        //                 else if (this.mapper.properties.battle.enemyPokemon.type1 != this.mapper.properties.battle.enemyPokemon.type2) {
        //                     var multipliers = this.typeData.find(x => x.moveType === attackingType)
        //                     var multiplier1 = multipliers[defendingType1]
        //                     var multiplier2 = multipliers[defendingType2]
        //                     return Math.floor(this.movePower(x) * multiplier1 * multiplier2 * stab)
        //                 }
        //                 //RETURN THE MOVES POWER IF NOTHING ELSE WORKS
        //                 else
        //                     return this.movePower(x) //returns the move's base power if not in battle
        //             }
        //             //RETURN THE MOVE'S POWER IF NOT IN BATTLE
        //             else {
        //                 if (this.movePower(x) == "-") {
        //                     return this.movePower(x)
        //                 }
        //                 else {
        //                     return Math.floor(this.movePower(x) * stab) //returns the move's base power if not in battle
        //                 }
        //             } 
        //         }
        //         else {
        //             //  console.log("Broken - likely bug")
        //                 return ""
        //         }
        //     }
        //     else { return this.movePower(x) }
        // },

        // //!UNUSED
        // department(getMart) {
        //     if (getMart == `Department`) {
        //         return 0
        //     }
        //     else return 1
        // },

        // //!UNUSED
        // //INVENTORY FUNCTIONS
        // itemCheck(y) {
        //     if (y == "--End of list--") return " ";
        //     return y;
        // },
        // //!UNUSED
        // ifZero(y) {
        //     if (y != 0) return y;
        //     return " ";
        // },

        // //!REFACTORED
        // enemyPkmnFaintCheck(pkmnData) {
        //     if (pkmnData.hp == 0) {
        //         return false
        //     }
        //     else {
        //         return true
        //     }
        // },
        // enemyPkmnFaint(pkmnData) {
        //     if (pkmnData.hp == 0) {
        //         return "filter: drop-shadow(2px 2px 2px #000) saturate(1.3) grayscale(100%); opacity: .5;"
        //     }
        //     else {
        //         return "filter: drop-shadow(2px 2px 2px #000) saturate(1.3) grayscale(0%);"
        //     }
        // },
        // enemyPkmnFaintStats(pkmnData) {
        //     if (pkmnData.hp == 0) {
        //         return "filter: grayscale(100%); opacity: .4;"
        //     }
        //     else {
        //         return "filter: grayscale(0%);"
        //     }
        // },
        // enemyPkmnText(pkmnData) {
        //     if (pkmnData.hp == 0) {
        //         return "opacity: .3"
        //     }
        //     else {
        //         return ""
        //     }
        // },
        // enemyPkmnSpecies(pkmnData) {
        //     if (pkmnData.hp == 0) {
        //         return "opacity: .3"
        //     }
        //     else {
        //         return "opacity: .7"
        //     }
        // },

        // //!OLD fixTrainerName function - new one needs testing REFACTORED
        // fixTrainerName(trainerName, trainerNumber) {
        //     if (this.mapper.meta.gameName == "Pokemon Yellow") {
        //         if (trainerName == "RIVAL1" && trainerNumber == 1) {
        //             return "rival1's team"
        //         }
        //         else if (trainerName == "RIVAL1" && trainerNumber == 2) {
        //                 return "rival1A's team"
        //         }
        //         else if (trainerName == "RIVAL1" && trainerNumber == 3) {
        //                 return "rival2's team"
        //         }
        //         else if (trainerName == "RIVAL2" && trainerNumber == 1) {
        //                 return "rival3's team"
        //         }
        //         else if (trainerName == "RIVAL2" && (trainerNumber == 2 || trainerNumber == 3 || trainerNumber == 4)) {
        //                 return "rival4's team"
        //         }
        //         else if (trainerName == "RIVAL2" && (trainerNumber == 5 || trainerNumber == 6 || trainerNumber == 7)) {
        //                 return "rival5's team"
        //         }
        //         else if (trainerName == "RIVAL2" && (trainerNumber == 8 || trainerNumber == 9 || trainerNumber == 10)) {
        //                 return "rival6's team"
        //         }
        //         else if (trainerName == "RIVAL3") {
        //             return "champion's team"
        //         }
        //         else {
        //             return trainerName.toLowerCase() + "'s team"
        //         }
        //     }
        //     else if (this.mapper.meta.gameName == "Pokemon Red and Blue") {
        //         if (trainerName == "RIVAL1" && trainerNumber == 1 || trainerName == "RIVAL1" && trainerNumber == 2 || trainerName == "RIVAL1" && trainerNumber == 3) {
        //             return "rival1's team"
        //         }
        //         else if (trainerName == "RIVAL1" && trainerNumber == 4 || trainerName == "RIVAL1" && trainerNumber == 5 || trainerName == "RIVAL1" && trainerNumber == 6) {
        //                 return "rival1A's team"
        //         }
        //         else if (trainerName == "RIVAL1" && trainerNumber == 7 || trainerName == "RIVAL1" && trainerNumber == 8 || trainerName == "RIVAL1" && trainerNumber == 9) {
        //                 return "rival2's team"
        //         }
        //         else if (trainerName == "RIVAL2" && trainerNumber == 1 || trainerName == "RIVAL2" && trainerNumber == 2 || trainerName == "RIVAL2" && trainerNumber == 3) {
        //                 return "rival3's team"
        //         }
        //         else if (trainerName == "RIVAL2" && trainerNumber == 4 || trainerName == "RIVAL2" && trainerNumber == 5 || trainerName == "RIVAL2" && trainerNumber == 6) {
        //                 return "rival4's team"
        //         }
        //         else if (trainerName == "RIVAL2" && trainerNumber == 7 || trainerName == "RIVAL2" && trainerNumber == 8 || trainerName == "RIVAL2" && trainerNumber == 9) {
        //                 return "rival5's team"
        //         }
        //         else if (trainerName == "RIVAL2" && trainerNumber == 10 || trainerName == "RIVAL2" && trainerNumber == 11 || trainerName == "RIVAL2" && trainerNumber == 12) {
        //                 return "rival6's team"
        //         }
        //         else if (trainerName == "RIVAL3") {
        //             return "champion's team"
        //         }
        //         else {
        //             return trainerName.toLowerCase() + "'s team"
        //         }
        //     }
        // },

        // //!REFACTORED
        // //BADGE BOOSTS
        // badgeBoost(badge, stat) {
        //     if (badge == true)
        //         return Math.floor(stat * 1.125)
        //     else
        //         return stat
        // },

        // //!UNUSED
        // //BATTLE STATE
        // currentBattleState() {
        //     //BATTLE
        //     //OAK CATCHING STARTER
        //     if (this.mapper.properties.battle.specialType.value === `Oak Catching Starter`) {
        //         return 0 //base stats (tutorial)
        //     }
        //     else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.turnInfo.battleStart.value >= 1 && this.mapper.properties.battle.type.bytes >= 1) {
        //         return 4 //battle
        //     }
        //     else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.turnInfo.battleStart.value === 0 && this.mapper.properties.battle.type.bytes >= 1) {
        //         return 2 //to battle
        //     }
        //     else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.type.value === `None`) {
        //         return 2 //overworld
        //     }
        //     else
        //         return 0 //base stats
        // },
        // //!REFACTORED
        // statExp(statExp, label) { //statExp = mapper.properties.player.team[0].statExpAttack.value
        //     vitaminsUsed = (statExp / 2560)
        //     usableVitamins = Math.ceil(10 - vitaminsUsed)
        //     if (usableVitamins < 0) {
        //         return 0
        //     }
        //     else {
        //         return usableVitamins
        //     }
        // },

        // //!UNUSED
        // gameName() {
        //     if (this.mapper.meta.gameName == `Pokemon Yellow`) {
        //         return this.mapper.meta.gameName
        //     }
        //     else if (this.mapper.meta.gameName == `Pokemon Crystal`) {
        //         return this.mapper.meta.gameName
        //     }

        //     else if (this.mapper.meta.gameName == `Pokemon Red and Blue`) {
        //         return `Pokemon Yellow`
        //     }

        //     else if (this.mapper.meta.gameName == `Pokemon Gold and Silver`) {
        //         return `Pokemon Crystal`
        //     }
        //     else
        //         return `Pokemon Yellow`
        // },

        // //!UNUSED
        // gameName() {
        //     const gameName = this.mapper.meta.gameName;
        //     switch (gameName) {
        //       case "Pokemon Yellow":
        //       case "Pokemon Crystal":
        //         return gameName;
        //       case "Pokemon Red and Blue":
        //         return "Pokemon Yellow";
        //       case "Pokemon Gold and Silver":
        //         return "Pokemon Crystal";
        //       default:
        //         return "Pokemon Yellow";
        //     }
        // },

        // //!UNUSED
        // speedComparison(playerPkmnData, enemyPkmnData) {
        //     var playerSpeed = playerPkmnData.speed.value
        //     var enemySpeed = enemyPkmnData.speed.value
        //     if (playerSpeed > enemySpeed) {
        //         return "Outsped"
        //     }
        //     if (playerSpeed == enemySpeed) {
        //         return "Speed-Tie"
        //     }
        //     if (playerSpeed < enemySpeed) {
        //         return "Outspeeds"
        //     }
        // },

        // //!DEPRECATED
        // statLabelColor(x) {
        //     if (this.modColor == true)
        //         if (x.bytes > 7)
        //             return this.modRaise
        //         else if (x.bytes < 7)
        //             return this.modLower
        //         else
        //             return this.modDefault
        //     else
        //         return this.modDefault
        // },
        // ppValueColor(x) {
        //     if (this.ppColor == true)
        //         if (x <= 5 && x > 1)
        //             return this.ppMid
        //         else if (x <= 1)
        //             return this.ppLow
        //         else
        //             return this.ppHigh
        //     else
        //         return this.ppHigh
        // },
    },

//--------- PROGRAM MOUNTED ---------------------------------------------------------------------------------------------------------------//
    mounted: async function () {
        const that = this
        this.mapper = new GameHookMapperClient()
        this.mapper.onConnected = (x) => this.ready = true
        this.mapper.onDisconnected = (x) => this.ready = false
        await this.mapper.connect()

        for (var species of Object.keys(g1PokemonData)) {
            var image = new Image();
            image.src = `images/pokemon/${species}.png`;
        }

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
            if (this.g1stateVariable == "Base Stats" && this.map.overworld.map.value == "Pallet Town - Oak's Lab") { //FIX for flicker in Oak's lab
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

        //ENEMY STATE MANAGER
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

        // //!CURRENTLY UNUSED
        // //AUTOSPLITTER WEBSOCKET
        // let client = new WebSocket("ws://localhost:6789/");
        //     client.onmessage = (event) => {
        //     const data = JSON.parse(event.data);
        //     this.splitData.push(data);
        //     console.log("DATA FROM WEBSOCKET", data);
        // };

        // //!VARIABLE TRACKING - WILL BE REPLACED BY ROM PATCH
        // // Route 1 Encounters
        // // This code tracks the number of wild encounters on Route 1
        // this.mapper.properties.battle.type.change(function (x) {
        //     if (that.mapper.properties.battle.type.value == `Wild` && that.mapper.properties.overworld.map.value == `Route 1`) {
        //         that.route1Encounters += 1
        //     }
        // })

        // // Viridian Forest Encounters
        // // This code tracks the number of wild encounters in Viridian Forest
        // this.mapper.properties.battle.type.change(function (x) {
        //     if (that.mapper.properties.battle.type.value == `Wild` && that.mapper.properties.overworld.map.value == `Viridian Forest`) {
        //         that.forestEncounters += 1
        //     }
        // })

        // // Mt Moon Encounters
        // // This code tracks the number of wild encounters in Mt Moon
        // this.mapper.properties.battle.type.change(function (x) {
        //     if (that.mapper.properties.battle.type.value == `Wild` && that.mapper.properties.overworld.map.bytes >= 0x3B && that.mapper.properties.overworld.map.bytes <= 0x3D) {
        //         that.mtmoonEncounters += 1
        //     }
        // })

        // // Wild Encounters
        // // This code tracks the total number of wild encounters
        // this.mapper.properties.battle.type.change(function (x) {
        //     if (that.mapper.properties.battle.type.value == `Wild` && that.mapper.properties.overworld.map.value != `Pallet Town` && that.mapper.properties.overworld.map.value != `Viridian City`) {
        //         that.totalEncounters += 1
        //     }
        // })

        // // Wild Encounters
        // // This code tracks the total number of wild encounters
        // this.mapper.properties.battle.type.change(function (x) {
        //     if (that.mapper.properties.battle.type.value == `Wild`) {
        //         const mapValue = that.mapper.properties.overworld.map.value;

        //         if (!that.routeEncounters[mapValue]) { that.routeEncounters[mapValue] = 1 }
        //         else { that.routeEncounters[mapValue] += 1 }
        //     }
        // })

        // // Trainer Battles
        // // This code tracks the number of trainer battles that occur
        // this.mapper.properties.battle.type.change(function (x) {
        //     if (that.mapper.properties.battle.type.value == `Trainer`) {
        //         that.totalTrainers += 1
        //     }
        // })

        // // Heals 
        // // This code tracks the number of times the player uses the center to heal
        // this.mapper.properties.audio.channel1.change(function (x) {
        //     if (that.mapper.properties.audio.channel1.bytes == 0xE8) {
        //         that.centerHeals += 1
        //     }
        // })

        // // Saves 
        // // This code tracks the number of times the player saves the games
        // this.mapper.properties.audio.channel5.change(function (x) {
        //     if (that.mapper.properties.audio.channel5.bytes == 0xB6) {
        //         that.saves += 1
        //     }
        // })

        // // player ID updating
        // this.mapper.properties.player.playerId.change(function (x) {
        //     if (that.mapper.properties.player.playerId.value > 0 && that.mapper.properties.player.playerId.value != that.playerId) {
        //         that.playerId = that.mapper.properties.player.playerId.value
        //         that.routeEncounters = []
        //         that.route1Encounters = 0
        //         that.forestEncounters = 0
        //         that.mtmoonEncounters = 0
        //         that.totalEncounters = 0
        //         that.totalTrainers = 0
        //         that.centerHeals = 0
        //         that.saves = 0
        //         that.resets = 0
        //         console.log(`Player ID Changed - new run detected`)
        //     }
        // })
        // this.mapper.properties.gameTime.seconds.change(function (x) {
        //     if (that.mapper.properties.player.playerId.value > 0 && that.mapper.properties.player.playerId.value != that.playerId) {
        //         that.playerId = that.mapper.properties.player.playerId.value
        //     }
        // })

        // // reset tracking
        // this.mapper.properties.player.playerId.change(function (x) {
        //     console.info(x)
        //     if (that.playerId == 99999) {
        //         console.log(`Game Started - Player ID Recorded`)
        //     }
        //     else if (that.mapper.properties.player.playerId.value == 0 && that.playerId > 0) {
        //         console.log(`Reset`)
        //         that.resets += 1
        //     }
        // })

        // SETTING THE STARTER POKEMON'S STATS ----------------------------------------------------------------------------------------------//
        const setStartingStats = async () => {
            const pkmn = this.pokemon(this.starter) // slot 1 species
            const perfectDVs = 0xff // desired DV value
            //calculates the Pokemon's starting stats with the desired DVs
            hitpoints = Math.floor((((this.pokemon(this.starter).baseHp + 15) * 2 * this.customLevel) / 100) + 10 + this.customLevel)
            attack = Math.floor((((this.pokemon(this.starter).baseAtk + 15) * 2 * this.customLevel) / 100) + 5) 
            defense = Math.floor((((this.pokemon(this.starter).baseDef + 15) * 2 * this.customLevel) / 100) + 5)
            special = Math.floor((((this.pokemon(this.starter).baseSpc + 15) * 2 * this.customLevel) / 100) + 5)
            speed = Math.floor((((this.pokemon(this.starter).baseSpd + 15) * 2 * this.customLevel) / 100) + 5)
            //only recalculate stats when DVs change if the player is in Oak's Lab, at level 5, with exactly 1 Pokemon
            if (this.mapper.properties.overworld.map.value == "Pallet Town - Oak's Lab" && this.mapper.properties.player.team[0].level.value == 5 && this.mapper.properties.player.teamCount.value == 1 && this.customMoves == false) {
                await Promise.all([
                    await this.mapper.properties.player.team[0].dvAttack.setBytes([perfectDVs], false), //Set DVs perfect and freeze them
                    await this.mapper.properties.player.team[0].dvDefense.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvSpeed.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvSpecial.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].hp.setBytes([0x00, hitpoints], false), //Apply stat recalculation (don't freeze)
                    await this.mapper.properties.player.team[0].maxHp.setBytes([0x00, hitpoints], false),
                    await this.mapper.properties.player.team[0].attack.setBytes([0x00, attack], false), 
                    await this.mapper.properties.player.team[0].defense.setBytes([0x00, defense], false),
                    await this.mapper.properties.player.team[0].special.setBytes([0x00, special], false),
                    await this.mapper.properties.player.team[0].speed.setBytes([0x00, speed], false),
                ])
            }
            //RANDOM STARTING SET
            else if (this.mapper.properties.overworld.map.value == "Pallet Town - Oak's Lab" && this.mapper.properties.player.team[0].level.value == 5 && this.mapper.properties.player.teamCount.value == 1 && this.randomStartingSet == true) {
                var randomMove1 = this.venomothStartingMoves[this.s1.type1.value].move1
                var randomMove2 = this.venomothStartingMoves[this.s1.type1.value].move2
                var randomMove3 = this.venomothStartingMoves[this.s1.type2.value].move1
                var randomMove4 = this.venomothStartingMoves[this.s1.type2.value].move2
                var randomMove1pp = this.venomothStartingMoves[this.s1.type1.value].pp1
                var randomMove2pp = this.venomothStartingMoves[this.s1.type1.value].pp2
                var randomMove3pp = this.venomothStartingMoves[this.s1.type2.value].pp1
                var randomMove4pp = this.venomothStartingMoves[this.s1.type2.value].pp2
                await Promise.all([
                    await this.mapper.properties.player.team[0].dvAttack.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvDefense.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvSpeed.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvSpecial.setBytes([perfectDVs], false),

                    await this.mapper.properties.player.team[0].hp.setBytes([0x00, hitpoints], false), //Apply stat recalculation (don't freeze)
                    await this.mapper.properties.player.team[0].maxHp.setBytes([0x00, hitpoints], false),
                    await this.mapper.properties.player.team[0].attack.setBytes([0x00, attack], false), 
                    await this.mapper.properties.player.team[0].defense.setBytes([0x00, defense], false),
                    await this.mapper.properties.player.team[0].special.setBytes([0x00, special], false),
                    await this.mapper.properties.player.team[0].speed.setBytes([0x00, speed], false),

                    await this.mapper.properties.player.team[0].move1.setBytes([randomMove1], false),
                    await this.mapper.properties.player.team[0].move2.setBytes([randomMove2], false),
                    await this.mapper.properties.player.team[0].move3.setBytes([randomMove3], false),
                    await this.mapper.properties.player.team[0].move4.setBytes([randomMove4], false),
                    await this.mapper.properties.player.team[0].move1pp.setBytes([randomMove1pp], false),
                    await this.mapper.properties.player.team[0].move2pp.setBytes([randomMove2pp], false),
                    await this.mapper.properties.player.team[0].move3pp.setBytes([randomMove3pp], false),
                    await this.mapper.properties.player.team[0].move4pp.setBytes([randomMove4pp], false),
                ])
            }
            else if (this.mapper.properties.overworld.map.value == "Pallet Town - Oak's Lab" && this.mapper.properties.player.team[0].level.value == 5 && this.mapper.properties.player.teamCount.value == 1 && this.customMoves == true && this.customTrainerID == false) {
                await Promise.all([
                    await this.mapper.properties.player.team[0].dvAttack.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvDefense.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvSpeed.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvSpecial.setBytes([perfectDVs], false),

                    await this.mapper.properties.player.team[0].hp.setBytes([0x00, hitpoints], false), //Apply stat recalculation (don't freeze)
                    await this.mapper.properties.player.team[0].maxHp.setBytes([0x00, hitpoints], false),
                    await this.mapper.properties.player.team[0].attack.setBytes([0x00, attack], false), 
                    await this.mapper.properties.player.team[0].defense.setBytes([0x00, defense], false),
                    await this.mapper.properties.player.team[0].special.setBytes([0x00, special], false),
                    await this.mapper.properties.player.team[0].speed.setBytes([0x00, speed], false),

                    await this.mapper.properties.player.team[0].move1.setBytes([this.customMove1], false),
                    await this.mapper.properties.player.team[0].move2.setBytes([this.customMove2], false),
                    await this.mapper.properties.player.team[0].move3.setBytes([this.customMove3], false),
                    await this.mapper.properties.player.team[0].move4.setBytes([this.customMove4], false),
                    await this.mapper.properties.player.team[0].move1pp.setBytes([this.customMove1pp], false),
                    await this.mapper.properties.player.team[0].move2pp.setBytes([this.customMove2pp], false),
                    await this.mapper.properties.player.team[0].move3pp.setBytes([this.customMove3pp], false),
                    await this.mapper.properties.player.team[0].move4pp.setBytes([this.customMove4pp], false),
                ])
            }
            else if (this.mapper.properties.overworld.map.value == "Pallet Town - Oak's Lab" && this.mapper.properties.player.team[0].level.value == 5 && this.mapper.properties.player.teamCount.value == 1 && this.customMoves == true && this.customTrainerID == true) {
                await Promise.all([
                    await this.mapper.properties.player.team[0].dvAttack.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvDefense.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvSpeed.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvSpecial.setBytes([perfectDVs], false),

                    await this.mapper.properties.player.team[0].hp.setBytes([0x00, hitpoints], false), //Apply stat recalculation (don't freeze)
                    await this.mapper.properties.player.team[0].maxHp.setBytes([0x00, hitpoints], false),
                    await this.mapper.properties.player.team[0].attack.setBytes([0x00, attack], false), 
                    await this.mapper.properties.player.team[0].defense.setBytes([0x00, defense], false),
                    await this.mapper.properties.player.team[0].special.setBytes([0x00, special], false),
                    await this.mapper.properties.player.team[0].speed.setBytes([0x00, speed], false),

                    await this.mapper.properties.player.team[0].move1.setBytes([this.customMove1], false),
                    await this.mapper.properties.player.team[0].move2.setBytes([this.customMove2], false),
                    await this.mapper.properties.player.team[0].move3.setBytes([this.customMove3], false),
                    await this.mapper.properties.player.team[0].move4.setBytes([this.customMove4], false),
                    await this.mapper.properties.player.team[0].move1pp.setBytes([this.customMove1pp], false),
                    await this.mapper.properties.player.team[0].move2pp.setBytes([this.customMove2pp], false),
                    await this.mapper.properties.player.team[0].move3pp.setBytes([this.customMove3pp], false),
                    await this.mapper.properties.player.team[0].move4pp.setBytes([this.customMove4pp], false),
                    
                    await this.mapper.properties.player.team[0].expPoints.setBytes([0x00, 0x10, 0x7A], false),
                    await this.mapper.properties.player.team[0].level.setBytes([this.customLevel], false),
                    await this.mapper.properties.player.team[0].trainerId.setBytes([0x00, 0x00], false),
                ])
            }
            else {
                await Promise.all([ //Set DVs and freeze them even if stat recalculation isn't needed
                    await this.mapper.properties.player.team[0].dvAttack.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvDefense.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvSpeed.setBytes([perfectDVs], false),
                    await this.mapper.properties.player.team[0].dvSpecial.setBytes([perfectDVs], false),
                ])
            }
        }

        // SETTING THE STARTER POKEMON'S STATS ----------------------------------------------------------------------------------------------//
        const optionsSet = async () => {
            const regularOptions = 0xC1
            const championOptions = 0x41
            if (this.mapper.properties.overworld.map.bytes === 0x78)
                await Promise.all([
                    await this.mapper.properties.options.soloChallenge.setBytes([championOptions]),
                ])
            else
                await Promise.all([
                    await this.mapper.properties.options.soloChallenge.setBytes([regularOptions]),
                ])
        }

        // SETTING THE STARTER POKEMON'S STATS ----------------------------------------------------------------------------------------------//
        const trashCans = async () => {
            const solved = 0x03 //0x03 finds first can and solves the puzzle, leaves all trainers battlable
            if (this.mapper.properties.events.trashCanPuzzle.bytes < 3) //check to see if the puzzle is unsolved
                await Promise.all([
                    await this.mapper.properties.events.trashCanPuzzle.setBytes([solved], false), //don't freeze this property
                ])
        }
        //SETTING OVERWORLD ENCOUNTERS & RNG FOR SECOND PLAYTHROUGH OPTIMIZATION ----------------------------------------------------------------//
        const secondPlaythrough = async () => {
            const noEncounters = 0x00
            const viridianForestPidgey = 0x24
            const viridianForestEncounterRate = 0x0A
            const pidgeyLevelFour = 0x04
            const pidgeyLevelSix = 0x06
            const moonparas = 0x6D
            const paraslevelone = 0x0A
            const parasleveltwo = 0x0C
            if (this.secondPlaythrough == true && this.mapper.meta.gameName == `Pokemon Yellow`) {
                if (this.mapper.properties.overworld.map.value == `Route 1` || 
                this.mapper.properties.overworld.map.value == `Route 3` || 
                this.mapper.properties.overworld.map.value == `Route 6` || 
                this.mapper.properties.overworld.map.value == `Route 10` || 
                this.mapper.properties.overworld.map.value == `Mt Moon - 1` || 
                this.mapper.properties.overworld.map.value == `Mt Moon - 2` || 
                this.mapper.properties.overworld.map.value == `Mt Moon - 3` || 
                this.mapper.properties.overworld.map.value == `Rock Tunnel` || 
                this.mapper.properties.overworld.map.value == `Rock Tunnel - 1`) {
                    console.log("secondRun")
                    await Promise.all([
                        await this.mapper.properties.overworld.encounterRate.setBytes([noEncounters], false),
                    ])  
                }
                else if (this.mapper.properties.overworld.map.value == `Viridian Forest`) {
                    await Promise.all([
                        await this.mapper.properties.overworld.encounters.common[0].level.setBytes([pidgeyLevelFour], false),
                        await this.mapper.properties.overworld.encounters.common[0].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.common[1].level.setBytes([pidgeyLevelFour], false),
                        await this.mapper.properties.overworld.encounters.common[1].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.common[2].level.setBytes([pidgeyLevelFour], false),
                        await this.mapper.properties.overworld.encounters.common[2].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.common[3].level.setBytes([pidgeyLevelFour], false),
                        await this.mapper.properties.overworld.encounters.common[3].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.uncommon[0].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.uncommon[0].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.uncommon[1].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.uncommon[1].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.uncommon[2].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.uncommon[2].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.uncommon[3].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.uncommon[3].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounterRate.setBytes([viridianForestEncounterRate], false),
                    ])  
                }
            }
            else if (this.secondPlaythrough == true && this.mapper.meta.gameName == `Pokemon Red and Blue`) {
                if (this.mapper.properties.overworld.map.value == `Route 1` || 
                this.mapper.properties.overworld.map.value == `Route 6` || 
                this.mapper.properties.overworld.map.value == `Route 10` || 
                this.mapper.properties.overworld.map.value == `Mt Moon - 1` || 
                this.mapper.properties.overworld.map.value == `Mt Moon - 2` || 
                this.mapper.properties.overworld.map.value == `Viridian Forest` || 
                this.mapper.properties.overworld.map.value == `Rock Tunnel` || 
                this.mapper.properties.overworld.map.value == `Rock Tunnel - 1`) {
                    console.log("secondRun")
                    await Promise.all([
                        await this.mapper.properties.overworld.encounterRate.setBytes([noEncounters], false),
                    ])  
                }
                else if (this.mapper.properties.overworld.map.value == `Route 3`) {
                    await Promise.all([
                        await this.mapper.properties.overworld.encounters.uncommon[3].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.uncommon[3].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.rare[0].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.rare[0].pokemon.setBytes([viridianForestPidgey], false),
                        await this.mapper.properties.overworld.encounters.rare[1].level.setBytes([pidgeyLevelSix], false),
                        await this.mapper.properties.overworld.encounters.rare[1].pokemon.setBytes([viridianForestPidgey], false),
                    ])  
                }
                else if (this.mapper.properties.overworld.map.value == `Mt Moon - 3`) {
                    await Promise.all([
                        await this.mapper.properties.overworld.encounters.common[0].level.setBytes([paraslevelone], false),
                        await this.mapper.properties.overworld.encounters.common[0].pokemon.setBytes([moonparas], false),
                        await this.mapper.properties.overworld.encounters.common[1].level.setBytes([paraslevelone], false),
                        await this.mapper.properties.overworld.encounters.common[1].pokemon.setBytes([moonparas], false),
                        await this.mapper.properties.overworld.encounters.common[2].level.setBytes([paraslevelone], false),
                        await this.mapper.properties.overworld.encounters.common[2].pokemon.setBytes([moonparas], false),
                        await this.mapper.properties.overworld.encounters.common[3].level.setBytes([paraslevelone], false),
                        await this.mapper.properties.overworld.encounters.common[3].pokemon.setBytes([moonparas], false),
                        await this.mapper.properties.overworld.encounters.common[4].level.setBytes([paraslevelone], false),
                        await this.mapper.properties.overworld.encounters.common[4].pokemon.setBytes([moonparas], false),
                        await this.mapper.properties.overworld.encounters.uncommon[0].level.setBytes([paraslevelone], false),
                        await this.mapper.properties.overworld.encounters.uncommon[0].pokemon.setBytes([moonparas], false),
                        await this.mapper.properties.overworld.encounters.uncommon[1].level.setBytes([parasleveltwo], false),
                        await this.mapper.properties.overworld.encounters.uncommon[1].pokemon.setBytes([moonparas], false),
                        await this.mapper.properties.overworld.encounters.uncommon[2].level.setBytes([parasleveltwo], false),
                        await this.mapper.properties.overworld.encounters.uncommon[2].pokemon.setBytes([moonparas], false),
                        await this.mapper.properties.overworld.encounters.uncommon[3].level.setBytes([parasleveltwo], false),
                        await this.mapper.properties.overworld.encounters.uncommon[3].pokemon.setBytes([moonparas], false),
                        await this.mapper.properties.overworld.encounters.rare[0].level.setBytes([parasleveltwo], false),
                        await this.mapper.properties.overworld.encounters.rare[0].pokemon.setBytes([moonparas], false),
                        await this.mapper.properties.overworld.encounters.rare[1].level.setBytes([parasleveltwo], false),
                        await this.mapper.properties.overworld.encounters.rare[1].pokemon.setBytes([moonparas], false),
                        await this.mapper.properties.overworld.encounterRate.setBytes([0x08], false),
                    ])  
                }
            }
            // else if (this.secondPlaythrough == true && this.mtmoonEncounters == true && this.mapper.meta.gameName == `Pokemon Red and Blue`) {
            //     if ()
            // }
            // else if (this.secondPlaythrough == true && this.mtmoonEncounters == true && this.mapper.meta.gameName == `Yellow`) {

            // }
        }
        
        //Recalculate starting stats when the DVs in slot 1 change (when you receive your starter)
        this.mapper.properties.player.team[0].level.change(async (x) => {
            await setStartingStats()
        })
        this.mapper.properties.player.team[0].dvAttack.change(async (x) => {
            await setStartingStats()
        })
        this.mapper.properties.player.team[0].dvDefense.change(async (x) => {
            await setStartingStats()
        })
        this.mapper.properties.player.team[0].dvSpeed.change(async (x) => {
            await setStartingStats()
        })
        this.mapper.properties.player.team[0].dvSpecial.change(async (x) => {
            await setStartingStats()
        })

        //Whenever the player moves to a different map
        this.mapper.properties.overworld.map.change(async (x) => {
            await optionsSet() //Set options to Fast Text, No Animations, Set Battle (Except during the champion fight)
            await trashCans() //Solve the trash can puzzle if it isn't already solved
            await secondPlaythrough()
        })

        this.mapper.properties.overworld.encounters.common[0].pokemon.change(async (x) => {
            await secondPlaythrough()
        })
        this.mapper.properties.overworld.encounterRate.change(async (x) => {
            await secondPlaythrough()
        })

        // //FIX OF ENEMY BATTLE STATS
        // this.mapper.properties.battle.enemyPokemon.hp.change(async (newProp, oldProp) => {
        //     if (newProp == 0) {
        //         this.slotTimingFix = true    
        //         console.log("SET TRUE")
        //     }
        //     this.mapper.properties.battle.enemyPokemon.partyPos.change(async (x) => {
        //         await this.sleep(300)
        //         console.log("SET FALSE")
        //         this.slotTimingFix = false
        //     })
        // })

        //UNKNOWN DUNGEON
        this.mapper.properties.overworld.map.change(async (prop) => {
            if (prop.value == `Route 24`) {
                await this.mapper.properties.overworld.encounterRate.setBytes([0x00], false)
            }
            if (prop.value == `Unknown Dungeon`) {
                await this.mapper.properties.overworld.encounterRate.setBytes([0x00], true)
                await this.sleep(250)
                await this.mapper.properties.player.joypadSimulation.setBytes([0xFF], true)
            }
        });

        //EXP BAR
        var species = this.s1dynamicReset.species.value;
        var growthRate = this.gen1dataGrowthMovepool.find(y => y.name === species).growth_rate
        var expStats = this.calcExpStats(growthRate, this.mapper.properties.player.team[0].expPoints.value);
        this.$refs.expBar.style.width = (expStats.percent * 100) + "%";
        this.prevSpecies = species
        this.mapper.properties.player.team[0].expPoints.change(async (newProp, oldProp) => {
            if (this.expBarAnimation == true) {
                const currSpecies = this.s1dynamicReset.species.value;
                const growthRate = this.gen1dataGrowthMovepool.find(y => y.name === currSpecies).growth_rate
                const oldExpStats = this.calcExpStats(growthRate, oldProp.value);
                const newExpStats = this.calcExpStats(growthRate, newProp.value);
                const animationMaxDuration = 600

                if (oldProp.value == newProp.value) { return }
                // did we switch out?
                // there is still a bug here. what if we changed to the same species?
                if (this.g1stateVariable == `Overworld` || this.g1stateVariable == "Base Stats") {
                    this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                }
                else if (this.prevSpecies != currSpecies) {
                    // update prevSpecies
                    this.prevSpecies = currSpecies; 
                    // dont animate, just set newExpStats.percent
                    this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                } 
                // same pokemon but exp changed
                else {
                    if (oldExpStats.level == newExpStats.level) {
                        var diffExp = newExpStats.percent - oldExpStats.percent
                        var animationDuration = Math.ceil(diffExp * animationMaxDuration)
                        // animate width to newExpStats.percent
                        this.$refs.expBar.style.transition = `width ${animationDuration}ms ease-in-out`;
                        this.$refs.expBar.style.width = (newExpStats.percent * 100) + "%";
                        await this.sleep(animationDuration + 50);
                    } else {
                        var diffExp1 = 1 - oldExpStats.percent
                        var animationDuration1 = Math.ceil(diffExp1 * animationMaxDuration)
                        var diffExp2 = newExpStats.percent
                        var animationDuration2 = Math.ceil(diffExp2 * animationMaxDuration)
                        // animate width to 100%
                        this.$refs.expBar.style.transition = `width ${animationDuration1}ms ease-in`;
                        this.$refs.expBar.style.width = "100%";
                        await this.sleep(animationDuration1 + 50);
                        // dont animate, set width to 0%
                        this.$refs.expBar.style.transition = null;
                        this.$refs.expBar.style.width = "0%";
                        await this.sleep(50);
                        // animate width from 0% to newExpStats.percent
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