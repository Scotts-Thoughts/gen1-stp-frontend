const application_settings = [
    // Display Settings
    [ "gamehook_disable_settings",  false, ],
    [ "gamehook_encounter_writes",  false, ],
    [ "dvSetting",                  "Max", ], //Max, Min, NPC, Max with Min Atk, or Random
    [ "trashCans",                  true,  ], //solves the trash can puzzle
    [ "options",                    true,  ], //shows the options menu when set to true
    [ "gametimeDisplay",            false, ], //shows the options menu when set to true
    [ "inventory",                  true,  ], //uses inventory when in the department store & marts
    [ "battleGraphic",              true,  ], //uses battle graphic with enemy moveset & stats
    [ "showAllTrainers",            true,  ], //when false only shows gym leaders and rivals, when true shows all enemy trainers
    [ "expBarAnimation",            true,  ],
    [ "showSpecialTrainerGraphics", true,  ], //shows drawn art for defined trainers
    [ "battlePopUps",               true,  ], //shows reflect, lightscreen, safeguard, weather, accuracy, evasion, etc
    [ "typeCalcs",                  true,  ], //calculates effective power based on the pokemon in battle
    [ "showCritMultiplierInEP",     true,  ], //shows high crit ratio moves with adjusted power if the move always scores a crit
    [ "show_wild_battles",          false, ], //shows wild battles in the battle screen
    [ "automaticallySavePBSplits",  true,  ], //saves splits if the player beats their PB (this overwrites currently saved PB splits)
    [ "autosplitter_toggle",        true,  ],
    [ "help_menus",                 "Encounters", ],

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
    [ "route1",             true,     ],
    [ "viridianForest",     true,     ],
    [ "route3",             true,     ],
    [ "mtMoon",             true,     ],
    [ "route6",             true,     ],
    [ "rockTunnel",         true,     ],
    [ "pokemonTower",       true,     ],
    [ "safariZone",         true,     ],
    [ "powerPlant",         true,     ],
    [ "mansion",            true,     ],
    [ "route21",            true,     ],
    [ "route22",            true,     ],
    [ "victoryRoad",        true,     ],
    [ "route24",            true,     ],
    [ "goal_level",         13,       ],
    [ "goal_speed",         24,       ],
    [ "rockTunnelDarkness", false,    ], //if true it will make rock tunnel bright
    [ "viridian_forest",    "Pidgey", ],

    // Timer settings
    [ "timer_startTimeOffset", "00:00:00.00", ],
    [ "timer_startTime",       0, ],
    [ "timer_pause",           true, ],
    [ "timer_formatted_time",  ["0", ".00"], ],
    [ "timer_pause_time",      0, ],
    [ "time_h",                0, ],
    [ "time_m",                0, ],
    [ "time_s",                0, ],
    [ "time_ms",               0, ],
    [ "time_split_start",      "00:00:00:00", ],
    [ "battle_start",          0, ],
    [ "timer_settings",        "Real-Time", ],

    [ "ui_type_colors",               "Current"],
    [ "ui_type_color_modifier",       "current_"],
    [ "ui_stat_arrangement",          "Hp, Atk, Def, Spe, Spc, Crit"],
    [ "ui_stat_arrangement_modifier", "hp_spd_"],
    [ "stats_display",                "Automatic"],
];