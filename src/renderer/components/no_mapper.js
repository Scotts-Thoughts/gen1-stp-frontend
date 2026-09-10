import { defineComponent } from "vue";
import PokeData from "~/logic/PokeData";
import { useOverlaySettingsStore } from "~/stores/useOverlaySettingsStore";

const template = /*html*/`
    <div>
        <div>Game:</div>
            <select v-model="settings.edition" class="dropdownMenu dropdown_menu_column3">
                <option>Yellow</option>
                <option v-if="isRelease == false">Yellow Legacy</option>
                <option>Red</option>
                <option>Blue</option>
            </select><br>
            <div>Solo Pokemon:</div>
            <select v-model="settings.starter" class="dropdownMenu dropdown_menu_column3" style="background-color: rgb(201, 199, 100)">
                <option disabled value="">Select a species</option>
                <option v-for="key in filtered_pokemon_list" :value="key">{{key}}</option>
            </select><br>
    </div>
`

export default defineComponent({
    template,
    data() {
        return {
            settings: useOverlaySettingsStore(),
            isRelease: process.env.NODE_ENV !== "development",
        }
    },
    computed: {
        filtered_pokemon_list() {
            // No mapper is loaded yet, so pick the data set based on the edition the user selected.
            if (this.settings.edition === "Red" || this.settings.edition === "Blue") {
                PokeData.setGame("Red and Blue");
            } else {
                PokeData.setGame("Yellow");
            }
            return PokeData.getAllSpecieNames();
        }
    }
});
