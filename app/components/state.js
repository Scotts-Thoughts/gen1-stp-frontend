const template = `<div></div>`

module.exports = {
    template,
    props: [
        "mapper",
    ],
    mounted: async function () {
        //Update the state to match the mapper's state
        this.$parent.state = this.mapper.properties.meta.state.value
        this.mapper.properties.meta.state.change(async (newProp) => {
            this.$parent.state = newProp.value
        });

        //Update the enemy state to track the enemy's Pokemon's condition
        if (this.mapper.properties.player.team[0].level.value == 0) 
            this.$parent.enemyState = "Not In Battle";
        else if (this.mapper.properties.battle.type.value == "None")
            this.$parent.enemyState = "Not In Battle";
        else if (this.mapper.properties.battle.turnInfo.battleStart.value == 0)
            this.$parent.enemyState = "Battle Starting";
        else if (this.mapper.properties.battle.lowHealthAlarm.value ==  "Disabled")
            this.$parent.enemyState = "Battle Finished";
        else if  (this.mapper.properties.battle.enemyPokemon.hp.value == 0)
            this.$parent.enemyState = "Fainted";
        else if  (this.mapper.properties.battle.enemyPokemon.hp.value > 0 && this.mapper.properties.screen.menu.currentItem.value == 0)
            this.$parent.enemyState = "Pokemon Sent Out";
        else if  (this.mapper.properties.battle.enemyPokemon.hp.value > 0 && this.mapper.properties.screen.menu.currentItem.value > 0)
            this.$parent.enemyState = "Pokemon";
        this.mapper.properties.battle.type.change((prop) => {
            if (prop.value == "Wild" || prop.value == "Trainer") {
                this.$parent.enemyState = "Battle Starting";
            }
        });
        this.mapper.properties.screen.menu.currentItem.change(async (newProp, oldProp) => {
            if ((this.$parent.enemyState == "Fainted" || this.$parent.enemyState == "Battle Starting") && newProp == 0) {
                this.$parent.enemyState = "Pokemon Sent Out"
            }
            if ((this.$parent.enemyState == "Pokemon Sent Out") && newProp > 0) {
                this.$parent.enemyState = "Pokemon"
            }
        });
        this.mapper.properties.battle.turnInfo.battleStart.change((prop) => {
            if (prop.value != 0 && this.state == "To Battle") {
                this.$parent.enemyState = "Pokemon";
            }
        });
        this.mapper.properties.battle.enemyPokemon.hp.change(async (newProp, oldProp) => {
            if (newProp == 0 && this.$parent.enemyState == "Pokemon") {
                this.$parent.enemyState = "Fainting"
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
                this.$parent.enemyState == "Fainting") {
                    this.$parent.enemyState = "Fainted"
                }
        });
        this.mapper.properties.battle.turnInfo.trainerDefeated.change(async (prop) => {
            if (prop == 1) {
                this.$parent.enemyState = "Battle Finished"
            }
        });
    }
}