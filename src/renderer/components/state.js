import { defineComponent } from "vue";
import { GameState, useMetaStore } from "../stores/metaStore";

const template = `<div></div>`

export default defineComponent({
    template,
    inject: [
        "game_properties",
    ],
    data() {
        return { meta: useMetaStore() };
    },
    methods: {
        updateCurrentSpecies() {
            console.log("state.updateCurrentSpecies", this.getCurrentSpecies());
            this.meta.setCurrentSpecies(this.getCurrentSpecies());
        },
        getCurrentSpecies() {
            if (this.meta.gameState === GameState.in_battle) {
                const battle_species = this.game_properties?.battle?.yourPokemon.species.value;
                if (!battle_species) {
                    return this.meta.starter;
                }
                if (this.game_properties.player.team[0].species.value == "Backport") {
                    return this.meta.starter;
                }
                return battle_species;
            } else if (this.meta.gameState === GameState.no_pokemon || this.game_properties?.player?.team[0].species.value == null) {
                return this.meta.starter;
            } else {
                const party_species = this.game_properties.player.team[0].species.value;
                if (!party_species) {
                    return this.meta.starter
                }
                if (party_species == "Backport") {
                    return this.meta.starter
                }
                return party_species;
            }
        },
    },
    watch: {
        "meta.gameState"() {
            this.updateCurrentSpecies();
        },
        "meta.starter"() {
            this.updateCurrentSpecies();
        }
    },
    mounted: async function () {
        //Update the state to match the mapper's state
        this.meta.setGameState(this.game_properties.meta.state.value);
        
        this.meta.setCurrentSpecies(this.getCurrentSpecies());

        this.game_properties.meta.state.change(async (newProp) => {
            this.meta.setGameState(newProp.value);
        });

        // handle potential changes of current species:
        this.game_properties?.battle?.yourPokemon.species.change(this.updateCurrentSpecies);
        this.game_properties.player.team[0].species.change(this.updateCurrentSpecies);

        //Update the enemy state to track the enemy's Pokemon's condition
        if (this.game_properties.player.team[0].level.value == 0) 
            this.meta.setEnemyState("Not In Battle");
        else if (this.game_properties.battle.type.value == "None")
            this.meta.setEnemyState("Not In Battle");
        else if (this.game_properties.battle.turnInfo.battleStart.value == 0)
            this.meta.setEnemyState("Battle Starting");
        else if (this.game_properties.battle.lowHealthAlarm.value ==  "Disabled")
            this.meta.setEnemyState("Battle Finished");
        else if  (this.game_properties.battle.enemyPokemon.hp.value == 0)
            this.meta.setEnemyState("Fainted");
        else if  (this.game_properties.battle.enemyPokemon.hp.value > 0 && this.game_properties.screen.menu.currentItem.value == 0)
            this.meta.setEnemyState("Pokemon Sent Out");
        else if  (this.game_properties.battle.enemyPokemon.hp.value > 0 && this.game_properties.screen.menu.currentItem.value > 0)
            this.meta.setEnemyState("Pokemon");
        this.game_properties.battle.type.change((prop) => {
            if (prop.value == "Wild" || prop.value == "Trainer") {
                this.meta.setEnemyState("Battle Starting");
            }
        });
        this.game_properties.screen.menu.currentItem.change(async (newProp, oldProp) => {
            if ((this.meta.enemyState === "Fainted" || this.meta.enemyState === "Battle Starting") && newProp == 0) {
                this.meta.setEnemyState("Pokemon Sent Out");
            }
            if ((this.meta.enemyState === "Pokemon Sent Out") && newProp > 0) {
                this.meta.setEnemyState("Pokemon");
            }
        });
        this.game_properties.battle.turnInfo.battleStart.change((prop) => {
            if (prop.value != 0 && this.state == "To Battle") {
                this.meta.setEnemyState("Pokemon");
            }
        });
        this.game_properties.battle.enemyPokemon.hp.change(async (newProp, oldProp) => {
            if (newProp == 0 && this.meta.enemyState == "Pokemon") {
                this.meta.setEnemyState("Fainting");
            }
        });
        this.game_properties.screen.tiles.column1.tile7.change((prop) => {
            if (prop == 127 && 
                this.game_properties.screen.tiles.column1.tile6 == 127 && 
                this.game_properties.screen.tiles.column1.tile5 == 127 && 
                this.game_properties.screen.tiles.column1.tile4 == 127 && 
                this.game_properties.screen.tiles.column1.tile3 == 127 && 
                this.game_properties.screen.tiles.column1.tile2 == 127 && 
                this.game_properties.screen.tiles.column1.tile1 == 127 &&
                this.meta.enemyState === "Fainting"
            ) {
                this.meta.setEnemyState("Fainted");
            }
        });
        this.game_properties.battle.turnInfo.trainerDefeated.change(async (prop) => {
            if (prop == 1) {
                this.meta.setEnemyState("Battle Finished");
            }
        });
    }
});