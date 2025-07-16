const template = /*html*/`
    <div>UI Color:</div>
    <button @click="color_picker" class="buttonStyle buttonStyle_column3">Color Picker</button><br>
    Saturation: <input type="range" min="0" max="2" step="0.1" v-model="ui_saturation" @change="$emit('update:ui_saturation', $event.target.value)"/><br>
    <br>
    <div>Pokemon:</div>
    <table>
        <tbody>
            <tr><td>X-Offset:   </td><td><input type="range" min="-400" max="400" v-model="imageXOffset" @change="$emit('update:imageXOffset', $event.target.value)"/></td></tr>
            <tr><td>Y-Offset:   </td><td><input type="range" min="-400" max="400" v-model="imageYOffset" @change="$emit('update:imageYOffset', $event.target.value)"/></td></tr>
            <tr><td>Scale:      </td><td><input type="range" min="0.3"  max="2"   step="0.02" v-model="imageScale" @change="$emit('update:imageScale', $event.target.value)"/></td></tr>
            <tr><td>Saturation: </td><td><input type="range" min="90"   max="150" step="1"    v-model="imageSat" @change="$emit('update:imageSat', $event.target.value)"/></td></tr>
            <tr><td>Rotation:   </td><td><input type="range" min="0"    max="360" step="1"    v-model="imageRotation" @change="$emit('update:imageRotation', $event.target.value)"/></td></tr>
            <tr><td>Flip:       </td><td><input class="checkBoxStyle" type="checkbox" v-model="imageFlip" @change="$emit('update:imageFlip', $event.target.checked)"/></td></tr>
        </tbody>
    </table>
    <br>
    <div>Background Texture:</div>
    <select v-model="backgroundTexture" class="dropdownMenu dropdown_menu_column3" @change="$emit('update:backgroundTexture', $event.target.value)">
        <option v-for="key in dropdownDownMenuKeys.textures" :key="key" :value="key">
            {{ key }}
        </option>
    </select>
    <br>
    <table>
        <tbody>
            <tr><td>X-Offset:   </td><td><input type="range" min="-125" max="125" v-model="backgroundXOffset" @change="$emit('update:backgroundXOffset', $event.target.value)"/></td></tr>
            <tr><td>Y-Offset:   </td><td><input type="range" min="-125" max="125" v-model="backgroundYOffset" @change="$emit('update:backgroundYOffset', $event.target.value)"/></td></tr>
            <tr><td>Scale:      </td><td><input type="range" min="100"  max="200" v-model="backgroundScale" @change="$emit('update:backgroundScale', $event.target.value)"/></td></tr>
            <tr><td>Brightness: </td><td><input type="range" min="0"    max="200" v-model="backgroundBrightness" @change="$emit('update:backgroundBrightness', $event.target.value)"/></td></tr>
            <tr><td>Contrast:   </td><td><input type="range" min="0"    max="200" v-model="backgroundContrast" @change="$emit('update:backgroundContrast', $event.target.value)"/></td></tr>
            <tr><td>Saturation: </td><td><input type="range" min="0"    max="200" v-model="backgroundSaturation" @change="$emit('update:backgroundSaturation', $event.target.value)"/></td></tr>
            <tr><td>Blur:       </td><td><input type="range" min="0"    max="10"  v-model="backgroundBlur" @change="$emit('update:backgroundBlur', $event.target.value)"/></td></tr>
            <tr><td>Hue:        </td><td><input type="range" min="0"    max="358" v-model="backgroundHue" @change="$emit('update:backgroundHue', $event.target.value)"/></td></tr>
            <tr><td>Flip:     </td><td><input class="checkBoxStyle" type="checkbox" v-model="backgroundFlip" @change="$emit('update:backgroundFlip', $event.target.checked)"/></td></tr>
        </tbody>
    </table>
`

module.exports = {
    template,
    props: [
        "color_picker",
        "ui_saturation",
        "imageXOffset",
        "imageYOffset",
        "imageScale",
        "imageSat",
        "imageRotation",
        "imageFlip",
        "backgroundTexture",
        "backgroundXOffset",
        "backgroundYOffset",
        "backgroundScale",
        "backgroundBrightness",
        "backgroundContrast",
        "backgroundSaturation",
        "backgroundBlur",
        "backgroundHue",
        "backgroundFlip",
        "dropdownDownMenuKeys",
    ],
}