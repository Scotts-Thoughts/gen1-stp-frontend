const Storage = require("../../logic/Storage.js");
const PubSub = require("../../logic/PubSub");

const template = /*html*/`
<div>
    <button class="buttonStyle new_run_button" @click="clear_run">New Run</button>
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
                <th>{{resets}}</th>
                <th>
                    <button @click="increment('counter_resets')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('counter_resets')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Blackouts:</th>
                <th>{{blackouts}}</th>
                <th>
                    <button @click="increment('counter_blackouts')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('counter_blackouts')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Faults:</th>
                <th>{{faults}}</th>
            </tr>
        </tbody>
    </table>
    <br>
</div>
`

module.exports = {
    template,
    props: [
        "game_name",
        "starterName",
    ],
    data() {
        return {
            resets:    Storage.games[this.game_name]?.[this.starterName]?.data?.counter_resets    ?? 0,
            blackouts: Storage.games[this.game_name]?.[this.starterName]?.data?.counter_blackouts ?? 0,
        }
    },
    computed: {
        faults() {
            return this.resets + this.blackouts
        }
    },
    created() {
        PubSub.subscribe("@property/update/counter_resets", this.update_resets);
        PubSub.subscribe("@property/update/counter_blackouts", this.update_blackouts);
    },
    methods: {
        update_resets(value) {
            this.resets = value
        },
        update_blackouts(value) {
            this.blackouts = value
        },
        clear_run() {
            PubSub.publish("@run/cleared");
        },
        increment(property) {
            PubSub.publish("@property/increment", property);
        },
        decrement(property) {
            PubSub.publish("@property/decrement", property);
        },
    },
}