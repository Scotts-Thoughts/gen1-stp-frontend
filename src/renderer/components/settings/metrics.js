import PubSub from "~/logic/PubSub";
import {useSpeciesMetricsStore} from "~/stores/useSpeciesMetricsStore.ts";
import {useGameSpeciesData} from "~/stores/useGameSpeciesData.ts";
import { defineComponent } from "vue";

const template = /*html*/`
<div>
    <button class="buttonStyle new_run_button" @click="clear_run">New Run</button>
    <br>
    <button class="buttonStyle comparison_button" @click="$parent.load_splits()">Split Comparison</button><br>
    <table>
        <tbody>
            <tr>
                <td>Previous: </td>
                <td><input type="text" class="inputContainer" v-model="runConfig.config.labels.split_previous" placeholder="Previous"/></td>
            </tr>
            <tr>
                <td>Current: </td>
                <td><input type="text" class="inputContainer" v-model="runConfig.config.labels.split_current" placeholder="Current"/></td>
            </tr>
        </tbody>
    </table>
    <br>
    <table>
        <tbody>
            <tr>
                <th style="text-align: left;">Attempt:</th>
                <th>{{metrics.attempts}}</th>
                <th>
                    <button @click="increment('attempts')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('attempts')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Finished Runs:</th>
                <th>{{metrics.finishes}}</th>
                <th>
                    <button @click="increment('finishes')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('finishes')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Resets:</th>
                <th>{{metrics.resets}}</th>
                <th>
                    <button @click="increment('resets')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('resets')" class="smallButtonStyle decrement">-</button>
                </th>
            </tr>
            <tr>
                <th style="text-align: left;">Blackouts:</th>
                <th>{{metrics.blackouts}}</th>
                <th>
                    <button @click="increment('blackouts')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('blackouts')" class="smallButtonStyle decrement">-</button>
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

export default defineComponent({
    template,
    data() {
        return {
            runConfig: useGameSpeciesData(),
            metrics: useSpeciesMetricsStore(),
        }
    },
    computed: {
        faults() {
            
            return this.metrics.resets + this.metrics.blackouts;
        }
    },
    methods: {
        clear_run() {
            PubSub.publish("@run/cleared");
        },
        increment(property) {
            this.metrics.update(property, this.metrics[property] +1);
        },
        decrement(property) {
            this.metrics.update(property, Math.max(0, this.metrics[property] -1));
        },
        async load_csv_file() {
            const file = await window.showOpenFilePicker({
                id: "Gen1SplitsFolder",
                types: [{
                    description: "Split files",
                    accept: { "text/csv": [".csv"] }
                }]
            });
            const contents = await file[0].getFile();
            const text = await contents.text();
            return text;
        },
        async load_splits() {
            const text = await this.load_csv_file();
            const rows = text.split("\n").slice(1).filter(x => x !== '');
            const results = []
            for (const row of rows) {
                const columns = row.split(",");
                results.push({trainer: columns[2], time: columns[3]})
            }
            this.$parent.$parent.previous_splits = results;
        },
    },
});