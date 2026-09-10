import { useMetaStore } from "~/stores/metaStore";
import battle_testing from "./battle_testing.vue";
import { useOverlaySettingsStore } from "~/stores/useOverlaySettingsStore";
import { useGameSpeciesData } from "~/stores/useGameSpeciesData";
import { useSpeciesMetricsStore } from "~/stores/useSpeciesMetricsStore";
import { useEnemySpriteResizeStore } from "~/stores/useEnemySpriteResizeStore";
import { defineComponent } from "vue";
import { openFolder } from "../../methods/file_system_functions";

const template = /*html*/`
    <div>Game:</div>
    <select v-model="settings.edition" class="dropdownMenu dropdown_menu_column3">
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
                <tr><td>Shuckie Timer:</td><td>   <input class="checkBoxStyle" type="checkbox" v-model="runConfig.advanced.shuckie_timer"/></td></tr>
                <tr><td>Shuckie Counters:</td><td><input class="checkBoxStyle" type="checkbox" v-model="runConfig.advanced.shuckie_counters"/></td></tr>
                <tr title="Dev only. Packaged builds always apply enemy sprite styles."><td>Enemy Sprite Styles:</td><td><input class="checkBoxStyle" type="checkbox" :checked="enemyResize.styles_enabled" @change="enemyResize.setStylesEnabled($event.target.checked)"/></td></tr>
                <tr><td>Style Mode:</td><td>
                    <button v-if="!enemyResize.style_mode_active" class="buttonStyle" style="font-size: 11px;" @click="enemyResize.enterStyleMode()" title="Iterate every species: Enter saves + advances, Backspace discards + steps back, Escape exits.">Start</button>
                    <button v-else class="buttonStyle" style="font-size: 11px; color: #f44;" @click="enemyResize.exitStyleMode()">Exit</button>
                </td></tr>
                <tr v-if="enemyResize.style_mode_active"><td colspan="2" style="font-size: 11px;">{{ enemyResize.style_mode_index + 1 }} / {{ enemyResize.style_mode_species_list.length }} — <strong>{{ enemyResize.styleModeCurrentSpecies }}</strong></td></tr>
            </tbody>
        </table>
        <table v-if="runConfig.advanced.refilming_mode">
            <tbody>
                <tr><td>Attempt:</td><td><input class="inputContainer" type="number" min="0" v-model.number="runConfig.advanced.refilmed_attempt"/></td></tr>
                <tr><td>Finish:</td><td> <input class="inputContainer" type="number" min="0" v-model.number="runConfig.advanced.refilmed_finish"/></td></tr>
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
                <tr><td>blackout:</td><td>{{metrics.blackout_pending}}</td></tr>
                <tr><td>save file id:</td><td>{{metrics.player_id}}</td></tr>
                <tr><td>run finished:</td><td>{{metrics.run_finished}}</td></tr>
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
            enemyResize: useEnemySpriteResizeStore(),
            isRelease: process.env.NODE_ENV !== "development",
        }
    },
    methods: {
        open_splits_folder() {
            openFolder('splits', this.meta.game, this.meta.starter, 'finishes')
        }
    }
});
