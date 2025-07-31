import { ref, watch } from "vue";
import { useOverlaySettingsStore } from "./useOverlaySettingsStore"
import { useGameSpeciesData } from "./useGameSpeciesData";
import { useSpeciesMetricsStore } from "./useSpeciesMetricsStore"
import { PokemonGame } from "~/logic/PokeDataTypes";
import { defineStore } from "pinia";

/**
 * Store for managing general settings. This contains the other more specific settings stores.
 * See {@link useSpeciesMetricsStore}, {@link useOverlaySettingsStore}, {@link useGameSpeciesData}.
 * 
 * This store is also responsible for synchronising the above mentioned settings if and where needed. It also handles
 * automatic saving.
 * 
 * The global CSS variables `--overlay-color` and `--style_ui_saturation` are also handled here, because it is more
 * convenient to listen to changes of the overlay settigns store here than it is from inside the store.
 */
export const useSettingsStore = defineStore('settings', () => {
	const metrics = useSpeciesMetricsStore();
	const overlay = useOverlaySettingsStore();
	const runConfig = useGameSpeciesData();
	const starter = ref<string|null>("");
	const game = ref<PokemonGame|null>(null);
	
	// When the overlay settinsg change game or starter, update the relevant other stores:
	overlay.$subscribe(async (_, state) => {
		if (state.game !== game.value || state.starter !== starter.value) {
			game.value = state.game;
			starter.value = state.starter;
			if (game.value && starter.value) {
				await metrics.load(game.value, starter.value);
				await runConfig.loadConfig(game.value, starter.value);
				await runConfig.loadStyle(game.value, starter.value);
			}
		}
	});

	// Save overlay settings on any change:
	overlay.$subscribe(() => overlay.save());
	// Same for metrics:
	metrics.$subscribe(() => metrics.save(overlay.game, overlay.starter));
	// Automatically save the "config" section of the runConfig data:
	watch(() => runConfig.config, () => runConfig.saveConfig(game.value, starter.value), { deep: true });

	// Update the global CSS variables as needed:
	runConfig.$subscribe(
		(_, state) => {
			document.documentElement.style.setProperty('--overlay-color', state.styling.ui.color);
			document.documentElement.style.setProperty('--style_ui_saturation', state.styling.ui.saturation.toString());
		}
	);

	return {
		metrics,
		overlay,
		game_species: runConfig,
	};
})