import { ref } from "vue";
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
 * automatic saving: every change to any of the stores is written to disk right away, so switching species or
 * restarting the overlay never loses anything.
 *
 * The global CSS variables `--overlay-color` and `--style_ui_saturation` are also handled here, because it is more
 * convenient to listen to changes of the overlay settigns store here than it is from inside the store.
 */
export const useSettingsStore = defineStore('settings', () => {
	const metrics = useSpeciesMetricsStore();
	const overlay = useOverlaySettingsStore();
	const runConfig = useGameSpeciesData();
	const starter = ref<string|null>(null);
	const game = ref<PokemonGame|null>(null);
	/** True while the data of a species is being read from disk. Automatic saving is suspended during that time. */
	const loading = ref(false);
	// Species loads are chained so that a quick succession of game/starter changes always ends with the data of the
	// last selected species in the stores.
	let loadChain: Promise<void> = Promise.resolve();

	async function loadSpecies(newGame: PokemonGame, newStarter: string) {
		loading.value = true;
		try {
			await metrics.load(newGame, newStarter);
			await runConfig.load(newGame, newStarter);
		} finally {
			loading.value = false;
		}
		// Persist right away, so that data migrated from the legacy Storage.json (or a preset) is on disk even if
		// the user changes nothing.
		await metrics.save(newGame, newStarter);
		await runConfig.save(newGame, newStarter);
	}

	// When the overlay settings change game or starter, update the relevant other stores:
	overlay.$subscribe((_, state) => {
		if (state.game !== game.value || state.starter !== starter.value) {
			game.value = state.game;
			starter.value = state.starter;
			if (game.value && starter.value) {
				const nextGame = game.value;
				const nextStarter = starter.value;
				loadChain = loadChain
					.then(() => loadSpecies(nextGame, nextStarter))
					.catch((err) => console.error("[settings] Failed to load species data:", err));
			}
		}
	});

	// Save overlay settings on any change:
	overlay.$subscribe(() => overlay.save());
	// Same for metrics:
	metrics.$subscribe(() => {
		if (!loading.value) {
			metrics.save(game.value, starter.value);
		}
	});
	// And for the game/species data (run configuration and styling):
	runConfig.$subscribe((_, state) => {
		applyCssVariables(state.styling.ui);
		if (!loading.value) {
			runConfig.save(game.value, starter.value);
		}
	});
	applyCssVariables(runConfig.styling.ui);

	function applyCssVariables(ui: { color: string, saturation: number | string }) {
		document.documentElement.style.setProperty('--overlay-color', ui.color);
		document.documentElement.style.setProperty('--style_ui_saturation', ui.saturation.toString());
	}

	return {
		metrics,
		overlay,
		game_species: runConfig,
		loading,
	};
})
