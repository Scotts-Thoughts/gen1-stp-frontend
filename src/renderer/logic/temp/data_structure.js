const settings_overlay = {
    // Overlay settings save on change
    game: "Crystal",
    starter: "Mewtwo",
    starter_search: "",
	keyboard_shortcuts: {},
	visualization: { 
		pop_ups: {
			bonks: {},
			repel: {},
			accuracy: {},
			evasion: {},
			field: {},
		},
		left_panel: {
			stats: {
				display: "Automatic",
			},
		},
		right_panel: {
			display: "Automatic",
			movepool: {},
			splits: {},
			trainer: {},
			wild_pokemon: {},
			inventory: {},
		}
	},
}

const settings_gamespecies = {
    // Metrics save when the gamespecies pair is changed or when the overlay unmounts
	metrics: {
		timer: "00:00:00.00",
        timer_override: "00:00:00.00",
		attempts: 0,
		finishes: 0,
		resets: 0,
		blackouts: 0,
        splits: csvFile, // used for comparison with the current run
	},
    // Config settings save on change
	config: { 
		labels: {
			split_previous: "Previous",
			split_current: "Current",
		},
		hidden_power: "Dark",
		ability: "Intimidate",
		nature: "Adamant",
		gender: "Female",
		encounters: {
			// game specific structure; booleans
		},
        advanced: {
            test_run: false,
            refilming_mode: false,
            no_attempt: false,
			shuckie_timer: true,
			shuckie_counters: true,
            editor: {
                moves: {},
                items: {},
                dvs: {},
            },
        }
	},
    // Styling settings are saved with the click of a button on the overlay
	styling: { 
		artwork: {},
		background: {},
		ui: {},
	}
}