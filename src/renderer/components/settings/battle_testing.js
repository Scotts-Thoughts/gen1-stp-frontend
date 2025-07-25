import { defineComponent } from "vue";
import PokeData from "~/logic/PokeData";
import { move_name } from "../../methods/text_functions";

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

export default defineComponent({
    template,
    inject: [
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
        move_name,
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
            const moveName1 = this.move1_replacement.toUpperCase();
            const moveName2 = this.move2_replacement.toUpperCase();
            const moveName3 = this.move3_replacement.toUpperCase();
            const moveName4 = this.move4_replacement.toUpperCase();
            if (moveName1 !== "") {
                const move1   = PokeData.getMove(this.move_name(moveName1));
                await this.mapper.properties.player.team[0].move1.set(moveName1, false)
                await this.mapper.properties.player.team[0].move1pp.set(move1.pp, false)
            }
            if (moveName2 !== "") {
                const move2   = PokeData.getMove(this.move_name(moveName2));
                await this.mapper.properties.player.team[0].move2.set(moveName2, false)
                await this.mapper.properties.player.team[0].move2pp.set(move2.pp, false)
            }
            if (moveName3 !== "") {
                const move3   = PokeData.getMove(this.move_name(moveName3));
                await this.mapper.properties.player.team[0].move3.set(moveName3, false)
                await this.mapper.properties.player.team[0].move3pp.set(move3.pp, false)
            }
            if (moveName4 !== "") {
                const move4   = PokeData.getMove(this.move_name(moveName4));
                await this.mapper.properties.player.team[0].move4.set(moveName4, false)
                await this.mapper.properties.player.team[0].move4pp.set(move4.pp, false)
            }
        },
        async update_battle_moveset() {
            if (this.mapper.properties.meta.state.value !== "Battle") {
                return;
            }
            const moveName1 = this.move1_replacement.toUpperCase();
            const moveName2 = this.move2_replacement.toUpperCase();
            const moveName3 = this.move3_replacement.toUpperCase();
            const moveName4 = this.move4_replacement.toUpperCase();
            if (move1 !== "") {
                const move1   = move_data[this.move_name(moveName1)];
                await this.mapper.properties.battle.yourPokemon.move1.set(move1, false)
                await this.mapper.properties.battle.yourPokemon.move1pp.set(move1.PP, false)
            }
            if (move2 !== "") {
                const move2   = move_data[this.move_name(moveName2)];
                await this.mapper.properties.battle.yourPokemon.move2.set(move2, false)
                await this.mapper.properties.battle.yourPokemon.move2pp.set(move2.PP, false)
            }
            if (move3 !== "") {
                const move3   = move_data[this.move_name(moveName3)];
                await this.mapper.properties.battle.yourPokemon.move3.set(move3, false)
                await this.mapper.properties.battle.yourPokemon.move3pp.set(move3.PP, false)
            }
            if (move4 !== "") {
                const move4   = move_data[this.move_name(moveName4)];
                await this.mapper.properties.battle.yourPokemon.move4.set(move4, false)
                await this.mapper.properties.battle.yourPokemon.move4pp.set(move4.PP, false)
            }            
        },
    }
});