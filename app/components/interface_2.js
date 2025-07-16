const template = /*html*/`
<div>
    <div>Solo Pokemon:</div>
    <select v-model="$parent.starterName" class="dropdownMenu dropdown_menu_column3" style="background-color: rgb(201, 199, 100)">
        <option disabled value="">Select a species</option>
        <option v-for="key in $parent.filtered_pokemon_list" :value="key">{{key}}</option>
    </select><br>
    <div>Search Pokemon:</div>
    <input type="text" v-model="$parent.search_term" placeholder="Search for a species">
    <button class="buttonStyle set_starter_button" @click="$parent.set_rom_starter">Set ROM Starter</button>
    <button class="buttonStyle new_run_button" @click="$parent.newRun">New Run</button>
    <button class="buttonStyle new_run_button" @click="$parent.set_encounters">Set Encounters</button>
    <br>
    <button class="buttonStyle comparison_button" @click="$parent.load_splits()">Split Comparison</button><br>
    <table>
        <tbody>
            <tr>
                <td>Previous: </td>
                <td><input type="text" class="inputContainer" v-model="$parent.previous_label" placeholder="Previous"/></td>
            </tr>
            <tr>
                <td>Current: </td>
                <td><input type="text" class="inputContainer" v-model="$parent.current_label" placeholder="Current"/></td>
            </tr>
        </tbody>
    </table>
    <br>
    <table>
        <tbody>
            <tr>
                <th style="text-align: left;">Attempt:</th>
                <th>{{this.$parent.attempt_number}}</th>
                <th>
                    <button @click="$parent.increment('attempt_number')" class="smallButtonStyle increment">+</button>
                    <button @click="$parent.decrement('attempt_number')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Finished Runs:</th>
                <th>{{this.$parent.finished_run_count}}</th>
                <th>
                    <button @click="$parent.increment('finished_run_count')" class="smallButtonStyle increment">+</button>
                    <button @click="$parent.decrement('finished_run_count')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Resets:</th>
                <th>{{this.$parent.playerResets}}</th>
                <th>
                    <button @click="$parent.increment('playerResets')" class="smallButtonStyle increment">+</button>
                    <button @click="$parent.decrement('playerResets')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Blackouts:</th>
                <th>{{this.$parent.blackout_counter}}</th>
                <th>
                    <button @click="$parent.increment('blackout_counter')" class="smallButtonStyle increment">+</button>
                    <button @click="$parent.decrement('blackout_counter')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Faults:</th>
                <th>{{this.$parent.playerResets + this.$parent.blackout_counter}}</th>
            </tr>
        </tbody>
    </table>
    <br>
    <div>Encounter Settings:</div>
    <table>
        <tbody>
            <tr><td>Early Encounters:</td><td><input class="checkBoxStyle" type="checkbox" v-model="$parent.toggle_wEarlyEncounters"/></td></tr>
            <tr><td>No Moon:</td><td>         <input class="checkBoxStyle" type="checkbox" v-model="$parent.toggle_wEarlyEncountersNoMoon"/></td></tr>
        </tbody>
    </table>
    <table v-if="$parent.game_name == 'Yellow'" class="ui_table">
        <tbody>
            <tr v-if="$parent.release == false"><td>Route 1</td>        <td>- Test:</td><td><input      class="checkBoxStyle" type="checkbox" v-model="$parent.toggle_EVENT_ENCOUNTER_ROUTE1_TEST"/></td></tr>
            <tr>                                <td>Viridian Forest</td><td>- Pidgey:</td><td><input    class="checkBoxStyle" type="checkbox" v-model="$parent.toggle_EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY"/></td></tr>
            <tr>                                <td>Route 3</td>        <td>- Spearow:</td><td><input   class="checkBoxStyle" type="checkbox" v-model="$parent.toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW"/></td></tr>
            <tr>                                <td>Mt. Moon</td>       <td>- Sandshrew:</td><td><input class="checkBoxStyle" type="checkbox" v-model="$parent.toggle_EVENT_ENCOUNTER_MTMOON_SANDSHREW"/></td></tr>
            <tr>                                <td>Route 16</td>       <td>- Doduo:</td><td><input     class="checkBoxStyle" type="checkbox" v-model="$parent.toggle_EVENT_ENCOUNTER_ROUTE16_DODUO"/></td></tr>
        </tbody>
    </table>
    <table v-if="$parent.game_name == 'Red' || $parent.game_name == 'Blue'" class="ui_table">
        <tbody>
            <tr><td>Route 3</td> <td>- Spearow:</td> <td><input class="checkBoxStyle" type="checkbox" v-model="$parent.toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW"/></td></tr>
            <tr><td>Mt. Moon</td><td>- Geodude:</td> <td><input class="checkBoxStyle" type="checkbox" v-model="$parent.toggle_EVENT_ENCOUNTER_MTMOON_GEODUDE"/></td></tr>
            <tr><td>Mt. Moon</td><td>- Paras:</td>   <td><input class="checkBoxStyle" type="checkbox" v-model="$parent.toggle_EVENT_ENCOUNTER_MTMOON_PARAS"/></td></tr>
            <tr><td>Route 6</td> <td>- Cut User:</td><td><input class="checkBoxStyle" type="checkbox" v-model="$parent.toggle_EVENT_ENCOUNTER_ROUTE6_CUT_USER"/></td></tr>
            <tr><td>Route 16</td><td>- Doduo:</td>   <td><input class="checkBoxStyle" type="checkbox" v-model="$parent.toggle_EVENT_ENCOUNTER_ROUTE16_DODUO"/></td></tr>
        </tbody>
    </table>
    <br>
</div>
`

module.exports = {
    template,
}