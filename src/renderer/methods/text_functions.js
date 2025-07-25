import { backport_data } from "~/data/backports";

export function move_name(move_string) {
    if (!move_string) { 
        return "" 
    }
    if (move_string.includes("BACKPORT")) { 
        return backport_data[this.meta.starter].moves[move_string] 
    }
    move_string = move_string.toLowerCase()
    const moveMappings = {
        "vicegrip":     "ViceGrip",
        "doubleslap":   "DoubleSlap",
        "double-edge":  "Double-Edge",
        "solarbeam":    "SolarBeam",
        "extremespeed": "ExtremeSpeed",
        "dynamicpunch": "DynamicPunch",
        "thunderpunch": "ThunderPunch",
        "bubblebeam":   "BubbleBeam",
        "grasswhistle": "GrassWhistle",
        "softboiled":   "Softboiled",
        "sand-attack":  "Sand-Attack",
        "mud-slap":     "Mud-Slap",
        "featherdance": "FeatherDance",
        "poisonpowder": "PoisonPowder",
        "dragonbreath": "DragonBreath",
        "ancientpower": "AncientPower",
        "smellingsalt": "SmellingSalt",
        "selfdestruct": "Selfdestruct",
        "smokescreen":  "SmokeScreen",
        "sonicboom":    "SonicBoom",
        "trickortreat": "TrickOrTreat"
    };
    const formattedMove = moveMappings[move_string];
    return formattedMove || capitalize_words(move_string);
}

export function capitalize_words(str) {
    if (str == null) { return "" }
    return str.toLowerCase().replace(/(^|\s|\-|\.)(\w)/g, function(match, p1, p2) {
        return p1 + p2.toUpperCase();
    });
}