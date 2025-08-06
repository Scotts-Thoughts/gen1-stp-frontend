<template>
	<transition name="fade">
		<div v-if="settings.right_panel_mode == 'Movepool'" key=0>
			<movepool />
		</div>
		<div v-else-if="settings.right_panel_mode == 'Splits'" key=5>
			<div key=3>
				<div class="split_label">Splits</div>
				<div v-if="settings.right_panel.splits.mode === 'Followup'">
					<splits_followup :compare_splits :trainer_name_lookup />
				</div>
				<div v-else-if="settings.right_panel.splits.mode === 'First'">
					<splits_first :current_splits :trainer_name_lookup />
				</div>
				<div v-else-if="settings.right_panel.splits.mode === 'Followup + Summary'">
					<splits_summary :compare_splits :trainer_name_lookup :battle_summary_header />
				</div>
			</div>
		</div>		
		<div v-else-if="settings.right_panel_mode == 'Automatic' && (meta.gameState != 'No Pokemon' && (meta.gameState == 'To Battle' || meta.gameState == 'Battle'))" style="position: absolute;" key=1>
			<enemy_graphic v-if="(game_properties.battle.type as GameHookProperty).value == 'Trainer'" :enemy_pkmn_faint_types />
			<wild_pokemon v-else-if="(game_properties.battle.type as GameHookProperty).value == 'Wild'"  :enemy_pkmn_faint_types />
		</div>
		<div v-else key=3>
			<movepool/>
		</div>
	</transition>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { useOverlaySettingsStore } from "~/stores/useOverlaySettingsStore";
import { GameHookProperty } from "~/packages/gameHookMapperClient";
import { useMetaStore } from "~/stores/metaStore";
import { trainer_name_lookup } from "~/autosplitter/trainer_name_lookup";
import { convertDurationToSeconds, convertSecondsToDuration } from "~/utils/timehelpers";
import { split_trainers } from "~/autosplitter/split_trainers";
import movepool from "./right_panel/move_pool.vue"
import splits_followup from "./right_panel/splits_followup"
import splits_first from "./right_panel/splits_first"
import splits_summary from "./right_panel/splits_summary.vue"
import enemy_graphic from "./right_panel/enemy_graphic.vue"
import wild_pokemon from "./right_panel/wild_pokemon.vue"

export default defineComponent({
	props: [ "current_splits", "previous_splits", "collect_split_data"],
	components: {
		movepool,
		splits_followup,
		splits_first,
		splits_summary,
		enemy_graphic,
		wild_pokemon
	},
	data() {
		return {
			meta: useMetaStore(),
			settings: useOverlaySettingsStore(),
			game_properties: inject<Record<string, GameHookProperty>>("game_properties", {}),
			trainer_name_lookup,
            battle_summary_header: "Battle Summary",
		}
	},
	computed: {
		compare_splits() {
            if (this.collect_split_data != true) {
                return;
            }
            const result: any[] = []
            const game = this.game_properties.meta.gameName.value
            const addedTrainers = new Set(); // Keep track of the trainers that have been added to the result
            for (const x of this.previous_splits) {
                if (split_trainers[game].includes(x.trainer)) {
                    const default_string = "-"
                    const cur_split = this.current_splits.find(y => y.trainer === x.trainer)
                    const prev = convertDurationToSeconds(x.time)
                    if (cur_split == undefined) {
                        if (!addedTrainers.has(x.trainer)) { // Check if the trainer has already been added to the result
                            result.push({ 
								trainer: x.trainer, 
								previous_time: convertSecondsToDuration(prev), 
								current_time: default_string, 
								difference: default_string 
							});
                            addedTrainers.add(x.trainer); // Add the trainer to the set of added trainers
                        }
                        continue
                    }
                    const cur = convertDurationToSeconds(cur_split.time)
                    const diff = cur - prev;
                    const diff_abs = Math.abs(diff);
                    const diff_sign = Math.sign(diff);
                    const diff_m = Math.floor(diff_abs / 60);
                    const diff_s = diff_abs % 60;
                    var diff_str = `${diff_sign === -1 ? "-" : "+"}${diff_m}:${diff_s.toString().padStart(2, "0")}`;
                    if (diff_str == "+0:00") { diff_str = "0:00" }
                    if (!addedTrainers.has(x.trainer)) { // Check if the trainer has already been added to the result
                        result.push({ trainer: x.trainer, previous_time: convertSecondsToDuration(prev), current_time: convertSecondsToDuration(cur), difference: diff_str })
                        addedTrainers.add(x.trainer); // Add the trainer to the set of added trainers
                    }
                }
            }
            return result            
        },
	},
	methods: {
		enemy_pkmn_faint_types(pkmnData) {
            if (this.meta.gameState == `To Battle`) {
                return "filter: grayscale(0%) drop-shadow(0px 0px 1px #000000c5);"
            } else if (pkmnData?.hp == 0 || this.meta.gameState == `From Battle`) {
                return "filter: grayscale(100%) drop-shadow(0px 0px 1px #000000c5); opacity: .5; "
            }
            return "filter: grayscale(0%) drop-shadow(0px 0px 1px #000000c5);"            
        },
	}
})
</script>