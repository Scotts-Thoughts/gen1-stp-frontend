const app = Vue.createApp({
    //DATA & DEFINITIONS
    data() {
        return {
            ready: false,
            mapper: null,

            // USER CONFIG --------------------------------------------------------------------------------------//
            starter:         147, //select starter
            starterName:     "Dratini", //string name
            overlayName:     "", // add "-yellow" or "-red" here based on the game being played
            secondPlaythrough: false, //used to mitigate luck on second playthroughs
            pick:            true, //turns on the ability to pick your starter
            package:         false, //uses images from package folder, rather than using dynamic values
            movepool:        true, //uses dynamic movepool when in the overworld & in wild battles
            inventory:       true, //uses inventory when in the department store & marts
            battleGraphic:   true, //uses battle graphic with enemy moveset & stats
            showAllTrainers: true, //when false only shows gym leaders and rivals, when true shows all enemy trainers
            trainerArt:      true, //shows custom trainer art
            
            showSpecialTrainerGraphics: false, //shows drawn art for defined trainers
            
            info:              false, //displays behind the scenes info
            typeIcons:         true, //turns on dynamic type icons
            typeCalcs:         true, //calculates effective power based on the pokemon in battle
            overlay:           true, //overrides with starter & fixed ovelay (must be new style)
            
            dResets:            false, //turns on dynamic resets
            dMoveset:           false, //turns on moveset
            dTimer:             false, //turns on timer
            dStats:             false, //turns on stats
            badgesBar:          false, //turns on dynamic badges
            badgeBoostGraphics: true, //turns on opaque badge icons for boosts
            addStabBonus:       true,
            
            // CUSTOM STARTING MOVES
            customMoves: false, //if custom moves is turned off, custom trainer ID will be turned off as well
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
            // g1trainers: g1trainers, //g1trainers
            g1YellowTrainers: g1YellowTrainers,
            g1RedBlueTrainers: g1RedBlueTrainers,
            gameStarted: false,
            
            //LOOPS
            pkmnMoves: ["move1","move2","move3","move4"],
            pkmnSlots: [0, 1, 2, 3, 4, 5],
            boostingBadges: ["badge1", "badge3", "badge6", "badge7"],
            inventorySlots: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19],

            //VARIABLES THAT TRACK IN GAME PROGRESS ------------------------------------------------------------//
            playerId: 999,
            routeEncounters: [],
            route1Encounters: 0,
            forestEncounters: 0,
            mtmoonEncounters: 0,
            totalEncounters:  0,
            totalTrainers:    0,
            centerHeals:  0,
            resets:       0,
            saves:        0,
            badges:       0,
            currentGamestate: "New Game",
            gamestateLogging: false,

            //VARIABLES
            flaggedTrainer: false,

            //VARIABLES THAT STYLE ELEMENTS
            statLabelOpacityValue: .1,
            modColor: true,
            modRaise: "rgb(0, 0, 0)",
            modLower: "rgb(0, 0, 0)",
            modDefault: "rgb(0, 0, 0)",
            ppColor: false,
            ppHigh: "rgb(0, 0, 0)",
            ppMid: "rgb(114, 0, 0)",
            // ppMid: "rgb(121, 72, 0)",
            ppLow: "rgb(114, 0, 0)",

            //GAMESTATE VARIABLE
            g1stateVariable: "Base Stats"
        }
    },
    
    computed: {
        currentTrainer() {
            if (this.mapper.meta.gameName == "Pokemon Yellow") { return g1YellowTrainers[this.mapper.properties.battle.trainer.class.value + " " + this.mapper.properties.battle.trainer.number.value] }
            else if (this.mapper.meta.gameName == "Pokemon Red and Blue") { return g1RedBlueTrainers[this.mapper.properties.battle.trainer.class.value + " " + this.mapper.properties.battle.trainer.number.value] }
            else { return g1YellowTrainers[this.mapper.properties.battle.trainer.class.value + " " + this.mapper.properties.battle.trainer.number.value] }
        },
    },

    //FUNCTIONS -----------------------------------------------------------------------------------------------//
    methods: {
        //REMOVES CAPITALIZATION (TACKLE -> Tackle) OR (Tail Whip -> Tail whip)
        pkmnDataPath() {
            if (this.g1state() == "Overworld" || this.g1state() == "To Battle") {
                return "mapper.properties.player.team[0]"
            }
            else if (this.g1state() == "Battle") {
                return "mapper.properties.battle.yourPokemon"
            }
        },
        camelCase: function (str) {
            if (!str || !str.toString()) { return '' }
            return str.toString().replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
                return index == 0 ? word.toUpperCase() : word.toLowerCase();
            })
        },
        pascalCaseSpace(str) {
            let words = str.split(' ');
            for (let char of words) {
                words[words.indexOf(char)] = char.charAt(0).toUpperCase() + char.slice(1);
            }
            return words.join(' ');
        },
        pascalCaseDot(str) {
            let words = str.split('.');
            for (let char of words) {
                words[words.indexOf(char)] = char.charAt(0).toUpperCase() + char.slice(1);
            }
            return words.join(' ');
        },
        statExp(statExp, label) { //statExp = mapper.properties.player.team[0].statExpAttack.value
            vitaminsUsed = (statExp / 2560)
            usableVitamins = Math.ceil(10 - vitaminsUsed)
            if (usableVitamins < 0) {
                return 0
            }
            else {
                return usableVitamins
            }
        },
        department(getMart) {
            if (getMart == `Department`) {
                return 0
            }
            else return 1
        },
        trainerName(trainerClass) {
            if (trainerClass == "RIVAL1" || trainerClass == "RIVAL2" || trainerClass == "RIVAL3")
                return "Rival"
            else
                return trainerClass
        },
        //TYPE ICONS FOR THE STARTER SELECTION
        getStarterType1() {
            if (this.pick == true)
                var type = this.gen1data.find(y => y.dexNumber === this.starter)
                var lowerType = type.type1.toLowerCase()
                // console.log(`images/elements/types/${lowerType}.png`)
                return `images/elements/types/${lowerType}.png`
        },
        getStarterType2() {
            if (this.pick == true)
                var type = this.gen1data.find(y => y.dexNumber === this.starter)
                if (type.type2 != null) {
                    var lowerType = type.type2.toLowerCase()
                    // console.log(`images/elements/types/${lowerType}.png`)
                    return `images/elements/types/${lowerType}.png`
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
        
        //STATUS CONDITION FUNCTIONS
        statusCheck(y) {
            if (y == null)
                return " "
            else
                return y
        },

        //GENERAL FUNCTIONS
        nullCheck(y) {
            if (y != null || y != undefined)
                return y
            else
                return " "
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
        statLabelColor(x) {
            if (this.modColor == true)
                if (x.bytes > 7)
                    return this.modRaise
                else if (x.bytes < 7)
                    return this.modLower
                else
                    return this.modDefault
            else
                return this.modDefault
        },
        ppValueColor(x) {
            if (this.ppColor == true)
                if (x <= 5 && x > 1)
                    return this.ppMid
                else if (x <= 1)
                    return this.ppLow
                else
                    return this.ppHigh
            else
                return this.ppHigh
        },
        species(x) {
            if (x != null && x.value != null)
                return x.value.name
            else
                return null
        },

        inventoryDisplayItem(item) {
            if (item == "--End of list--") {
                return " "
            }
            else return item
        },

        inventoryDisplayQuality(item, quantity) {
            if (item == "--End of list--") {
                return " "
            }
            else return quantity
        },

        //MOVE ICON DISPLAY
        moveTypeIcon(y) { //y = move1.value
            if (y != null && y != undefined) {
                var move = this.gen1moves.find(x => x.Move.toUpperCase() === y)
                var moveType = move[`Type`].toLowerCase()
                return `images/elements/type-icons/${moveType}.png`
            }
            return null
        },

        //BATTLE STATE
        currentBattleState() {
            //BATTLE
            //OAK CATCHING STARTER
            if (this.mapper.properties.battle.specialType.value === `Oak Catching Starter`) {
                return 0 //base stats (tutorial)
            }
            else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.turnInfo.battleStart.value >= 1 && this.mapper.properties.battle.type.bytes >= 1) {
                return 4 //battle
            }
            else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.turnInfo.battleStart.value === 0 && this.mapper.properties.battle.type.bytes >= 1) {
                return 2 //to battle
            }
            else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.type.value === `None`) {
                return 2 //overworld
            }
            else
                return 0 //base stats
        },
        setGamestate(state, number) {
            if (this.gamestateLogging == true)
                // console.log("Gamestate: "+"("+number+") "+state)
            this.currentGamestate = string
            return string
        },
        g1state() {
            if (this.mapper.properties.battle.specialType.value === `Oak Catching Starter`) {
                string = "Base Stats"
                gamestate = 1
                return this.setGamestate(string, gamestate)
            }
            else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.turnInfo.battleStart.value >= 1 && this.mapper.properties.battle.type.bytes >= 1 && this.mapper.properties.battle.lowHealthAlarm.value == "Disabled") {
                string = "From Battle"
                gamestate = 2
                return this.setGamestate(string, gamestate)
            }
            else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.turnInfo.battleStart.value >= 1 && this.mapper.properties.battle.type.bytes >= 1) {
                string = "Battle"
                gamestate = 2
                return this.setGamestate(string, gamestate)
            }
            else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.turnInfo.battleStart.value === 0 && this.mapper.properties.battle.type.bytes >= 1) {
                string = "To Battle"
                gamestate = 3
                return this.setGamestate(string, gamestate)
            }
            else if (this.mapper.properties.player.team[0].level > 0 && this.mapper.properties.battle.type.value === `None`) {
                string = "Overworld"
                gamestate = 4
                return this.setGamestate(string, gamestate)
            }
            else {
                string = "Base Stats"
                gamestate = 5
                return this.setGamestate(string, gamestate)
            }
        },

        g1trainer(x, y) {
            return (x + " " + y)
        },
        currentTrainer() {
            return (this.mapper.properties.battle.trainer.class.value + " " + this.mapper.properties.battle.trainer.number.value)
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
                (trainerClass == "HIKER" && this.mapper.properties.battle.trainer.number == 9) || //self destructing hiker
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
            if (this.mapper.meta.gameName == "Pokemon Yellow") {
                if (trainerName == "RIVAL1" && trainerNumber == 1) {
                    return "rival1's team"
                }
                else if (trainerName == "RIVAL1" && trainerNumber == 2) {
                        return "rival1A's team"
                }
                else if (trainerName == "RIVAL1" && trainerNumber == 3) {
                        return "rival2's team"
                }
                else if (trainerName == "RIVAL2" && trainerNumber == 1) {
                        return "rival3's team"
                }
                else if (trainerName == "RIVAL2" && (trainerNumber == 2 || trainerNumber == 3 || trainerNumber == 4)) {
                        return "rival4's team"
                }
                else if (trainerName == "RIVAL2" && (trainerNumber == 5 || trainerNumber == 6 || trainerNumber == 7)) {
                        return "rival5's team"
                }
                else if (trainerName == "RIVAL2" && (trainerNumber == 8 || trainerNumber == 9 || trainerNumber == 10)) {
                        return "rival6's team"
                }
                // else if (trainerName == "JR TRAINER F" && trainerNumber == 5) {
                //     return "WRAPPING LASS"
                // }
                // else if (trainerName == "JR TRAINER F" && trainerNumber == 10) {
                //     return "STATUS CONDITION JR"
                // }
                // else if (trainerName == "HIKER" && trainerNumber == 9) {
                //     return "SELF-DESTRUCTING HIKER"
                // }
                else if (trainerName == "RIVAL3") {
                    return "champion's team"
                }
                else {
                    return trainerName.toLowerCase() + "'s team"
                }
            }
            else if (this.mapper.meta.gameName == "Pokemon Red and Blue") {
                if (trainerName == "RIVAL1" && trainerNumber == 1 || trainerName == "RIVAL1" && trainerNumber == 2 || trainerName == "RIVAL1" && trainerNumber == 3) {
                    return "rival1's team"
                }
                else if (trainerName == "RIVAL1" && trainerNumber == 4 || trainerName == "RIVAL1" && trainerNumber == 5 || trainerName == "RIVAL1" && trainerNumber == 6) {
                        return "rival1A's team"
                }
                else if (trainerName == "RIVAL1" && trainerNumber == 7 || trainerName == "RIVAL1" && trainerNumber == 8 || trainerName == "RIVAL1" && trainerNumber == 9) {
                        return "rival2's team"
                }
                else if (trainerName == "RIVAL2" && trainerNumber == 1 || trainerName == "RIVAL2" && trainerNumber == 2 || trainerName == "RIVAL2" && trainerNumber == 3) {
                        return "rival3's team"
                }
                else if (trainerName == "RIVAL2" && trainerNumber == 4 || trainerName == "RIVAL2" && trainerNumber == 5 || trainerName == "RIVAL2" && trainerNumber == 6) {
                        return "rival4's team"
                }
                else if (trainerName == "RIVAL2" && trainerNumber == 7 || trainerName == "RIVAL2" && trainerNumber == 8 || trainerName == "RIVAL2" && trainerNumber == 9) {
                        return "rival5's team"
                }
                else if (trainerName == "RIVAL2" && trainerNumber == 10 || trainerName == "RIVAL2" && trainerNumber == 11 || trainerName == "RIVAL2" && trainerNumber == 12) {
                        return "rival6's team"
                }
                else if (trainerName == "RIVAL3") {
                    return "champion's team"
                }
                else {
                    return trainerName.toLowerCase() + "'s team"
                }
            }
        },

        specialTrainerGraphics() {
            if (this.showSpecialTrainerGraphics) {
                if (this.mapper.properties.battle.trainer.class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 5) return "images/trainers/Wrapping_Lass.png"
                else if (this.mapper.properties.battle.trainer.class == "POKEMANIAC" && this.mapper.properties.battle.trainer.number == 7) return "images/trainers/Pokemaniac.png"
                else if (this.mapper.properties.battle.trainer.class == "JR TRAINER F" && this.mapper.properties.battle.trainer.number == 10) return "images/trainers/PowdersJrTrainer.png"
                else if (this.mapper.properties.battle.trainer.class == "ROCKET" && this.mapper.properties.battle.trainer.number == 38) return "images/trainers/HypnoRocket.png"
                else if (this.mapper.properties.battle.trainer.class == "HIKER" && this.mapper.properties.battle.trainer.number == 9) return "images/trainers/Self-DestructingHiker.png"
                else if (this.mapper.properties.battle.trainer.class == "BROCK") return "images/trainers/brock.png"
                else if (this.mapper.properties.battle.trainer.class == "MISTY") return "images/trainers/misty.png"
                else if (this.mapper.properties.battle.trainer.class == "LT.SURGE") return "images/trainers/ltsurge.png"
                else if (this.mapper.properties.battle.trainer.class == "ERIKA") return "images/trainers/erika.png"
                else if (this.mapper.properties.battle.trainer.class == "KOGA") return "images/trainers/koga.png"
                else if (this.mapper.properties.battle.trainer.class == "SABRINA") return "images/trainers/sabrina.png"
                else if (this.mapper.properties.battle.trainer.class == "BLAINE") return "images/trainers/blaine.png"
                else if (this.mapper.properties.battle.trainer.class == "GIOVANNI" && this.mapper.properties.battle.trainer.number == 3) return "images/trainers/giovanni.png"
                else return null;
            }
        },

        g1martSelector(map) { //map value
            if (this.inventory == false) {
                return "Overworld"
            }
            else if (map == "Viridian City - Mart" ||
            map == "Pewter City - Mart" ||
            map == "Cerulean City - Mart" ||
            map == "Vermilion City - Mart" ||
            map == "Lavender Town - Mart" ||
            map == "Fuchsia City - Mart" ||
            map == "Cinnabar Island - Mart" ||
            map == "CINNABAR_MART_COPY" ||
            map == "Saffron City - Mart" ||
            map == "Indigo Plateau - Lobby" ||
            map == "Celadon City - Pokecenter" ||
            map == "Saffron City - Pokecenter"
            ) {
                return "Mart" //currently unused
            }
            else if (map == "Celadon City - Department Store - 1F" ||
            map == "Celadon City - Department Store - 2F" ||
            map == "Celadon City - Department Store - 3F" ||
            map == "Celadon City - Department Store - 4F" ||
            map == "Celadon City - Department Store - 5F" ||
            map == "Celadon City - Department Store - Roof" ||
            map == "Celadon City - Department Store - Elevator") {
                return "Department" //shows vitamins
            }
            else if (map == "Cinnabar Mansion" ||
            map == "Safari Zone (Center)" ||
            map == "Safari Zone (East)" ||
            map == "Safari Zone (North)" ||
            map == "Safari Zone (West)" ||
            map == "Safari Zone - Secret House"
            ) { //show vitamins in mansion & safari zone
                return "Department" //shows vitamins
            }
            else {
                return "Overworld" //shows regular stat labels
            }
        },

        battlePokemonCrop() {
            if (this.mapper.properties.battle.trainer.totalPokemon == 1) {
                return "height: 242px;"
            }
            else if (this.mapper.properties.battle.trainer.totalPokemon == 2) {
                return "height: 402px;"
            }
            else if (this.mapper.properties.battle.trainer.totalPokemon == 3) {
                return "height: 562px;"
            }
            else if (this.mapper.properties.battle.trainer.totalPokemon == 4) {
                return "height: 722px;"
            }
            else if (this.mapper.properties.battle.trainer.totalPokemon == 5) {
                return "height: 888px;"
            }
            else if (this.mapper.properties.battle.trainer.totalPokemon == 6) {
                return "height: 1080px;"
            }
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
        
        //INVENTORY FUNCTIONS
        itemCheck(y) {
            if (y == "--End of list--") return " ";
            return y;
        },
        ifZero(y) {
            if (y != 0) return y;
            return " ";
        },
        gameName() {
            if (this.mapper.meta.gameName == `Pokemon Yellow`) {
                // console.log(this.mapper.meta.gameName)    
                return this.mapper.meta.gameName
            }
            else if (this.mapper.meta.gameName == `Pokemon Crystal`) {
                // console.log(this.mapper.meta.gameName) 
                return this.mapper.meta.gameName
            }

            else if (this.mapper.meta.gameName == `Pokemon Red and Blue`) {
                // console.log(this.mapper.meta.gameName) 
                return `Pokemon Yellow`
            }

            else if (this.mapper.meta.gameName == `Pokemon Gold and Silver`) {
                // console.log(this.mapper.meta.gameName) 
                return `Pokemon Crystal`
            }
            else
                return `Pokemon Yellow`
        },

        //EXPERIENCE FUNCTIONS
        expPercent(x) {
            if (this.mapper.properties.player.team[0].species.value != null) {
                var growthRate = this.gen1dataGrowthMovepool.find(y => y.name === x.species.value)
                if (growthRate.growth_rate == "Slow") {
                    // console.log(`Slow`)
                    return this.expPercentSlow(x)
                }
                else if (growthRate.growth_rate == "Medium Slow") {
                    // console.log(`Medium Slow`)
                    return this.expPercentMediumSlow(x)
                }
                else if (growthRate.growth_rate == "Medium Fast") {
                    // console.log(`Medium Fast`)
                    return this.expPercentMediumFast(x)
                }
                else if (growthRate.growth_rate == "Fast") {
                    // console.log(`Fast`)
                    return this.expPercentFast(x)
                }
                else    
                    return 0
            }
            return 0
        },
        expPercentFast(x) {
            expBar = ((x.expPoints.value) - ((4 * (Math.pow(x.level.value, 3))) / 5)) / (((4 * (Math.pow(x.level.value + 1, 3))) / 5) - ((4 * (Math.pow(x.level.value, 3))) / 5)) // errors could lurk here
            // console.log(expBar)
            if ((expBar*100) > 100)
                return 100
            else if ((expBar*100) < 0)
                return 0
            else
                return expBar * 100
        },
        expPercentMediumFast(x) {
            expBar = (((x.expPoints.value) - (Math.pow(x.level.value, 3))) / ((Math.pow(x.level.value + 1, 3)) - (Math.pow(x.level.value, 3))))
            // console.log(expBar)
            
            if ((expBar*100) > 100)
                return 100
            else if ((expBar*100) < 0)
                return 0
            else
                return expBar * 100
        },
        expPercentMediumSlow(x) { //this formula may be incorrect
            var medSlow = (((((6 / 5) * (Math.pow(x.level.value, 3))) - (15 * (Math.pow(x.level.value, 2))) + (100 * x.level.value) - 140)))
            expBar = (((x.expPoints.value) - medSlow) / ((((((6 / 5) * (Math.pow((x.level.value + 1), 3))) - (15 * (Math.pow((x.level.value + 1), 2))) + (100 * (x.level.value + 1)) - 140))) - medSlow)) // errors could lurk here
            // console.log(expBar)
            if ((expBar*100) > 100)
                return 100
            else if ((expBar*100) < 0)
                return 0
            else
                return expBar * 100
        },
        expPercentSlow(x) {
            expBar = (((x.expPoints.value) - (Math.floor((5 * (Math.pow(x.level.value, 3))) / 4))) / ((Math.floor((5 * (Math.pow(x.level.value + 1, 3))) / 4)) - (Math.floor((5 * (Math.pow(x.level.value, 3))) / 4)))) // errors could lurk here
            // console.log(expBar)
            
            if ((expBar*100) > 100)
                return 100
            else if ((expBar*100) < 0)
                return 0
            else
                return expBar * 100
        },

        // MOVE MANAGEMENT
        movePower(y) { //y = move1.value
            if (y) {
                var move = this.gen1moves.find(x => x.Move.toUpperCase() === y)
                if (move) return move.Power
            }
            return null
        },
        moveType(y) { //y = move1.value
            if (y) {
                var move = this.gen1moves.find(x => x.Move.toUpperCase() === y)
                if (move) return move.Type
            }
            return null
        },

        // TYPE EFFECTIVENESS
        checkTypes(x, y) { //x = type1.value, y = type2.value
            if (x.value == y.value)
                return true
            else
                return false
        },
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
        typeEffectiveness(x) { //x = move1.value
            if (this.g1stateVariable == "Battle") {
                var stab = this.determineSTAB(x)
                if (x != null) {
                    if (this.typeCalcs == true && this.mapper.properties.battle.turnInfo.battleStart.value >= 1 && this.mapper.properties.battle.type.bytes >= 1) { //calculates effective power when in battle
                        var attackingType = this.moveType(x)
                        var defendingTypeMono = this.mapper.properties.battle.enemyPokemon.type1.value
                        var defendingType1 = this.mapper.properties.battle.enemyPokemon.type1.value
                        var defendingType2 = this.mapper.properties.battle.enemyPokemon.type2.value
                        var multipliers = this.typeData.find(x => x.moveType === attackingType)
                        //NO MOVE POWER (STATUS MOVE)
                        if (this.movePower(x) == "-") {
                            return this.movePower(x)
                        }
                        //NO ENEMY DATA (HAVEN'T BATTLED SINCE RELOADING ROM OR SAVE)
                        else if (this.mapper.properties.battle.enemyPokemon.type1 == null) {
                            return Math.floor(this.movePower(x) * stab)
                        }
                        //ATTACKING A MONO-TYPE POKEMON
                        else if (this.mapper.properties.battle.enemyPokemon.type1.value === this.mapper.properties.battle.enemyPokemon.type2.value) {
                            var multiplier1 = multipliers[defendingTypeMono]
                            return Math.floor(this.movePower(x) * multiplier1 * stab)
                        }
                        //ATTACKING A DUAL-TYPE POKEMON
                        else if (this.mapper.properties.battle.enemyPokemon.type1 != this.mapper.properties.battle.enemyPokemon.type2) {
                            var multipliers = this.typeData.find(x => x.moveType === attackingType)
                            var multiplier1 = multipliers[defendingType1]
                            var multiplier2 = multipliers[defendingType2]
                            return Math.floor(this.movePower(x) * multiplier1 * multiplier2 * stab)
                        }
                        //RETURN THE MOVES POWER IF NOTHING ELSE WORKS
                        else
                            return this.movePower(x) //returns the move's base power if not in battle
                    }
                    //RETURN THE MOVE'S POWER IF NOT IN BATTLE
                    else {
                        if (this.movePower(x) == "-") {
                            return this.movePower(x)
                        }
                        else {
                            return Math.floor(this.movePower(x) * stab) //returns the move's base power if not in battle
                        }
                    } 
                }
                else {
                    //  console.log("Broken - likely bug")
                     return ""
                }
            }
            else { return this.movePower(x) }
        },
        
        //BADGE BOOSTS
        badgeBoost(badge, stat) {
            if (badge == true)
                return Math.floor(stat * 1.125)
            else
                return stat
        },
        
        logicalStatementCheck() {
            if (this.mapper.properties.overworld.map.value == "Pallet Town - Oak's Lab" && this.mapper.properties.player.team[0].level.value == 5 && this.mapper.properties.player.teamCount.value == 1)
                return true
            else
                return false
        },

        hpDvCalculation() {
            return (((this.mapper.properties.player.team[0].dvAttack.value % 2) * 8) + ((this.mapper.properties.player.team[0].dvDefense.value % 2) * 4) + ((this.mapper.properties.player.team[0].dvSpeed.value % 2) * 2) + ((this.mapper.properties.player.team[0].dvSpecial.value % 2) * 1))
        },
    },

