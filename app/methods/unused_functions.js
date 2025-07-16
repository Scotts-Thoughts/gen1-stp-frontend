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
},