<template>
    <div>UI Color:</div>
    <button @click="color_picker" class="buttonStyle buttonStyle_column3">
        Color Picker
    </button>
    <br>
    Saturation: <input type="range" min="0" max="2" step="0.1" v-model.number="ui.saturation"/>
    <br>
    <br>
    <div>Pokemon:</div>
    <table>
        <tbody>
            <tr>
                <td>X-Offset:   </td>
                <td><input type="range" min="-400" max="400" v-model.number="artwork.offset_x" /></td>
            </tr>
            <tr>
                <td>Y-Offset:   </td>
                <td><input type="range" min="-400" max="400" v-model.number="artwork.offset_y" /></td>
            </tr>
            <tr>
                <td>Scale:      </td>
                <td><input type="range" min="0.3"  max="2"   step="0.02" v-model.number="artwork.scale" /></td>
            </tr>
            <tr>
                <td>Saturation: </td>
                <td><input type="range" min="90"   max="150" step="1"    v-model.number="artwork.saturation" /></td>
            </tr>
            <tr>
                <td>Rotation:   </td>
                <td><input type="range" min="0"    max="360" step="1"    v-model.number="artwork.rotation" /></td>
            </tr>
            <tr>
                <td>Flip:       </td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="artwork.flip"/></td>
            </tr>
        </tbody>
    </table>
    <br>
    <div>Background Texture:</div>
    <select v-model="background.texture" class="dropdownMenu dropdown_menu_column3">
        <option v-for="key in dropdownDownMenuKeys" :key="key" :value="key">
            {{ key }}
        </option>
    </select>
    <br>
    <table>
        <tbody>
            <tr>
                <td>X-Offset:   </td>
                <td><input type="range" min="-400" max="400" v-model.number="background.offset_x"/></td>
            </tr>
            <tr>
                <td>Y-Offset:   </td>
                <td><input type="range" min="-400" max="400" v-model.number="background.offset_y"/></td>
            </tr>
            <tr>
                <td>Scale:      </td>
                <td><input type="range" min="50"   max="300" v-model.number="background.scale"/></td>
            </tr>
            <tr>
                <td>Brightness: </td>
                <td><input type="range" min="0"    max="200" v-model.number="background.brightness"/></td>
            </tr>
            <tr>
                <td>Contrast:   </td>
                <td><input type="range" min="0"    max="200" v-model.number="background.contrast"/></td>
            </tr>
            <tr>
                <td>Saturation: </td>
                <td><input type="range" min="0"    max="200" v-model.number="background.saturation"/></td>
            </tr>
            <tr>
                <td>Blur:       </td>
                <td><input type="range" min="0"    max="10"  step="0.1" v-model.number="background.blur"/></td>
            </tr>
            <tr>
                <td>Hue:        </td>
                <td><input type="range" min="0"    max="358" v-model.number="background.hue"/></td>
            </tr>
            <tr>
                <td>Flip X:     </td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="background.flip"/></td>
            </tr>
            <tr>
                <td>Flip Y:     </td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="background.flip_y"/></td>
            </tr>
            <tr>
                <td colspan="2" style="font-size: 12px; opacity: .8;">Changes are saved automatically.</td>
            </tr>
            <tr>
                <td colspan="2">
                    <button class="buttonStyle buttonStyle_column3" @click="reload">Reload style</button>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
import { defineComponent } from "vue";
import { textures } from "~/data/textures";
import { useGameSpeciesData } from "~/stores/useGameSpeciesData";
import { useMetaStore } from "~/stores/metaStore";

export default defineComponent({
    data() {
        return {
            meta: useMetaStore(),
            runConfig: useGameSpeciesData(),
        };
    },
    methods: {
        async color_picker() {
            this.ui.color = await new EyeDropper().open().then(res => res.sRGBHex);
        },
        /** Re-read the style from disk (or the legacy preset), discarding unsaved edits. */
        async reload() {
            this.runConfig.reloadStyle(this.meta.game, this.meta.starter);
        },
    },
    computed: {
        artwork() {
            return this.runConfig.artwork;
        },
        ui() {
            return this.runConfig.ui;
        },
        background() {
            return this.runConfig.background;
        },
        dropdownDownMenuKeys() {
            return Object.keys(textures);
        },
    },
});
</script>
