import { SplitConfiguration } from "../split_functions";

export const yellow_splits: SplitConfiguration = {
    simple: [
        "RIVAL1_1",
        "RIVAL2_1",
        "BROCK_1",
        "MISTY_1",
        "LT.SURGE_1",
        "ERIKA_1",
        "KOGA_1",
        "SABRINA_1",
        "BLAINE_1",
        "GIOVANNI_3", // this is the Giovanni fight in the 8th gym
        "LORELEI_1",
        "BRUNO_1",
        "AGATHA_1",
        "LANCE_1",
        "ROCKET_5", // this is the rocket outside of Cerulean city, collecting this data allows for better comparisons for Pokemon that take different choices in Cerulean Nugget->Misty or Misty->Nugget
        "RIVAL3_*",
    ],
    show_panel: [
        "RIVAL1_1",
        "RIVAL2_1",
        "BROCK_1",
        "MISTY_1",
        "LT.SURGE_1",
        "ERIKA_1",
        "KOGA_1",
        "SABRINA_1",
        "BLAINE_1",
        "GIOVANNI_3", // this is the Giovanni fight in the 8th gym
        "LORELEI_1",
        "BRUNO_1",
        "AGATHA_1",
        "LANCE_1",
        "RIVAL3_*",
    ],
    deprecated: [
        //Gym Leaders
        "BROCK_1", "MISTY_1", "LT.SURGE_1", "ERIKA_1", "KOGA_1", "SABRINA_1", "BLAINE_1", "GIOVANNI_2", "GIOVANNI_3",
        //Elite Four
        "LORELEI_1", "BRUNO_1", "AGATHA_1", "LANCE_1",
        //Rivals
        "RIVAL1_*", "RIVAL2_*", "RIVAL3_*",
        //Notable NPCs
        "LASS_10",
        "ROCKET_5",
        "JR TRAINER F_5",
        "POKEMANIAC_1",
        "POKEMANIAC_2",
        "JR TRAINER F_10",
        "HIKER_10",
        "JR TRAINER F_18",
    ],
    final_splits: ["RIVAL3_*"]
}

export const red_blue_splits: SplitConfiguration = {
    simple: [
        "RIVAL1_1",
        "RIVAL2_1",
        "BROCK_1",
        "MISTY_1",
        "LT.SURGE_1",
        "ERIKA_1",
        "KOGA_1",
        "SABRINA_1",
        "BLAINE_1",
        "GIOVANNI_3",
        "LORELEI_1",
        "BRUNO_1",
        "AGATHA_1",
        "LANCE_1",
        "ROCKET_5",
        "RIVAL3_*",
    ],
    show_panel: [
        "RIVAL1_1",
        "RIVAL2_1",
        "BROCK_1",
        "MISTY_1",
        "LT.SURGE_1",
        "ERIKA_1",
        "KOGA_1",
        "SABRINA_1",
        "BLAINE_1",
        "GIOVANNI_3",
        "LORELEI_1",
        "BRUNO_1",
        "AGATHA_1",
        "LANCE_1",
        "RIVAL3_*",
    ],
    deprecated: [
        //Gym Leaders
        "BROCK_1", "MISTY_1", "LT.SURGE_1", "ERIKA_1", "KOGA_1", "SABRINA_1", "BLAINE_1", "GIOVANNI_2", "GIOVANNI_3",
        //Elite Four
        "LORELEI_1", "BRUNO_1", "AGATHA_1", "LANCE_1",
        //Rivals
        "RIVAL1_*", "RIVAL2_*", "RIVAL3_*",
        //Notable NPCs
        "LASS_10",
        "ROCKET_5",
        "JR TRAINER F_5",
        "POKEMANIAC_1",
        "POKEMANIAC_2",
        "JR TRAINER F_10",
        "HIKER_10",
        "JR TRAINER F_18",
    ],
    final_splits: ["RIVAL3_*"]
}