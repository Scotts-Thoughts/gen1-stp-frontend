import { useMetaStore } from "~/stores/metaStore";
import battle_testing from "./battle_testing";
import { useOverlaySettingsStore } from "~/stores/useOverlaySettingsStore";
import { useGameSpeciesData } from "~/stores/useGameSpeciesData";
import { useSpeciesMetricsStore } from "~/stores/useSpeciesMetricsStore";
import { defineComponent } from "vue";
import { openFolder } from "../../methods/file_system_functions";
// todo: remove the "parent.parent" stuff.
const template = /*html*/`
    <div>Game:</div>
    <select v-model="$parent.$parent.game_selection" class="dropdownMenu dropdown_menu_column3">
        <option>Yellow</option>
        <option v-if="isRelease == false">Yellow Legacy</option>
        <option>Red</option>
        <option>Blue</option>
    </select><br>
    <br>
    <div>Timer Setting:</div>
    <button class="buttonStyle buttonStyle_column3" @click="metrics.toggleTimer">Play/Pause</button>
    <button class="buttonStyle set_button_style" @click="metrics.resetTimer">Set Timer</button>
    <input type="text" class="inputContainer" v-model="metrics.timer_override" placeholder="00:00:00.00"/><br>
    <br>
    <button class="buttonStyle buttonStyle_column3" @click="open_splits_folder">Open Splits Folder</button>
    <br>
    <br>
    <div v-if="isRelease == false">
        <table>
            <tbody>
                <tr><td>Test run:</td><td>        <input class="checkBoxStyle" type="checkbox" v-model="runConfig.advanced.test_run"/></td></tr>
                <tr><td>Refilming mode:</td><td>  <input class="checkBoxStyle" type="checkbox" v-model="runConfig.advanced.refilming_mode"/></td></tr>
                <tr><td>No attempt/split:</td><td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.advanced.no_attempt"/></td></tr>
            </tbody>
        </table>
        <table v-if="runConfig.advanced.refilming_mode">
            <tbody>
                <tr><td>Attempt:</td><td><input class="inputContainer" type="text" v-model="$parent.$parent.refilmed_attempt"/></td></tr>
                <tr><td>Finish:</td><td> <input class="inputContainer" type="text" v-model="$parent.$parent.refilmed_finish"/></td></tr>
            </tbody>
        </table>
        <br>
    </div>
    <div v-if="runConfig.advanced.test_run == true">
        <battle_testing />
    </div>
    <div v-if="isRelease == false">
        <div>Debugging:</div>
        <table>
            <tbody>
                <tr><td>State:</td><td>{{meta.gameState}}</td></tr>
                <tr><td>Mapper State:</td><td>{{game_properties.meta.state.value}}</td></tr>
                <tr><td>Enemy State:</td><td>{{meta.enemyState}}</td></tr>
                <tr><td></td><td></td></tr>
                <tr><td>blackout:</td><td>{{$parent.$parent.blackout}}</td></tr>
            </tbody>
        </table>
    </div>
`

export default defineComponent({
    template,
    inject: ["game_properties"],
    components: {
        battle_testing,
    },
    data() {
        return {
            meta: useMetaStore(),
            settings: useOverlaySettingsStore(),
            runConfig: useGameSpeciesData(),
            metrics: useSpeciesMetricsStore(),
            isRelease: process.env.NODE_ENV !== "development",
        }
    },
    methods: {
        open_splits_folder() {
            openFolder('splits', this.meta.game, this.meta.starter, 'finishes')
        }
    }
});