// Metrics save when the game-species pair is changed or when the overlay unmounts

import { defineStore } from "pinia";
import { PokemonGame } from "../logic/PokeDataTypes";
import { useSettingsStore } from "./useSettingsStore";
import { computed, reactive, toRefs, watch } from "vue";

// Path: Storage/${game}/${starter}/metrics.json
export type SpeciesMetrics = {
    timer: string,
    timer_override: string,
    attempts: number,
    finishes: number,
    resets: number,
    blackouts: number,
    splits_path: string,
};

function defaultSpeciesMetrics(): SpeciesMetrics {
	return {
		timer: "00:00:00.00",
		timer_override: "00:00:00.00",
		attempts: 0,
		finishes: 0,
		resets: 0,
		blackouts: 0,
		splits_path: "",
	};
}

export async function saveSpeciesMetrics(game: string|null, starter: string, data: SpeciesMetrics) {
	if (!game) {
		return;
	}
	const fs = require('fs');
	const path = require('path');
	const settingsDir = await window.api.settings_dir();
	const filePath = path.join(settingsDir, game, starter, "metrics.json");
	const fileDirectory = path.dirname(filePath);
	if (!fs.existsSync(fileDirectory)) {
		fs.mkdirSync(fileDirectory, { recursive: true });
	}
	const json = JSON.stringify(data, null, 4);
	fs.writeFileSync(filePath, json);
}

async function loadSpeciesMetrics(game: string, starter: string): Promise<SpeciesMetrics>  {
	const fs = require('fs');
	const path = require('path');
	const settingsDir = await window.api.settings_dir();
	const filePath =path.join(settingsDir, game, starter, "metrics.json");
	try {
		const data = fs.readFileSync(filePath, 'utf8');
		return JSON.parse(data);
	} catch {
		const data = defaultSpeciesMetrics();
		saveSpeciesMetrics(game, starter, data);
		return data;
	}
}

export enum FaultMode  {
	none = "None",
	resets = "Resets",
	blackouts = "Blackouts",
	both = "Both",
}

export const useSpeciesMetricsStore = defineStore('species_metrics', () => {
	const parent = useSettingsStore();
	const metrics = reactive(defaultSpeciesMetrics());
	const faults = computed(() => {
		return metrics.blackouts + metrics.resets;
	});
	const faultsMode = computed(() => {
		if (metrics.blackouts == 0 && metrics.resets == 0) {
			return FaultMode.none;
		}
		if (metrics.blackouts === 0 && metrics.resets > 0) {
			return FaultMode.resets;
		}
		if (metrics.blackouts > 0 &&  metrics.resets === 0) {
			return FaultMode.blackouts;
		}
		return FaultMode.both;
	});
	watch(
		metrics, 
		async (state) => {
			await saveSpeciesMetrics(parent.game, parent.starter, state)
		}, 
		{ deep: true }
	);
	async function initialize(game: PokemonGame|null, starter: string) {
		if (game && starter) {
			Object.assign(metrics, await loadSpeciesMetrics(game, starter));
		} else {
			Object.assign(metrics, defaultSpeciesMetrics());
		}
	}
	function update<K extends keyof SpeciesMetrics>(key: K, value: SpeciesMetrics[K]) {
		metrics[key] = value;
	}
	function clearCounters() {
		metrics.blackouts = 0;
		metrics.resets = 0;
	}
	
	return {
		...toRefs(metrics),
		faults,
		faultsMode,
		initialize,
		update,
		clearCounters,
	}
});

