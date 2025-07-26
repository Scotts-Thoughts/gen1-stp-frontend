import { ref, watch } from "vue";
import { useOverlaySettingsStore } from "./useOverlaySettingsStore"
import { useGameSpeciesData } from "./useGameSpeciesData";
import { useSpeciesMetricsStore } from "./useSpeciesMetricsStore"
import { PokemonGame } from "~/logic/PokeDataTypes";
import { defineStore } from "pinia";

export const useSettingsStore = defineStore('settings', () => {
	const metrics = useSpeciesMetricsStore();
	const overlay = useOverlaySettingsStore();
	const game_species = useGameSpeciesData();
	const starter = ref<string|null>("");
	const game = ref<PokemonGame|null>(null);
	
	overlay.$subscribe(async (_, state) => {
		if (state.game !== game.value || state.starter !== starter.value) {
			game.value = state.game;
			starter.value = state.starter;
			if (game.value && starter.value) {

				await metrics.load(game.value, starter.value);
				await game_species.loadConfig(game.value, starter.value);
				await game_species.loadStyle(game.value, starter.value);
			}
		}
	});

	// Save overlay settings on any change:
	overlay.$subscribe(() => overlay.save());
	metrics.$subscribe(() => metrics.save(overlay.game, overlay.starter));
	game_species.$subscribe(
		(_, state) => {
			document.documentElement.style.setProperty('--overlay-color', state.styling.ui.color);
			document.documentElement.style.setProperty('--style_ui_saturation', state.styling.ui.saturation.toString());
		}
	);
	// Automatically save the "config" section of the game_species data:
	watch(() => game_species.config, () => game_species.saveConfig(game.value, starter.value), { deep: true });

	return {
		metrics,
		overlay,
		game_species,
	};
})