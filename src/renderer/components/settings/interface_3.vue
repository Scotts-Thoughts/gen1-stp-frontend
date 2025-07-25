<template>
    <div>UI Color:</div>
    <button @click="color_picker" class="buttonStyle buttonStyle_column3">
        Color Picker
    </button>
    <br>
    Saturation: <input type="range" min="0" max="2" step="0.1" v-model="ui.saturation"/>
    <br>
    <br>
    <div>Pokemon:</div>
    <table>
        <tbody>
            <tr>
                <td>X-Offset:   </td>
                <td><input type="range" min="-400" max="400" v-model="artwork.offset_x" /></td>
            </tr>
            <tr>
                <td>Y-Offset:   </td>
                <td><input type="range" min="-400" max="400" :value="artwork.offset_y" /></td>
            </tr>
            <tr>
                <td>Scale:      </td>
                <td><input type="range" min="0.3"  max="2"   step="0.02" v-model="artwork.scale" /></td>
            </tr>
            <tr>
                <td>Saturation: </td>
                <td><input type="range" min="90"   max="150" step="1"    v-model="artwork.sat" /></td>
            </tr>
            <tr>
                <td>Rotation:   </td>
                <td><input type="range" min="0"    max="360" step="1"    v-model="artwork.rotation" /></td>
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
                <td><input type="range" min="-125" max="125" v-model="background.offset_x"/></td>
            </tr>
            <tr>
                <td>Y-Offset:   </td>
                <td><input type="range" min="-125" max="125" v-model="background.offset_y"/></td>
            </tr>
            <tr>
                <td>Scale:      </td>
                <td><input type="range" min="100"  max="200" v-model="background.scale"/></td>
            </tr>
            <tr>
                <td>Brightness: </td>
                <td><input type="range" min="0"    max="200" v-model="background.brightness"/></td>
            </tr>
            <tr>
                <td>Contrast:   </td>
                <td><input type="range" min="0"    max="200" v-model="background.contrast"/></td>
            </tr>
            <tr>
                <td>Saturation: </td>
                <td><input type="range" min="0"    max="200" v-model="background.saturation"/></td>
            </tr>
            <tr>
                <td>Blur:       </td>
                <td><input type="range" min="0"    max="10"  v-model="background.blur"/></td>
            </tr>
            <tr>
                <td>Hue:        </td>
                <td><input type="range" min="0"    max="358" v-model="background.hue"/></td>
            </tr>
            <tr>
                <td>Flip:     </td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="background.flip"/></td>
            </tr>
            <tr>
                <td colspan="2">
                    <button class="buttonStyle buttonStyle_column3" @click="save">Save style</button>
                </td>
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
            gameSpeciesData: useGameSpeciesData(),
        };
    },
    methods: {
        async color_picker() {
            this.ui.color = await new EyeDropper().open().then(res => res.sRGBHex);           
        },
        async save() {
            this.gameSpeciesData.saveStyle(this.meta.game, this.meta.starter);
        },
        async reload() {
            this.gameSpeciesData.loadStyle(this.meta.game, this.meta.starter);
        },
    },
    computed: {
        artwork() {
            return this.gameSpeciesData.artwork;
        },
        ui() {
            return this.gameSpeciesData.ui;
        },
        background() {
            return this.gameSpeciesData.background;
        },
        dropdownDownMenuKeys() {
            return Object.keys(textures);
        },
    },
});
</script>