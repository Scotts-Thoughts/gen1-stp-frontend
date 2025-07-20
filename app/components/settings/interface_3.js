const textures = require("../../data/textures");
const PubSub = require("../../logic/PubSub");
const UIStyles = require("../../logic/UIStyles");

const template = /*html*/`
    <div>UI Color:</div>
    <button @click="color_picker" class="buttonStyle buttonStyle_column3">
        Color Picker
    </button>
    <br>
    Saturation: <input type="range" min="0" max="2" step="0.1" :value="style.ui_saturation" @input="updateFloat('ui_saturation', $event)"/>
    <br>
    <br>
    <div>Pokemon:</div>
    <table>
        <tbody>
            <tr>
                <td>X-Offset:   </td>
                <td><input type="range" min="-400" max="400" :value="style.imageXOffset" @input="updateInt('imageXOffset', $event)"/></td>
            </tr>
            <tr>
                <td>Y-Offset:   </td>
                <td><input type="range" min="-400" max="400" :value="style.imageYOffset" @input="updateInt('imageYOffset', $event)"/></td>
            </tr>
            <tr>
                <td>Scale:      </td>
                <td><input type="range" min="0.3"  max="2"   step="0.02" :value="style.imageScale" @input="updateFloat('imageScale', $event)"/></td>
            </tr>
            <tr>
                <td>Saturation: </td>
                <td><input type="range" min="90"   max="150" step="1"    :value="style.imageSat" @input="updateInt('imageSat', $event)"/></td>
            </tr>
            <tr>
                <td>Rotation:   </td>
                <td><input type="range" min="0"    max="360" step="1"    :value="style.imageRotation" @input="updateFloat('imageRotation', $event)"/></td>
            </tr>
            <tr>
                <td>Flip:       </td>
                <td><input class="checkBoxStyle" type="checkbox" :value="style.imageFlip" @change="updateChecked('imageFlip', $event)"/></td>
            </tr>
        </tbody>
    </table>
    <br>
    <div>Background Texture:</div>
    <select :value="style.backgroundTexture" class="dropdownMenu dropdown_menu_column3" @change="update('backgroundTexture', $event)">
        <option v-for="key in dropdownDownMenuKeys" :key="key" :value="key">
            {{ key }}
        </option>
    </select>
    <br>
    <table>
        <tbody>
            <tr>
                <td>X-Offset:   </td>
                <td><input type="range" min="-125" max="125" :value="style.backgroundXOffset" @input="updateInt('backgroundXOffset', $event)"/></td>
            </tr>
            <tr>
                <td>Y-Offset:   </td>
                <td><input type="range" min="-125" max="125" :value="style.backgroundYOffset" @input="updateInt('backgroundYOffset', $event)"/></td>
            </tr>
            <tr>
                <td>Scale:      </td>
                <td><input type="range" min="100"  max="200" :value="style.backgroundScale" @input="updateInt('backgroundScale', $event)"/></td>
            </tr>
            <tr>
                <td>Brightness: </td>
                <td><input type="range" min="0"    max="200" :value="style.backgroundBrightness" @input="updateInt('backgroundBrightness', $event)"/></td>
            </tr>
            <tr>
                <td>Contrast:   </td>
                <td><input type="range" min="0"    max="200" :value="style.backgroundContrast" @input="updateInt('backgroundContrast', $event)"/></td>
            </tr>
            <tr>
                <td>Saturation: </td>
                <td><input type="range" min="0"    max="200" :value="style.backgroundSaturation" @input="updateInt('backgroundSaturation', $event)"/></td>
            </tr>
            <tr>
                <td>Blur:       </td>
                <td><input type="range" min="0"    max="10"  :value="style.backgroundBlur" @input="updateInt('backgroundBlur', $event)"/></td>
            </tr>
            <tr>
                <td>Hue:        </td>
                <td><input type="range" min="0"    max="358" :value="style.backgroundHue" @input="updateInt('backgroundHue', $event)"/></td>
            </tr>
            <tr>
                <td>Flip:     </td>
                <td><input class="checkBoxStyle" type="checkbox" :checked="style.backgroundFlip" @input="updateChecked('backgroundFlip', $event)"/></td>
            </tr>
        </tbody>
    </table>
`

module.exports = {
    template,
    methods: {
        update(a, b) {
            UIStyles.update(a, b.target.value);
        },
        updateFloat(setting, event) {
            UIStyles.update(setting, parseFloat(event.target.value));
        },
        updateChecked(setting, event) {
            UIStyles.update(setting, event.target.checked);
        },
        updateInt(setting, event) {
            UIStyles.update(setting, parseInt(event.target.value));
        },
        async color_picker() {
            const color = await new EyeDropper().open().then(res => res.sRGBHex);
            UIStyles.update("overlay_color", color);
        },
    },
    computed: {
        dropdownDownMenuKeys() {
            return Object.keys(textures);
        },
    },
    setup(){
        const style = Vue.ref(UIStyles._settings);
        const onStyles = (newSettings) => {
            style.value = newSettings;
        };
        PubSub.subscribe("@settings/ui_styles", onStyles);
        return {
            style,
            onStyles
        };
    },
    onUnmounted() {
        PubSub.unsubscribe("@settings/ui_styles", onStyles);
    },
}