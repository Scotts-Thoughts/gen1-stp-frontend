const application_settings = [
    // Display Settings
    [ "dvSetting",                  "Max", ], //Max, Min, NPC, Max with Min Atk, or Random
    [ "trashCans",                  true,  ], //solves the trash can puzzle
    [ "options",                    true,  ], //shows the options menu when set to true
    [ "inventory",                  true,  ], //uses inventory when in the department store & marts
    [ "showAllTrainers",            true,  ], //when false only shows gym leaders and rivals, when true shows all enemy trainers
    [ "expBarAnimation",            true,  ],
    [ "showSpecialTrainerGraphics", true,  ], //shows drawn art for defined trainers
    [ "battlePopUps",               true,  ], //shows reflect, lightscreen, safeguard, weather, accuracy, evasion, etc
    [ "show_wild_battles",          false, ], //shows wild battles in the battle screen
    [ "autosplitter_toggle",        true,  ],

    // Keyhook
    [ "lastExecuted",             0, ],
    [ "cycleIndex_rightDisplay",  0, ], //F13
    [ "cycleIndex_stats",         0, ], //F15
    [ "cycleIndex_failures",      0, ], //F17
    [ "cycleIndex_screens",       0, ], //F16
    [ "cycleValues_rightDisplay", ["movepool", "inventory", "splits", "none"], ], //F13
    [ "cycleValues_stats",        ["base", "stats", "evs", "ivs"], ], //F15
    [ "cycleValues_failures",     ["resets", "blackouts"], ], //F16
    [ "cycleValues_screens",      ["screens", "bonks"], ], //F17
    [ "key_F13",                  "movepool", ], //rightDisplay
    [ "key_F14",                  true, ], //show movepool
    [ "key_F15",                  "stats", ], //stat display type
    [ "key_F16",                  "resets", ],
    [ "key_F17",                  "screens", ],
    [ "key_F18",                  "", ],
    [ "key_F19",                  "", ],
    [ "key_F20",                  "", ],
    [ "key_F21",                  "", ],
    [ "key_F22",                  "", ],
    [ "key_F23",                  "", ],
    [ "key_F24",                  "", ],

    // Encounters
    [ "rockTunnelDarkness", false,    ], //if true it will make rock tunnel bright

    // Timer settings
    // [ "timer_startTimeOffset", "00:00:00.00", ],
    // [ "timer_startTime",       0, ],
    // [ "timer_pause",           true, ],
    // [ "timer_formatted_time",  ["0", ".00"], ],
    // [ "timer_pause_time",      0, ],
    // [ "time_h",                0, ],
    // [ "time_m",                0, ],
    // [ "time_s",                0, ],
    // [ "time_ms",               0, ],
    // [ "time_split_start",      "00:00:00:00", ],
    // [ "battle_start",          0, ],
    // [ "timer_settings",        "Real-Time", ],

    [ "disallow_right_panel_switching", true],
    [ "automatic_post_battle_splits",   true],

    [ "ui_stat_arrangement",          "Speed: top right"],
    [ "ui_stat_arrangement_modifier", "hp_spd_"],
    [ "stats_display",                "Automatic"],
    [ "test_run",                     false],
    [ "right_panel",                  "Battle Graphic"],
    [ "collect_summary_files",        true],
    [ "collect_split_data",           true],

    [ "toggle_wEarlyEncounters",                       false ],
    [ "toggle_wEarlyEncountersNoMoon",                 false ],
    [ "toggle_EVENT_ENCOUNTER_ROUTE1_TEST",            false ],
    [ "toggle_EVENT_ENCOUNTER_VIRIDIAN_FOREST_PIDGEY", false ],
    [ "toggle_EVENT_ENCOUNTER_MTMOON_SANDSHREW",       false ],
    [ "toggle_EVENT_ENCOUNTER_MTMOON_GEODUDE",         false ],
    [ "toggle_EVENT_ENCOUNTER_MTMOON_PARAS",           false ],
    [ "toggle_EVENT_ENCOUNTER_ROUTE6_CUT_USER",        false ],
    [ "toggle_EVENT_ENCOUNTER_ROUTE16_DODUO",          false ],
    [ "toggle_EVENT_ENCOUNTER_ROUTE3_SPEAROW",         false ],
];