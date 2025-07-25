import { defineComponent } from "vue";
import Storage from "~/logic/Storage.js";
import { useMetaStore } from "~/stores/metaStore.js";

const template = /*html*/`
    <div>Encounter Settings:</div>
    <table>
        <tbody>
            <tr><td>Early Encounters:</td><td><input class="checkBoxStyle" type="checkbox" v-model="toggle_wEarlyEncounters"/></td></tr>
            <tr><td>No Moon:</td><td>         <input class="checkBoxStyle" type="checkbox" v-model="toggle_wEarlyEncountersNoMoon"/></td></tr>
        </tbody>
    </table>
    <table v-if="game_properties.meta.gameName.value == 'Yellow'" class="ui_table">
        <tbody>
            <tr><td>Route 1</td>        <td>- Test:</td><td><input      class="checkBoxStyle" type="checkbox" v-model="toggle_EVENT_ENCOUNTER_ROUTE1_TEST"/></td></tr>
            <tr><td>Viridian Forest</td><td>- Pidgey:</td><td><input    class="checkBoxStyle" type="checkbox" v-model="toggle_EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY"/></td></tr>
            <tr><td>Route 3</td>        <td>- Spearow:</td><td><input   class="checkBoxStyle" type="checkbox" v-model="toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW"/></td></tr>
            <tr><td>Mt. Moon</td>       <td>- Sandshrew:</td><td><input class="checkBoxStyle" type="checkbox" v-model="toggle_EVENT_ENCOUNTER_MTMOON_SANDSHREW"/></td></tr>
            <tr><td>Route 16</td>       <td>- Doduo:</td><td><input     class="checkBoxStyle" type="checkbox" v-model="toggle_EVENT_ENCOUNTER_ROUTE16_DODUO"/></td></tr>
        </tbody>
    </table>
    <table v-if="game_properties.meta.gameName.value == 'Red and Blue'" class="ui_table">
        <tbody>
            <tr><td>Route 3</td> <td>- Spearow:</td> <td><input class="checkBoxStyle" type="checkbox" v-model="toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW"/></td></tr>
            <tr><td>Mt. Moon</td><td>- Geodude:</td> <td><input class="checkBoxStyle" type="checkbox" v-model="toggle_EVENT_ENCOUNTER_MTMOON_GEODUDE"/></td></tr>
            <tr><td>Mt. Moon</td><td>- Paras:</td>   <td><input class="checkBoxStyle" type="checkbox" v-model="toggle_EVENT_ENCOUNTER_MTMOON_PARAS"/></td></tr>
            <tr><td>Route 6</td> <td>- Cut User:</td><td><input class="checkBoxStyle" type="checkbox" v-model="toggle_EVENT_ENCOUNTER_ROUTE6_CUT_USER"/></td></tr>
            <tr><td>Route 16</td><td>- Doduo:</td>   <td><input class="checkBoxStyle" type="checkbox" v-model="toggle_EVENT_ENCOUNTER_ROUTE16_DODUO"/></td></tr>
        </tbody>
    </table>
`;

