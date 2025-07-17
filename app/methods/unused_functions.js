const moveData = require("../data/g1MoveData");
const typeEffectiveness = require("../data/type-effectiveness");

//determine if the player is in a `Mart` or `Department` store.
//this is currently used to display the number of remaining vitamins that can be used on each stat
//in the future it can be used to display the player's inventory (a feature that is not yet implemented)
function g1martSelector(map) {
    if (!this.inventory) { return "Overworld"; }
    switch (map) {
        case "Viridian City - Mart":
        case "Pewter City - Mart":
        case "Cerulean City - Mart":
        case "Vermilion City - Mart":
        case "Lavender Town - Mart":
        case "Fuchsia City - Mart":
        case "Cinnabar Island - Mart":
        case "CINNABAR_MART_COPY":
        case "Saffron City - Mart":
        case "Indigo Plateau - Lobby":
        case "Celadon City - Pokecenter":
        case "Saffron City - Pokecenter":
            return "Mart"; // currently unused
        case "Celadon City - Department Store - 1F":
        case "Celadon City - Department Store - 2F":
        case "Celadon City - Department Store - 3F":
        case "Celadon City - Department Store - 4F":
        case "Celadon City - Department Store - 5F":
        case "Celadon City - Department Store - Roof":
        case "Celadon City - Department Store - Elevator":
        case "Cinnabar Mansion":
        case "Safari Zone (Center)":
        case "Safari Zone (East)":
        case "Safari Zone (North)":
        case "Safari Zone (West)":
        case "Safari Zone - Secret House":
            return "Department"; // shows vitamins
        default:
            return "Overworld"; // shows regular stat labels
    }
}
function enemy_move_power(move_name) {
    var move_power = moveData.gen1[this.move_name(move_name)].Power ?? 0
    if (move_power == 0) { return "—" }
    if (move_power == 1) { return "—" }
    if (move_power == "—") { return "—" }
    if (move_power == "-") { return "—" }
    if (move_power == "") { return "—" }
    else return move_power
}
function enemy_effective_power(move_name, enemy_mon, slot) {
    const state = this.state
    const enemy_state = this.enemyState
    const move = this.move_name(move_name)
    if (state == 'To Battle' || state == 'Battle' || state == 'From Battle') { 
        const species = enemy_mon.species.value
        const move_data = moveData.gen1[move]
        //This logs the setup of this function if the next line is going fail due to move data being undefined
        if (move_data == undefined) { 
            console.log("enemy_effective_power", state, enemy_state, move_name, species, move_data)
        }
        const move_type = move_data.Type
        const move_base_power = this.enemy_move_power(move) ?? move_data.Power
        const move_category = move_data.Category
        const user_type_1 = this.g1PokemonData[species].type1
        const user_type_2 = this.g1PokemonData[species].type2
        const target_type_1 = this.mapper.properties.battle.yourPokemon.type1.value
        const target_type_2 = this.mapper.properties.battle.yourPokemon.type2.value
        if (move_base_power == "—" || move_base_power == "-") { return "—" }
        var player_reflect = this.mapper.properties.battle.yourPokemon.effects.reflect.value == true && move_category == 'Physical' ? 0.5 : 1
        var player_light_screen = this.mapper.properties.battle.yourPokemon.effects.lightScreen.value == true && move_category == 'Special' ? 0.5 : 1 
        var move_effective_power = move_base_power
        var modifier_effectiveness_1 = typeEffectiveness.find(x => x.moveType == move_type)[target_type_1]
        var modifier_effectiveness_2 = target_type_2 && move_type && (target_type_1 != target_type_2) ? typeEffectiveness.find(x => x.moveType == move_type)[target_type_2]
            : 1
        var modifier_effectiveness_3 = 1
        var modifier_stab = move_type == user_type_1 ? 1.5 
            : move_type == user_type_2 ? 1.5 
            : move_type == "Ghost" && this.mapper.properties.patch.backport.prop_2.value == 8 && slot == this.mapper.properties.battle.enemyPokemon.partyPos.value ? 1.5
            : 1

        //Calculate effective power
        if (this.typeCalcs == true) { //Handles type effectiveness calculations in battle
            return Math.floor(move_base_power * modifier_stab * modifier_effectiveness_1 * modifier_effectiveness_2 * modifier_effectiveness_3 * player_reflect * player_light_screen)
        }
    }
}
//*text methods
//only allow letters to be typed in the name input
function isLetter(e) {
    let char = String.fromCharCode(e.keyCode); // Get the character
    if(/^[A-Za-z]+$/.test(char)) return true; // Match with regex 
    else e.preventDefault(); // If not match, don't add to input text
}
function removeSpecialChars(str) {
    // This will replace any character that is not a lowercase letter or number with an empty string
    // and convert the string to lowercase
    return str.replace(/[^a-z0-9]/gi, '').toLowerCase();
}