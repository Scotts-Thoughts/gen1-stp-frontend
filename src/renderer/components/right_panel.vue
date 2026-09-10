<template>
	<transition name="fade">
		<!-- Style Mode (dev only): replaces the right panel with a dummy slot-0
		     enemy graphic so every species can be styled. Layout mirrors the
		     live enemy_graphic.vue component (single slot) with dummy stats
		     and moves so all surrounding graphics render. -->
		<div v-if="resize.style_mode_active" key="style_mode" style="position: absolute;">
			<div class="trainerLabel">{{ resize.styleModeCurrentSpecies }} {{ resize.style_mode_index + 1 }}/{{ resize.style_mode_species_list.length }}</div>
			<div class="tinted-box" style="height: 242px;" :style="`--url: url(images/ui/opponent.svg);`"></div>
			<div class="enemyGraphic">
				<div class="ePkmnStyle">
					<img v-if="meta.game == 'Yellow'" class="ePkmnSprite ePkmnSpriteResizing"
						:data-enemy-slot="0"
						:data-enemy-species="resize.styleModeCurrentSpecies"
						:style="{ transform: resize.transformFor(resize.styleModeCurrentSpecies), filter: `drop-shadow(${resize.getFlipped(resize.styleModeCurrentSpecies) ? -2 : 2}px 2px 2px #000000c5) saturate(1.1)` }"
						:src="'images/pokemon/' + resize.styleModeCurrentSpecies + '.png'"/>
					<img v-else-if="meta.game == 'Red and Blue'" class="ePkmnSprite ePkmnSpriteResizing"
						:data-enemy-slot="0"
						:data-enemy-species="resize.styleModeCurrentSpecies"
						:style="{ transform: resize.transformFor(resize.styleModeCurrentSpecies), filter: `drop-shadow(${resize.getFlipped(resize.styleModeCurrentSpecies) ? -2 : 2}px 2px 2px #000000c5) saturate(1.1)` }"
						:src="'images/pokemon/Red_and_Blue/' + resize.styleModeCurrentSpecies + '.png'"/>
					<div class="ePkmnSpecies opacityTransition">{{ resize.styleModeCurrentSpecies }}</div>
					<div class="ePkmnLevel opacityTransition">Lv:50</div>

					<img class="ePkmnTypeIcons ePkmnType_1 ds opacityTransition"
						:src="'images/elements/type-icons/' + styleModeType(1).toLowerCase() + '.png'"/>
					<img v-if="styleModeType(1) != styleModeType(2)" class="ePkmnTypeIcons ePkmnType_2 ds opacityTransition"
						:src="'images/elements/type-icons/' + styleModeType(2).toLowerCase() + '.png'"/>

					<img class="canvas red-svg" :src="'images/ui/speed_comp/0.svg'"/>
					<img class="enemyStatsArea opacityTransition" :src="'images/stats/0.svg'"/>

					<img v-for="(dummy, i) in style_mode_dummy_moves"
						:class="'ds eMoveIconStyle moveIcon' + (i + 1) + ' opacityTransition'"
						:src="'images/elements/type-icons/' + dummy.type + '.png'"/>
					<div v-for="(dummy, i) in style_mode_dummy_moves"
						:class="'ePkmnMoveStyle ePkmnMove' + (i + 1) + ' opacityTransition'">{{ dummy.name }}</div>

					<div class="ePkmnStatLabelStyle ePkmnLabelHp   opacityTransition" style="opacity: .7;">HP</div>
					<div class="ePkmnStatLabelStyle ePkmnLabelAtk  opacityTransition" style="opacity: .7;">Atk.</div>
					<div class="ePkmnStatLabelStyle ePkmnLabelDef  opacityTransition" style="opacity: .7;">Def.</div>
					<div class="ePkmnStatLabelStyle ePkmnLabelSpc  opacityTransition" style="opacity: .7;">Spc.</div>
					<div class="ePkmnStatLabelStyle ePkmnLabelSpe  opacityTransition" style="opacity: .7;">Spe.</div>
					<div class="ePkmnStatLabelStyle ePkmnLabelCrit opacityTransition" style="opacity: .7;">Crit.</div>

					<div class="ePkmnStatsStyle ePkmnHp   opacityTransition">{{ styleModeStat('hp')              }}</div>
					<div class="ePkmnStatsStyle ePkmnAtk  opacityTransition">{{ styleModeStat('attack')          }}</div>
					<div class="ePkmnStatsStyle ePkmnDef  opacityTransition">{{ styleModeStat('defense')         }}</div>
					<!-- Live enemy_graphic.vue maps .ePkmnSpc -> speed and .ePkmnSpe -> special.
					     We mirror that here so the dummy aligns the same way visually. -->
					<div class="ePkmnStatsStyle  ePkmnSpc  opacityTransition">{{ styleModeStat('speed')           }}</div>
					<div class="ePkmnStatsStyle ePkmnSpe  opacityTransition">{{ styleModeStat('special_attack')  }}</div>
					<div class="ePkmnStatsStyle ePkmnCrit opacityTransition">—%</div>
				</div>
			</div>
		</div>
		<div v-else-if="settings.right_panel_mode == 'Movepool'" key=0>
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
		<div v-else-if="settings.right_panel_mode == 'Automatic' && (meta.gameState == 'To Battle' || meta.gameState == 'Battle') && (battle_type == 'Trainer' || (battle_type == 'Wild' && settings.right_panel.wild_battles))" style="position: absolute;" key=1>
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
import { useEnemySpriteResizeStore } from "~/stores/useEnemySpriteResizeStore";
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
import PokeData from "~/logic/PokeData";

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
			resize: useEnemySpriteResizeStore(),
			game_properties: inject<Record<string, GameHookProperty>>("game_properties", {}),
			trainer_name_lookup,
            battle_summary_header: "Battle Summary",
			style_mode_dummy_moves: [
				{ name: "Tackle",    type: "normal" },
				{ name: "Water Gun", type: "water"  },
				{ name: "Ember",     type: "fire"   },
				{ name: "Vine Whip", type: "grass"  },
			] as { name: string; type: string }[],
		}
	},
	computed: {
		/** "Trainer", "Wild" or "None". */
		battle_type(): string {
			return (this.game_properties.battle?.type as unknown as GameHookProperty)?.value ?? "None";
		},
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
		styleModeType(which: 1 | 2): string {
			const species = this.resize.styleModeCurrentSpecies;
			if (!species) return "Normal";
			try {
				const data = PokeData.getSpecies(species);
				return (which === 1 ? data.type_1 : data.type_2) ?? "Normal";
			} catch (e) {
				return "Normal";
			}
		},
		styleModeStat(stat: "hp" | "attack" | "defense" | "speed" | "special_attack" | "special_defense"): number {
			const species = this.resize.styleModeCurrentSpecies;
			if (!species) return 50;
			try {
				return PokeData.getSpecies(species).base_stats[stat] ?? 50;
			} catch (e) {
				return 50;
			}
		},
	}
})
</script>