const template = /*html*/`
    <div>Stats:</div>
    <select v-model="stats_display" @change="$emit('update:stats_display', $event.target.value)" class="dropdownMenu dropdown_menu_column3">
        <option>Automatic</option>
        <option>Badge Boosts</option>
        <option>Base Stats</option>
        <option>DVs</option>
        <option>EVs</option>
        <option>Detailed EVs</option>
        <option>Averages</option>
        <option>Medians</option>
    </select><br>
    <br>
    Right Panel:<br>
    <select v-model="right_panel" @change="$emit('update:right_panel', $event.target.value)" class="dropdownMenu dropdown_menu_column3">
        <option>Automatic</option>
        <option v-if="release == false">Inventory</option>
        <option>Movepool</option>
        <option>Splits</option>
    </select>
    <br>
    Compare splits::<br>
    <select v-model="toggle_compare_splits" @change="$emit('update:toggle_compare_splits', $event.target.value)" class="dropdownMenu dropdown_menu_column3">
        <option>First</option>
        <option>Followup</option>
        <option>Followup + Summary</option>
    </select>
    <br>
    <table>
        <tbody>
            <tr><td>Blackouts?:</td><td><input class="checkBoxStyle" type="checkbox" v-model="enable_blackouts" @change="$emit('update:enable_blackouts', $event.target.checked)"/></td></tr>
            <tr><td>Disable right panel hotkeys:</td><td><input class="checkBoxStyle" type="checkbox" v-model="disallow_right_panel_switching" @change="$emit('update:disallow_right_panel_switching', $event.target.checked)"/></td></tr>
            <tr><td>Automatic post-battle splits:</td><td><input class="checkBoxStyle" type="checkbox" v-model="automatic_post_battle_splits" @change="$emit('update:automatic_post_battle_splits', $event.target.checked)"/></td></tr>
            <tr><td>Show repel counter:</td><td><input class="checkBoxStyle" type="checkbox" v-model="show_repel_counter" @change="$emit('update:show_repel_counter', $event.target.checked)"/></td></tr>
            <tr><td>Show bonk/item counter:</td><td><input class="checkBoxStyle" type="checkbox" v-model="show_bonk_counter" @change="$emit('update:show_bonk_counter', $event.target.checked)"/></td></tr>
        </tbody>
    </table>
    <div v-if="show_bonk_counter == true">
        <select v-model="dropdown_bonks_items" class="dropdownMenu dropdown_menu_column3" @change="$emit('update:dropdown_bonks_items', $event.target.value)">
            <option>Bonks</option>
            <option>Item Count</option>
        </select>
        <br>
    </div>
    <br>
    <div v-if="release == false">
        <div style="text-decoration: underline;">Graphics Toggles:</div>
        <table>
            <tbody>
                <tr><td>Wild Pokemon:</td><td><input class="checkBoxStyle" type="checkbox" v-model="show_wild_battles" @change="$emit('update:show_wild_battles', $event.target.checked)"/></td></tr>
            </tbody>
        </table>
    </div>
`

module.exports = {
    template,
    props: [
        "stats_display",
        "release",
        "right_panel",
        "toggle_compare_splits",
        "enable_blackouts",
        "disallow_right_panel_switching",
        "automatic_post_battle_splits",
        "show_repel_counter",
        "show_bonk_counter",
        "dropdown_bonks_items",
        "show_wild_battles",
    ],
}