//--------- PROGRAM MOUNTED ---------------------------------------------------------------------------------------------------------------//
    mounted: async function () {
        const that = this
        this.mapper = new GameHookMapperClient()
        this.mapper.onConnected = (x) => this.ready = true
        this.mapper.onDisconnected = (x) => this.ready = false
        await this.mapper.connect()

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
            } else if (this.g1stateVariable == "Base Stats") {
                this.g1stateVariable = "Overworld";
            }
        });

        this.mapper.properties.battle.type.change((prop) => {
            if (this.g1stateVariable == "Base Stats") return; // ignore everything if we still dont have a pokemon

            if (prop.value == "Wild" || prop.value == "Trainer") {
                // this.mapper.properties.battle.yourPokemon.battleStatMaxHp.setBytes([this.mapper.properties.player.team[0].maxHp.bytes],false)
                // this.mapper.properties.battle.yourPokemon.battleStatAttack.setBytes([this.mapper.properties.player.team[0].attack.bytes],false)
                // this.mapper.properties.battle.yourPokemon.battleStatDefense.setBytes([this.mapper.properties.player.team[0].defense.bytes],false)
                // this.mapper.properties.battle.yourPokemon.battleStatSpeed.setBytes([this.mapper.properties.player.team[0].speed.bytes],false)
                // this.mapper.properties.battle.yourPokemon.battleStatSpecial.setBytes([this.mapper.properties.player.team[0].special.bytes],false)
                this.g1stateVariable = "To Battle";
            } else if (prop.value == "None") {
                this.g1stateVariable = "Overworld";
            }
        });

        this.mapper.properties.battle.turnInfo.battleStart.change((prop) => {
            if (this.g1stateVariable == "Base Stats") return; // ignore everything if we still dont have a pokemon

            if (prop.value != 0) {
                this.g1stateVariable = "Battle";
            }
        });

        this.mapper.properties.battle.lowHealthAlarm.change((prop) => {
            if (this.g1stateVariable == "Base Stats") return; // ignore everything if we still dont have a pokemon

            if (prop.value == "Disabled") {
                this.g1stateVariable = "From Battle";
            }
        });

        // Route 1 Encounters
        // This code tracks the number of wild encounters on Route 1
        this.mapper.properties.battle.type.change(function (x) {
            if (that.mapper.properties.battle.type.value == `Wild` && that.mapper.properties.overworld.map.value == `Route 1`) {
                that.route1Encounters += 1
            }
        })

        // Viridian Forest Encounters
        // This code tracks the number of wild encounters in Viridian Forest
        this.mapper.properties.battle.type.change(function (x) {
            if (that.mapper.properties.battle.type.value == `Wild` && that.mapper.properties.overworld.map.value == `Viridian Forest`) {
                that.forestEncounters += 1
            }
        })

        // Mt Moon Encounters
        // This code tracks the number of wild encounters in Mt Moon
        this.mapper.properties.battle.type.change(function (x) {
            if (that.mapper.properties.battle.type.value == `Wild` && that.mapper.properties.overworld.map.bytes >= 0x3B && that.mapper.properties.overworld.map.bytes <= 0x3D) {
                that.mtmoonEncounters += 1
            }
        })

        // Wild Encounters
        // This code tracks the total number of wild encounters
        this.mapper.properties.battle.type.change(function (x) {
            if (that.mapper.properties.battle.type.value == `Wild` && that.mapper.properties.overworld.map.value != `Pallet Town` && that.mapper.properties.overworld.map.value != `Viridian City`) {
                that.totalEncounters += 1
            }
        })

        // Wild Encounters
        // This code tracks the total number of wild encounters
        this.mapper.properties.battle.type.change(function (x) {
            if (that.mapper.properties.battle.type.value == `Wild`) {
                const mapValue = that.mapper.properties.overworld.map.value;

                if (!that.routeEncounters[mapValue]) { that.routeEncounters[mapValue] = 1 }
                else { that.routeEncounters[mapValue] += 1 }
            }
        })

        // Trainer Battles
        // This code tracks the number of trainer battles that occur
        this.mapper.properties.battle.type.change(function (x) {
            if (that.mapper.properties.battle.type.value == `Trainer`) {
                that.totalTrainers += 1
            }
        })

        // Heals 
        // This code tracks the number of times the player uses the center to heal
        this.mapper.properties.audio.channel1.change(function (x) {
            if (that.mapper.properties.audio.channel1.bytes == 0xE8) {
                that.centerHeals += 1
            }
        })

        // Saves 
        // This code tracks the number of times the player saves the games
        this.mapper.properties.audio.channel5.change(function (x) {
            if (that.mapper.properties.audio.channel5.bytes == 0xB6) {
                that.saves += 1
            }
        })

        // player ID updating
        this.mapper.properties.player.playerId.change(function (x) {
            if (that.mapper.properties.player.playerId.value > 0 && that.mapper.properties.player.playerId.value != that.playerId) {
                that.playerId = that.mapper.properties.player.playerId.value
                that.routeEncounters = []
                that.route1Encounters = 0
                that.forestEncounters = 0
                that.mtmoonEncounters = 0
                that.totalEncounters = 0
                that.totalTrainers = 0
                that.centerHeals = 0
                that.saves = 0
                that.resets = 0
                console.log(`Player ID Changed - new run detected`)
            }
        })
        this.mapper.properties.gameTime.seconds.change(function (x) {
            if (that.mapper.properties.player.playerId.value > 0 && that.mapper.properties.player.playerId.value != that.playerId) {
                that.playerId = that.mapper.properties.player.playerId.value
            }
        })

        // reset tracking
        this.mapper.properties.player.playerId.change(function (x) {
            console.info(x)
            if (that.playerId == 99999) {
                console.log(`Game Started - Player ID Recorded`)
            }
            else if (that.mapper.properties.player.playerId.value == 0 && that.playerId > 0) {
                console.log(`Reset`)
                that.resets += 1
            }
        })

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
        }

        // ---------------------------------------------------------------------------------------------------------------------//
        // MODIFY GAMEHOOK PROPERTIES ------------------------------------------------------------------------------------------//
        // ---------------------------------------------------------------------------------------------------------------------//
        
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
    },
}).mount('#app')