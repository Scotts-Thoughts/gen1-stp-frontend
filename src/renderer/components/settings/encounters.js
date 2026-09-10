import { defineComponent } from "vue";
import { useMetaStore } from "~/stores/metaStore.js";
import { useGameSpeciesData } from "~/stores/useGameSpeciesData";
import { useSettingsStore } from "~/stores/useSettingsStore";

const template = /*html*/`
    <div>Encounter Settings:</div>
    <table>
        <tbody>
            <tr><td>Early Encounters:</td><td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.wEarlyEncounters"/></td></tr>
            <tr><td>No Moon:</td><td>         <input class="checkBoxStyle" type="checkbox" v-model="runConfig.config.gameSpecific.wEarlyEncountersNoMoon"/></td></tr>
        </tbody>
    </table>
    <table v-if="mapper.properties.meta.gameName.value == 'Yellow'" class="ui_table">
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
    <table v-if="mapper.properties.meta.gameName.value == 'Red and Blue'" class="ui_table">
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

/** Flags that live in `patch.encounter_flags` of the mapper, grouped by game. */
const ENCOUNTER_FLAGS = {
    "Yellow": [
        "EVENT_ENCOUNTER_ROUTE1_TEST",
        "EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY",
        "EVENT_ENCOUNTER_ROUTE3_SPEAROW",
        "EVENT_ENCOUNTER_MTMOON_SANDSHREW",
        "EVENT_ENCOUNTER_ROUTE16_DODUO",
    ],
    "Red and Blue": [
        "EVENT_ENCOUNTER_ROUTE3_SPEAROW",
        "EVENT_ENCOUNTER_MTMOON_GEODUDE",
        "EVENT_ENCOUNTER_MTMOON_PARAS",
        "EVENT_ENCOUNTER_ROUTE6_CUT_USER",
        "EVENT_ENCOUNTER_ROUTE16_DODUO",
    ],
};

const MT_MOON_MAPS = ["Mt Moon - 1", "Mt Moon - 2", "Mt Moon - 3"];

export default defineComponent({
    template,
    inject: ["mapper"],
    data() {
        return {
            meta: useMetaStore(),
            runConfig: useGameSpeciesData(),
            settings: useSettingsStore(),
            /** Snapshot of the encounter settings that were last written to the ROM. */
            lastApplied: null,
        }
    },
    created() {
        this.$watch(
            () => this.runConfig.config.gameSpecific,
            this.on_encounter_settings_changed,
            { deep: true }
        );
        // Once the settings of a species have finished loading, make sure every flag exists.
        this.$watch(
            () => this.settings.loading,
            (loading) => {
                if (!loading) {
                    this.initialize_encounter_settings();
                }
            }
        );
    },
    methods: {
        /** All encounter settings default to off, just like before the settings refactor. */
        default_encounter_settings() {
            const defaults = { wEarlyEncounters: false, wEarlyEncountersNoMoon: false };
            for (const flags of Object.values(ENCOUNTER_FLAGS)) {
                for (const flag of flags) {
                    defaults[flag] = false;
                }
            }
            return defaults;
        },
        /** Add any missing encounter setting with its default value. */
        initialize_encounter_settings() {
            const current = this.runConfig.config.gameSpecific;
            for (const [key, value] of Object.entries(this.default_encounter_settings())) {
                if (!(key in current)) {
                    current[key] = value;
                }
            }
        },
        /**
         * Called on every change of the encounter settings. Settings that were just loaded from disk are only
         * remembered, settings changed by the user are written to the ROM right away (only the ones that changed).
         */
        on_encounter_settings_changed(newSettings) {
            const snapshot = { ...(newSettings ?? {}) };
            if (this.settings.loading || this.lastApplied === null) {
                this.lastApplied = snapshot;
                return;
            }
            const changed = Object.keys(snapshot).filter(key => snapshot[key] !== this.lastApplied[key]);
            this.lastApplied = snapshot;
            for (const key of changed) {
                this.write_encounter_setting(key, snapshot[key]);
            }
        },
        /** Write a single encounter setting to the ROM. */
        write_encounter_setting(key, value) {
            const game = this.mapper.properties.meta.gameName.value;
            if (key === "wEarlyEncounters") {
                this.mapper.properties.patch.wEarlyEncounters.set(value == true ? "On" : "Off", false);
                return;
            }
            if (key === "wEarlyEncountersNoMoon") {
                return; // Only used by the overlay itself, see the map change handler below.
            }
            if ((ENCOUNTER_FLAGS[game] ?? []).includes(key)) {
                this.mapper.properties.patch.encounter_flags?.[key]?.set(value == true, false);
            }
        },
        /** Write all encounter settings to the ROM. */
        set_encounters() {
            this.initialize_encounter_settings();
            const game = this.mapper.properties.meta.gameName.value;
            const encounterSettings = this.runConfig.config.gameSpecific;
            const early_encounters_value = encounterSettings.wEarlyEncounters == true ? "On" : "Off";
            this.mapper.properties.patch.wEarlyEncounters.set(early_encounters_value, false)
            if (game == 'Yellow') {
                this.mapper.setBits([ // Set bits can only be called on properties that share the same address
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE1_TEST', value: encounterSettings.EVENT_ENCOUNTER_ROUTE1_TEST == true, freeze: false },
                ])
                this.mapper.setBits([
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY', value: encounterSettings.EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY == true, freeze: false },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE3_SPEAROW', value: encounterSettings.EVENT_ENCOUNTER_ROUTE3_SPEAROW == true, freeze: false },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_SANDSHREW', value: encounterSettings.EVENT_ENCOUNTER_MTMOON_SANDSHREW == true, freeze: false },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE16_DODUO', value: encounterSettings.EVENT_ENCOUNTER_ROUTE16_DODUO == true, freeze: false },
                ])
            } else if (game == 'Red and Blue') {
                this.mapper.setBits([ // Set bits can only be called on properties that share the same address
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE3_SPEAROW', value: encounterSettings.EVENT_ENCOUNTER_ROUTE3_SPEAROW == true, freeze: false },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_GEODUDE', value: encounterSettings.EVENT_ENCOUNTER_MTMOON_GEODUDE == true, freeze: false },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_MTMOON_PARAS', value: encounterSettings.EVENT_ENCOUNTER_MTMOON_PARAS == true, freeze: false },
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE6_CUT_USER', value: encounterSettings.EVENT_ENCOUNTER_ROUTE6_CUT_USER == true, freeze: false },
                ])
                this.mapper.setBits([
                    { path: 'patch.encounter_flags.EVENT_ENCOUNTER_ROUTE16_DODUO', value: encounterSettings.EVENT_ENCOUNTER_ROUTE16_DODUO == true, freeze: false },
                ])
            }
        },
    },
    mounted: async function () {
        if (!this.settings.loading) {
            this.initialize_encounter_settings();
        }
        //HM Encounters
        this.mapper.properties.overworld.map.change((newValue, oldValue) => {
            const encounterSettings = this.runConfig.config.gameSpecific;
            const alakazamYellow = this.meta.game == "Yellow" && this.meta.starter == "Alakazam";
            if (newValue.value == "Pallet Town" && oldValue.value == "Pallet Town - Oak's Lab" && this.mapper.properties.events.got_pokedex.value == false) {
                this.set_encounters()
            }
            else if (encounterSettings.wEarlyEncountersNoMoon && MT_MOON_MAPS.includes(newValue.value)) {
                this.mapper.properties.patch.wEarlyEncounters.set("Off", false)
            }
            // Alakazam Yellow exception
            else if (alakazamYellow && MT_MOON_MAPS.includes(newValue.value)) {
                this.mapper.properties.patch.wEarlyEncounters.set("Off", false)
            }
            else if (newValue.value == "Viridian Forest" && alakazamYellow && this.mapper.properties?.trainers?.viridianForest?.bugcatcher2?.value == false) {
                this.mapper.properties.patch.wEarlyEncounters.set("Off", false)
            }
        })
    }
});