export default defineComponent({
    template,
    inject: ["game_properties", "mapper"],
    data() {
        return {
            meta: useMetaStore(),
            toggle_wEarlyEncounters: Storage.application_settings.toggle_wEarlyEncounters ?? false,
            toggle_wEarlyEncountersNoMoon: Storage.application_settings.toggle_wEarlyEncountersNoMoon ?? false,
            toggle_EVENT_ENCOUNTER_ROUTE1_TEST: Storage.application_settings.toggle_EVENT_ENCOUNTER_ROUTE1_TEST ?? false, // Yellow
            toggle_EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY: Storage.application_settings.toggle_EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY ?? false, // Yellow
            toggle_EVENT_ENCOUNTER_MTMOON_SANDSHREW: Storage.application_settings.toggle_EVENT_ENCOUNTER_MTMOON_SANDSHREW ?? false, // Yellow
            toggle_EVENT_ENCOUNTER_MTMOON_GEODUDE: Storage.application_settings.toggle_EVENT_ENCOUNTER_MTMOON_GEODUDE ?? false, // Red and Blue
            toggle_EVENT_ENCOUNTER_MTMOON_PARAS: Storage.application_settings.toggle_EVENT_ENCOUNTER_MTMOON_PARAS ?? false, // Red and Blue
            toggle_EVENT_ENCOUNTER_ROUTE6_CUT_USER: Storage.application_settings.toggle_EVENT_ENCOUNTER_ROUTE6_CUT_USER ?? false, // Red and Blue
            toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW: Storage.application_settings.toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW ?? false, // Red/Blue/Yellow
            toggle_EVENT_ENCOUNTER_ROUTE16_DODUO: Storage.application_settings.toggle_EVENT_ENCOUNTER_ROUTE16_DODUO ?? false, // Red/Blue/Yellow
        }
    },
    created() {
        // Setup encounter toggle watchers
        const set_encounter_toggle = (subPath, value) => {
            if (this.game_properties?.patch?.encounter_flags?.[subPath]) {
                this.game_properties.patch.encounter_flags[subPath].set(value, false);
            }
            else {
                console.log(`Property ${subPath} not found in encounter_flags`);
            }
        };
        const toggleToEncounterFlag = {
            "toggle_EVENT_ENCOUNTER_ROUTE1_TEST": "EVENT_ENCOUNTER_ROUTE1_TEST",
            "toggle_EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY": "EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY",
            "toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW": "EVENT_ENCOUNTER_ROUTE3_SPEAROW",
            "toggle_EVENT_ENCOUNTER_MTMOON_SANDSHREW": "EVENT_ENCOUNTER_MTMOON_SANDSHREW",
            "toggle_EVENT_ENCOUNTER_ROUTE16_DODUO": "EVENT_ENCOUNTER_ROUTE16_DODUO",
            "toggle_EVENT_ENCOUNTER_MTMOON_GEODUDE": "EVENT_ENCOUNTER_MTMOON_GEODUDE",
            "toggle_EVENT_ENCOUNTER_MTMOON_PARAS": "EVENT_ENCOUNTER_MTMOON_PARAS",
            "toggle_EVENT_ENCOUNTER_ROUTE6_CUT_USER": "EVENT_ENCOUNTER_ROUTE6_CUT_USER",
        };
        for (const [toggleProp, encounterFlag] of Object.entries(toggleToEncounterFlag)) {
            this.$watch(
                () => this[toggleProp],
                (new_value) => {
                    set_encounter_toggle(encounterFlag, new_value);
                    Storage.application_settings[toggleProp] = new_value;
                }
            );
        }
        this.game_properties.patch.wEarlyEncounters.set(this.toggle_wEarlyEncounters ? "On" : "Off", false);
        this.set_encounters()
    },
    watch: {
        toggle_wEarlyEncounters(newValue) {
            this.game_properties.patch.wEarlyEncounters.set(newValue ? "On" : "Off", false);
            Storage.application_settings.toggle_wEarlyEncounters = newValue
        },
        toggle_wEarlyEncountersNoMoon(newValue) {
            Storage.application_settings.toggle_wEarlyEncountersNoMoon = newValue
        },
    },
    methods: {
        set_encounters() {
            const game = this.game_properties.meta.gameName.value
            let early_encounters_value = this.toggle_wEarlyEncounters == true ? "On" : "Off"
            this.game_properties.patch.wEarlyEncounters.set(early_encounters_value, false)
            if (game == 'Yellow') {
                this.mapper.setBits([ // Set bits can only be called on properties that share the same address
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE1_TEST', value: this.toggle_EVENT_ENCOUNTER_ROUTE1_TEST, freeze: false },
                ])
                this.mapper.setBits([
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY', value: this.toggle_EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY, freeze: false },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE3_SPEAROW', value: this.toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW, freeze: false },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_SANDSHREW', value: this.toggle_EVENT_ENCOUNTER_MTMOON_SANDSHREW, freeze: false },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE16_DODUO', value: this.toggle_EVENT_ENCOUNTER_ROUTE16_DODUO, freeze: false },
                ])
            } else if (game == 'Red and Blue') {
                // this.game_properties.patch.wEarlyEncounters.set(early_encounters_value, false)
                this.mapper.setBits([ // Set bits can only be called on properties that share the same address
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE3_SPEAROW', value: this.toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW, freeze: false },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_GEODUDE', value: this.toggle_EVENT_ENCOUNTER_MTMOON_GEODUDE, freeze: false },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_PARAS', value: this.toggle_EVENT_ENCOUNTER_MTMOON_PARAS, freeze: false },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE6_CUT_USER', value: this.toggle_EVENT_ENCOUNTER_ROUTE6_CUT_USER, freeze: false },
                ])
                this.mapper.setBits([
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE16_DODUO', value: this.toggle_EVENT_ENCOUNTER_ROUTE16_DODUO, freeze: false },
                ])
            }
        },
    },
    mounted: async function () {
        //HM Encounters
        this.game_properties.overworld.map.change((newValue, oldValue) => {
            const mtMoon = ["Mt Moon - 1", "Mt Moon - 2", "Mt Moon - 3"];
            if (newValue.value == "Pallet Town" && oldValue.value == "Pallet Town - Oak's Lab" && this.game_properties.events.got_pokedex.value == false) {
                this.set_encounters()
            }
            else if (this.toggle_wEarlyEncountersNoMoon && mtMoon.includes(newValue.value)) {
                this.game_properties.patch.wEarlyEncounters.set("Off", false)
            }
            // Alakazam Yellow exception
            else if (this.meta.game == "Yellow" && this.meta.starter == "Alakazam" && newValue.value == "Mt Moon - 1" || newValue.value == "Mt Moon - 2" || newValue.value == "Mt Moon - 3") {
                this.game_properties.patch.wEarlyEncounters.set("Off", false)
            }
            else if (newValue.value == "Viridian Forest" && this.meta.game == "Yellow" && this.meta.starter == "Alakazam" && this.game_properties?.trainers?.viridianForest?.bugcatcher2?.value == false) {
                this.game_properties.patch.wEarlyEncounters.set("Off", false)
            }
        })
    }
});