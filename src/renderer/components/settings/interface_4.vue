
<template>
<div>
    <div>Stats:</div>
    <select v-model="settings.left_panel.stats.mode" class="dropdownMenu dropdown_menu_column3">
        <option>{{StatsPanelMode.automatic}}</option>
        <option>{{StatsPanelMode.badge_boosts}}</option>
        <option>{{StatsPanelMode.base_stats}}</option>
        <option>{{StatsPanelMode.dvs}}</option>
        <option>{{StatsPanelMode.evs}}</option>
        <option>{{StatsPanelMode.detailed_evs}}</option>
        <option>{{StatsPanelMode.averages}}</option>
        <option>{{StatsPanelMode.medians}}</option>
        <option>{{StatsPanelMode.vitamins}}</option>
    </select><br>
    <br>
    Right Panel:<br>
    <select v-model="settings.right_panel.mode" class="dropdownMenu dropdown_menu_column3">
        <option>{{RightPanelMode.automatic}}</option>
        <option>{{RightPanelMode.movepool}}</option>
        <option>{{RightPanelMode.splits}}</option>
    </select>
    <br>
    Compare splits::<br>
    <select v-model="settings.right_panel.splits.mode" class="dropdownMenu dropdown_menu_column3">
        <option>{{ SplitsMode.first }}</option>
        <option>{{ SplitsMode.followup }}</option>
        <option>{{ SplitsMode.followup_summary }}</option>
    </select>
    <br>
    <table>
        <tbody>
            <tr>
                <td>Disable right panel hotkeys:</td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="settings.right_panel.hotkeys"/></td>
            </tr>
            <tr>
                <td>Automatic post-battle splits:</td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="settings.right_panel.post_battle_splits"/></td>
            </tr>
            <tr>
                <td>Show repel counter:</td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="settings.pop_ups.repel.enabled"/></td></tr>
            <tr>
                <td>Show bonk/item counter:</td>
                <td><input class="checkBoxStyle" type="checkbox" v-model="settings.pop_ups.bonks.enabled"/></td></tr>
        </tbody>
    </table>
    <div v-if="settings.pop_ups.bonks.enabled">
        <select v-model="settings.pop_ups.bonks.mode" class="dropdownMenu dropdown_menu_column3">
            <option>Bonks</option>
            <option>Item Count</option>
        </select>
        <br>
    </div>
    <br>
    <div v-if="isRelease == false">
        <div style="text-decoration: underline;">Graphics Toggles:</div>
        <table>
            <tbody>
                <tr>
                    <td>Wild Pokemon:     </td>
                    <td><input class="checkBoxStyle" type="checkbox" v-model="settings.right_panel.wild_battles"/></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { RightPanelMode, SplitsMode, StatsPanelMode, useOverlaySettingsStore } from "../../stores/useOverlaySettingsStore";
export default defineComponent({
    data() {
        return { 
            settings: useOverlaySettingsStore(), 
            StatsPanelMode,
            RightPanelMode,
            SplitsMode,
        }
    },
    computed: {
        isRelease() {
            return process.env.NODE_ENV === "development";
        }
    }
});
</script>