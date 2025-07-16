const template = /*html*/`
    <div>Game:</div>
    <select v-model="game_name" class="dropdownMenu dropdown_menu_column3">
        <option>Yellow</option>
        <option v-if="release == false">Yellow Legacy</option>
        <option>Red</option>
        <option>Blue</option>
    </select><br>
    <br>
    <div>Timer Setting:</div>
    <button class="buttonStyle buttonStyle_column3" @click="this.timer.pauseUnpauseTime()">Play/Pause</button>
    <button class="buttonStyle set_button_style" @click="this.timer.setTimer(this.timer_startTimeOffset)">Set Timer</button><input type="text" class="inputContainer" v-model="timer_startTimeOffset" placeholder="00:00:00.00"/><br>
    <br>
    <button class="buttonStyle buttonStyle_column3" @click="openFolder('splits', game, starterName, 'finishes')">Open Splits Folder</button>
    <br>
    <br>
    <div v-if="release == false">
        <table>
            <tbody>
                <tr><td>Test run:</td><td><input class="checkBoxStyle" type="checkbox" v-model="test_run"/></td></tr>
                <tr><td>Refilming mode:</td><td><input class="checkBoxStyle" type="checkbox" v-model="refilming_mode"/></td></tr>
                <tr><td>No attempt/split:</td><td><input class="checkBoxStyle" type="checkbox" v-model="no_attempt"/></td></tr>
            </tbody>
        </table>
        <table v-if="refilming_mode">
            <tbody>
                <tr><td>Attempt:</td><td><input class="inputContainer" type="text" v-model="refilmed_attempt"/></td></tr>
                <tr><td>Finish:</td><td><input class="inputContainer" type="text" v-model="refilmed_finish"/></td></tr>
            </tbody>
        </table>
        <br>
    </div>
    <div v-if="test_run == true">
        <div>Moveset Updating:</div>
        <input type="text" v-model="move1_replacement" placeholder="Input move 1">
        <input type="text" v-model="move2_replacement" placeholder="Input move 2">
        <input type="text" v-model="move3_replacement" placeholder="Input move 3">
        <input type="text" v-model="move4_replacement" placeholder="Input move 4">
        <button class="buttonStyle buttonStyle_column3" @click="update_moveset">Update Party Moves</button>
        <button class="buttonStyle buttonStyle_column3" @click="update_battle_moveset">Update Battle Moves</button>
        <br>
        <br>
        <div>Item Updating:</div>
        <input type="text" v-model="item1_replacement" placeholder="Input item 1">
        <input type="text" v-model="item2_replacement" placeholder="Input item 2">
        <input type="text" v-model="item3_replacement" placeholder="Input item 3">
        <input type="text" v-model="item4_replacement" placeholder="Input item 4">
        <button class="buttonStyle buttonStyle_column3" @click="update_items">Update</button>
        <br>
        <br>
    </div>
    <div v-if="release == false">
        <div>Debugging:</div>
        <table>
            <tbody>
                <tr><td>State:</td><td>{{state}}</td></tr>
                <tr><td>Mapper State:</td><td>{{mapper.properties.meta.state.value}}</td></tr>
                <tr><td>Enemy State:</td><td>{{enemyState}}</td></tr>
                <tr><td></td><td></td></tr>
                <tr><td>blackout:</td><td>{{blackout}}</td></tr>
            </tbody>
        </table>
    </div>
`

module.exports = {
    template,
    props: [
        "game_name",
        "release",
        "test_run",
        "refilming_mode",
        "no_attempt",
        "refilmed_attempt",
        "refilmed_finish",
        "state",
        "mapper",
        "enemyState",
        "blackout",
        "timer",
        "timer_startTimeOffset",
        "move1_replacement",
        "move2_replacement",
        "move3_replacement",
        "move4_replacement",
        "item1_replacement",
        "item2_replacement",
        "item3_replacement",
        "item4_replacement",
        "openFolder",
        "starterName",
        "update_moveset",
        "update_battle_moveset",
        "update_items",
    ],
}