const template = /*html*/`
    <div>
        <div>Moveset Updating:</div>
        <input type="text" v-model="move1_replacement" placeholder="Input move 1">
        <input type="text" v-model="move2_replacement" placeholder="Input move 2">
        <input type="text" v-model="move3_replacement" placeholder="Input move 3">
        <input type="text" v-model="move4_replacement" placeholder="Input move 4">
        <button class="buttonStyle buttonStyle_column3" @click="update_moveset">Update Party Moves</button>
        <button class="buttonStyle buttonStyle_column3" @click="update_battle_moveset">Update Battle Moves</button>
        <br>
        <br>
        <div>Item Updating:</div>
        <input type="text" v-model="item1_replacement" placeholder="Input item 1">
        <input type="text" v-model="item2_replacement" placeholder="Input item 2">
        <input type="text" v-model="item3_replacement" placeholder="Input item 3">
        <input type="text" v-model="item4_replacement" placeholder="Input item 4">
        <button class="buttonStyle buttonStyle_column3" @click="update_items">Update</button>
        <br>
        <br>
    </div>
`

module.exports = {
    template,
    props: [
        "mapper",
    ],
    data() {
        return {
            move1_replacement: "",
            move2_replacement: "",
            move3_replacement: "",
            move4_replacement: "",
            item1_replacement: "Rare Candy",
            item2_replacement: "PP UP",
            item3_replacement: "Full Restore",
            item4_replacement: "Max Elixer",
        }
    },
    methods: {
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
    }
}