import { ref } from "vue";
import { saveOverlaySettings, useOverlaySettingsStore } from "./useOverlaySettingsStore"
import { useSpeciesMetricsStore } from "./useSpeciesMetricsStore"
import { PokemonGame } from "../logic/PokeDataTypes";
import { defineStore } from "pinia";

export const useSettingsStore = defineStore('settings', () => {
	const metrics = useSpeciesMetricsStore();
	const overlay = useOverlaySettingsStore();
	const starter = ref<string>("");
	const game = ref<PokemonGame|null>(null);

	async function setStarter(value: string) {
		starter.value = value;
		if (game.value && starter.value) {
			await metrics.initialize(game.value, starter.value);
		}
	}
	async function setGame(value: PokemonGame|null) {
		game.value = value;
		if (game.value && starter.value) {
			await metrics.initialize(game.value, starter.value);
		}
	}
	overlay.$subscribe(
		(_, state) => {
			saveOverlaySettings(state.settings);
		}, 
	);

	return {
		starter,
		game,
		metrics,
		overlay,
		setStarter,
		setGame,
	};
})