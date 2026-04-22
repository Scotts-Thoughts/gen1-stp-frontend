<template>
<div>
    <button class="buttonStyle new_run_button" @click="clear_run">New Run</button>
    <br>
    <button class="buttonStyle comparison_button" @click="load_splits()">Split Comparison</button><br>
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
                <td style="text-align: left;">Attempt:</td>
                <td>{{metrics.attempts}}</td>
                <td>
                    <button @click="increment('attempts')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('attempts')" class="smallButtonStyle decrement">-</button>
                </td>
            </tr>
            <tr>
                <td style="text-align: left;">Finished Runs:</td>
                <td>{{metrics.finishes}}</td>
                <td>
                    <button @click="increment('finishes')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('finishes')" class="smallButtonStyle decrement">-</button>
                </td>
            </tr>
            <tr>
                <td style="text-align: left;">Resets:</td>
                <td>{{metrics.resets}}</td>
                <td>
                    <button @click="increment('resets')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('resets')" class="smallButtonStyle decrement">-</button>
                </td>
            </tr>
            <tr>
                <td style="text-align: left;">Blackouts:</td>
                <td>{{metrics.blackouts}}</td>
                <td>
                    <button @click="increment('blackouts')" class="smallButtonStyle increment">+</button>
                    <button @click="decrement('blackouts')" class="smallButtonStyle decrement">-</button>
                </td>
            </tr>
            <tr>
                <td style="text-align: left;">Faults:</td>
                <td>{{faults}}</td>
            </tr>
        </tbody>
    </table>
    <br>
</div>
</template>

<script lang="ts">
import PubSub from "~/logic/PubSub";
import { SpeciesMetrics, useSpeciesMetricsStore } from "~/stores/useSpeciesMetricsStore.ts";
import { useGameSpeciesData } from "~/stores/useGameSpeciesData.ts";
import { defineComponent } from "vue";

export default defineComponent({
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
        increment(property: keyof SpeciesMetrics) {
            if (typeof this.metrics[property] === "number") {
                this.metrics.update(property, this.metrics[property] +1);
            }
        },
        decrement(property: keyof SpeciesMetrics) {
            if (typeof this.metrics[property] === "number") {
                this.metrics.update(property, Math.max(0, this.metrics[property] -1));
            }
        },
        async load_csv_file() {
            // @ts-expect-error
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
            const results: any[] = []
            for (const row of rows) {
                const columns = row.split(",");
                results.push({trainer: columns[2], time: columns[3]})
            }
            // @ts-expect-error
            this.$parent.$parent.previous_splits = results;
        },
    },
});
</script>