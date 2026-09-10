import { backport_data } from "~/data/backports";

/**
 * Turn a move name as reported by the mapper (e.g. "THUNDERBOLT") into its display name (e.g. "Thunderbolt").
 * Moves of backported species are reported as "BACKPORT..." and are resolved through `data/backports.js`.
 * @param {string | null | undefined} move_string The move name from the mapper.
 * @param {string} [starter] The starter species, used to resolve backport moves. Falls back to `this.meta.starter`
 * when called as a component method.
 * @returns {string}
 */
export function move_name(move_string, starter = undefined) {
    if (!move_string) {
        return ""
    }
    if (move_string.includes("BACKPORT")) {
        const species = starter ?? this?.meta?.starter;
        return backport_data[species]?.moves?.[move_string] ?? capitalize_words(move_string);
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
