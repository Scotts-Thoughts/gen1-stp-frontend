const template = /*html*/`
<div>
    <div>Stats:</div>
    <select v-model="$parent.stats_display" class="dropdownMenu dropdown_menu_column3">
        <option>Automatic</option>
        <option>Badge Boosts</option>
        <option>Base Stats</option>
        <option>DVs</option>
        <option>EVs</option>
        <option>Detailed EVs</option>
        <option>Averages</option>
        <option>Medians</option>
        <option>Vitamins</option>
    </select><br>
    <br>
    Right Panel:<br>
    <select v-model="$parent.right_panel" class="dropdownMenu dropdown_menu_column3">
        <option>Automatic</option>
        <option v-if="$parent.release == false">Inventory</option>
        <option>Movepool</option>
        <option>Splits</option>
    </select>
    <br>
    Compare splits::<br>
    <select v-model="$parent.toggle_compare_splits" class="dropdownMenu dropdown_menu_column3">
        <option>First</option>
        <option>Followup</option>
        <option>Followup + Summary</option>
    </select>
    <br>
    <table>
        <tbody>
            <tr><td>Disable right panel hotkeys:</td><td> <input class="checkBoxStyle" type="checkbox" v-model="$parent.disallow_right_panel_switching"/></td></tr>
            <tr><td>Automatic post-battle splits:</td><td><input class="checkBoxStyle" type="checkbox" v-model="$parent.automatic_post_battle_splits"/></td></tr>
            <tr><td>Show repel counter:</td><td>          <input class="checkBoxStyle" type="checkbox" v-model="$parent.show_repel_counter"/></td></tr>
            <tr><td>Show bonk/item counter:</td><td>      <input class="checkBoxStyle" type="checkbox" v-model="$parent.show_bonk_counter"/></td></tr>
        </tbody>
    </table>
    <div v-if="$parent.show_bonk_counter == true">
        <select v-model="$parent.dropdown_bonks_items" class="dropdownMenu dropdown_menu_column3">
            <option>Bonks</option>
            <option>Item Count</option>
        </select>
        <br>
    </div>
    <br>
    <div v-if="$parent.release == false">
        <div style="text-decoration: underline;">Graphics Toggles:</div>
        <table>
            <tbody>
                <tr><td>Wild Pokemon:     </td><td><input class="checkBoxStyle" type="checkbox" v-model="$parent.show_wild_battles"/></td></tr>
            </tbody>
        </table>
    </div>
</div>
`

module.exports = {
    template,
}