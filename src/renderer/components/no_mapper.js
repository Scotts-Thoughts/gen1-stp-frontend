import { defineComponent } from "vue";
import PokeData from "../logic/PokeData";
import { useMetaStore } from "../stores/metaStore";

const template = /*html*/`
    <div>
        <div>Game:</div>
            <select v-model="this.game_selection" class="dropdownMenu dropdown_menu_column3">
                <option>Yellow</option>
                <option v-if="isRelease == false">Yellow Legacy</option>
                <option>Red</option>
                <option>Blue</option>
            </select><br>
            <div>Solo Pokemon:</div>
            <select v-model="meta.starter" class="dropdownMenu dropdown_menu_column3" style="background-color: rgb(201, 199, 100)">
                <option disabled value="">Select a species</option>
                <option v-for="key in filtered_pokemon_list" :value="key">{{key}}</option>
                <option>Pikachu</option>
            </select><br>
    </div>
`

export default defineComponent({
    template,
    data() {
        return { 
            meta: useMetaStore(),
            game_selection: "Yellow",
        }
    },
    computed: {
        isRelease() {
            return process.env.NODE_ENV === "development";
        },
        filtered_pokemon_list() {
            if (this.game_selection === "Yellow") {
                PokeData.setGame("Yellow")
            } else {
                PokeData.setGame("Red and Blue")
            }
            return PokeData.getAllSpecieNames();
        }
    }
});