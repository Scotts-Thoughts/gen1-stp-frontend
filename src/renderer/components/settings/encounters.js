import { defineComponent } from "vue";
import { useMetaStore } from "~/stores/metaStore.js";
import { useGameSpeciesData } from "~/stores/useGameSpeciesData";

const template = /*html*/`
    <div>Encounter Settings:</div>
    <table>
        <tbody>
            <tr><td>Early Encounters:</td><td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.wEarlyEncounters"/></td></tr>
            <tr><td>No Moon:</td><td>         <input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.wEarlyEncountersNoMoon"/></td></tr>
        </tbody>
    </table>
    <table v-if="game_properties.meta.gameName.value == 'Yellow'" class="ui_table">
        <tbody>
            <tr>
                <td>Route 1</td>        <td>- Test:</td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.EVENT_ENCOUNTER_ROUTE1_TEST"/></td>
            </tr>
            <tr>
                <td>Viridian Forest</td><td>- Pidgey:</td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY"/></td>
            </tr>
            <tr>
                <td>Route 3</td>        <td>- Spearow:</td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.EVENT_ENCOUNTER_ROUTE3_SPEAROW"/></td>
            </tr>
            <tr>
                <td>Mt. Moon</td>       <td>- Sandshrew:</td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.EVENT_ENCOUNTER_MTMOON_SANDSHREW"/></td>
            </tr>
            <tr>
                <td>Route 16</td>       <td>- Doduo:</td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.EVENT_ENCOUNTER_ROUTE16_DODUO"/></td>
            </tr>
        </tbody>
    </table>
    <table v-if="game_properties.meta.gameName.value == 'Red and Blue'" class="ui_table">
        <tbody>
            <tr>
                <td>Route 3</td> <td>- Spearow:</td> 
                <td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.EVENT_ENCOUNTER_ROUTE3_SPEAROW"/></td>
            </tr>
            <tr>
                <td>Mt. Moon</td><td>- Geodude:</td> 
                <td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.EVENT_ENCOUNTER_MTMOON_GEODUDE"/></td>
            </tr>
            <tr>
                <td>Mt. Moon</td><td>- Paras:</td>   
                <td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.EVENT_ENCOUNTER_MTMOON_PARAS"/></td>
            </tr>
            <tr>
                <td>Route 6</td> <td>- Cut User:</td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.EVENT_ENCOUNTER_ROUTE6_CUT_USER"/></td>
            </tr>
            <tr>
                <td>Route 16</td><td>- Doduo:</td>   
                <td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.EVENT_ENCOUNTER_ROUTE16_DODUO"/></td>
            </tr>
        </tbody>
    </table>
`;

export default defineComponent({
    template,
    inject: ["game_properties", "mapper"],
    data() {
        return {
            meta: useMetaStore(),
            runConfig: useGameSpeciesData(),
        }
    },
    created() {
        this.$watch(
            () => this.runConfig.config.gameSpecific,
            this.set_encounters,
            {deep: true}
        );        
    },
    methods: {
        initialize_encounter_settings() {
            // If the game specific data has no attributes, set the defaults:
            if (Object.keys(this.runConfig.config.gameSpecific).length == 0 ) {
                this.runConfig.config.gameSpecific = {
                    wEarlyEncounters: true,
                    wEarlyEncountersNoMoon: true,
                    EVENT_ENCOUNTER_MTMOON_GEODUDE: false,
                    EVENT_ENCOUNTER_ROUTE3_SPEAROW: false,
                    EVENT_ENCOUNTER_MTMOON_PARAS: true,
                    EVENT_ENCOUNTER_ROUTE6_CUT_USER: false,
                    EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY: false,
                    EVENT_ENCOUNTER_ROUTE16_DODUO: false,
                    EVENT_ENCOUNTER_ROUTE1_TEST: false,
                    EVENT_ENCOUNTER_MTMOON_SANDSHREW: false,
                }
            }
        },
        set_encounters() {
            this.initialize_encounter_settings();
            const game = this.game_properties.meta.gameName.value;
            const encounterSettings = this.runConfig.config.gameSpecific;
            const early_encounters_value = encounterSettings.wEarlyEncounters == true ? "On" : "Off";
            this.game_properties.patch.wEarlyEncounters.set(early_encounters_value, false)
            if (game == 'Yellow') {
                this.mapper.setBits([ // Set bits can only be called on properties that share the same address
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE1_TEST', value: encounterSettings.EVENT_ENCOUNTER_ROUTE1_TEST, freeze: false },
                ])
                this.mapper.setBits([
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY', value: encounterSettings.EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE3_SPEAROW', value: encounterSettings.EVENT_ENCOUNTER_ROUTE3_SPEAROW },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_SANDSHREW', value: encounterSettings.EVENT_ENCOUNTER_MTMOON_SANDSHREW },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE16_DODUO', value: encounterSettings.EVENT_ENCOUNTER_ROUTE16_DODUO },
                ])
            } else if (game == 'Red and Blue') {
                this.mapper.setBits([ // Set bits can only be called on properties that share the same address
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE3_SPEAROW', value: encounterSettings.EVENT_ENCOUNTER_ROUTE3_SPEAROW },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_GEODUDE', value: encounterSettings.EVENT_ENCOUNTER_MTMOON_GEODUDE },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_PARAS', value: encounterSettings.EVENT_ENCOUNTER_MTMOON_PARAS },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE6_CUT_USER', value: encounterSettings.EVENT_ENCOUNTER_ROUTE6_CUT_USER },
                ])
                this.mapper.setBits([
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE16_DODUO', value: encounterSettings.EVENT_ENCOUNTER_ROUTE16_DODUO },
                ])
            }
        },
    },
    mounted: async function () {
        this.initialize_encounter_settings();
        //HM Encounters
        this.game_properties.overworld.map.change((newValue, oldValue) => {
            const mtMoon = ["Mt Moon - 1", "Mt Moon - 2", "Mt Moon - 3"];
            if (newValue.value == "Pallet Town" && oldValue.value == "Pallet Town - Oak's Lab" && this.game_properties.events.got_pokedex.value == false) {
                this.set_encounters()
            }
            else if (this.runConfig.gameSpecific.wEarlyEncountersNoMoon && mtMoon.includes(newValue.value)) {
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