const template = /*html*/`
    <div>Game:</div>
    <select v-model="$parent.game_name" class="dropdownMenu dropdown_menu_column3">
        <option>Yellow</option>
        <option v-if="$parent.release == false">Yellow Legacy</option>
        <option>Red</option>
        <option>Blue</option>
    </select><br>
    <br>
    <div>Timer Setting:</div>
    <button class="buttonStyle buttonStyle_column3" @click="this.$parent.timer.pauseUnpauseTime()">Play/Pause</button>
    <button class="buttonStyle set_button_style" @click="this.$parent.timer.setTimer(this.timer_startTimeOffset)">Set Timer</button><input type="text" class="inputContainer" v-model="$parent.timer_startTimeOffset" placeholder="00:00:00.00"/><br>
    <br>
    <button class="buttonStyle buttonStyle_column3" @click="$parent.openFolder('splits', game, starterName, 'finishes')">Open Splits Folder</button>
    <br>
    <br>
    <div v-if="$parent.release == false">
        <table>
            <tbody>
                <tr><td>Test run:</td><td>        <input class="checkBoxStyle" type="checkbox" v-model="$parent.test_run"/></td></tr>
                <tr><td>Refilming mode:</td><td>  <input class="checkBoxStyle" type="checkbox" v-model="$parent.refilming_mode"/></td></tr>
                <tr><td>No attempt/split:</td><td><input class="checkBoxStyle" type="checkbox" v-model="$parent.no_attempt"/></td></tr>
            </tbody>
        </table>
        <table v-if="$parent.refilming_mode">
            <tbody>
                <tr><td>Attempt:</td><td><input class="inputContainer" type="text" v-model="$parent.refilmed_attempt"/></td></tr>
                <tr><td>Finish:</td><td> <input class="inputContainer" type="text" v-model="$parent.refilmed_finish"/></td></tr>
            </tbody>
        </table>
        <br>
    </div>
    <div v-if="$parent.test_run == true">
        <div>Moveset Updating:</div>
        <input type="text" v-model="$parent.move1_replacement" placeholder="Input move 1">
        <input type="text" v-model="$parent.move2_replacement" placeholder="Input move 2">
        <input type="text" v-model="$parent.move3_replacement" placeholder="Input move 3">
        <input type="text" v-model="$parent.move4_replacement" placeholder="Input move 4">
        <button class="buttonStyle buttonStyle_column3" @click="$parent.update_moveset">Update Party Moves</button>
        <button class="buttonStyle buttonStyle_column3" @click="$parent.update_battle_moveset">Update Battle Moves</button>
        <br>
        <br>
        <div>Item Updating:</div>
        <input type="text" v-model="$parent.item1_replacement" placeholder="Input item 1">
        <input type="text" v-model="$parent.item2_replacement" placeholder="Input item 2">
        <input type="text" v-model="$parent.item3_replacement" placeholder="Input item 3">
        <input type="text" v-model="$parent.item4_replacement" placeholder="Input item 4">
        <button class="buttonStyle buttonStyle_column3" @click="$parent.update_items">Update</button>
        <br>
        <br>
    </div>
    <div v-if="$parent.release == false">
        <div>Debugging:</div>
        <table>
            <tbody>
                <tr><td>State:</td><td>{{$parent.state}}</td></tr>
                <tr><td>Mapper State:</td><td>{{$parent.mapper.properties.meta.state.value}}</td></tr>
                <tr><td>Enemy State:</td><td>{{$parent.enemyState}}</td></tr>
                <tr><td></td><td></td></tr>
                <tr><td>blackout:</td><td>{{$parent.blackout}}</td></tr>
            </tbody>
        </table>
    </div>
`

module.exports = {
    template,
}