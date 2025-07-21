import battle_testing from "./battle_testing";
// todo: remove the "parent.parent" stuff.
// todo: Put timer_startTimeOffset into the game/species settings.
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
    <button class="buttonStyle buttonStyle_column3" @click="this.$parent.$parent.timer.pauseUnpauseTime()">Play/Pause</button>
    <button class="buttonStyle set_button_style" @click="this.$parent.$parent.timer.setTimer(this.timer_startTimeOffset)">Set Timer</button><input type="text" class="inputContainer" v-model="timer_startTimeOffset" placeholder="00:00:00.00"/><br>
    <br>
    <button class="buttonStyle buttonStyle_column3" @click="$parent.openFolder('splits', $parent.game_name, $parent.starterName, 'finishes')">Open Splits Folder</button>
    <br>
    <br>
    <div v-if="isRelease == false">
        <table>
            <tbody>
                <tr><td>Test run:</td><td>        <input class="checkBoxStyle" type="checkbox" v-model="$parent.test_run"/></td></tr>
                <tr><td>Refilming mode:</td><td>  <input class="checkBoxStyle" type="checkbox" v-model="$parent.refilming_mode"/></td></tr>
                <tr><td>No attempt/split:</td><td><input class="checkBoxStyle" type="checkbox" v-model="$parent.no_attempt"/></td></tr>
            </tbody>
        </table>
        <table v-if="$parent.$parent.refilming_mode">
            <tbody>
                <tr><td>Attempt:</td><td><input class="inputContainer" type="text" v-model="$parent.$parent.refilmed_attempt"/></td></tr>
                <tr><td>Finish:</td><td> <input class="inputContainer" type="text" v-model="$parent.$parent.refilmed_finish"/></td></tr>
            </tbody>
        </table>
        <br>
    </div>
    <div v-if="$parent.$parent.test_run == true">
        <battle_testing :mapper="$parent.mapper"></battle_testing>
    </div>
    <div v-if="isRelease == false">
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

export default {
    template,
    components: {
        battle_testing,
    },
    data() {
        return {
            timer_startTimeOffset: "00:00:00.00",
        }
    },
    computed: {
        isRelease() {
            return process.env.NODE_ENV === "development";
        }
    }
}