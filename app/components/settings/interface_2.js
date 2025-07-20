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
                    <button @click="increment('attempt_number')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('attempt_number')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Finished Runs:</th>
                <th>{{this.$parent.finished_run_count}}</th>
                <th>
                    <button @click="increment('finished_run_count')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('finished_run_count')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Resets:</th>
                <th>{{this.$parent.playerResets}}</th>
                <th>
                    <button @click="increment('playerResets')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('playerResets')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Blackouts:</th>
                <th>{{this.$parent.blackout_counter}}</th>
                <th>
                    <button @click="increment('blackout_counter')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('blackout_counter')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Faults:</th>
                <th>{{this.$parent.playerResets + this.$parent.blackout_counter}}</th>
            </tr>
        </tbody>
    </table>
    <br>
</div>
`

module.exports = {
    template,
    methods: {
        increment(property) {
            this[property]++;
        },
        decrement(property) {
            if (this[property] == 0) {
                return 0
            }
            this[property]--;
        },
    }
}