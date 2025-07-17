export function pkmn_type(typeNumber) {
    data = PokeData.getSpecies(this.starterName)
    if (this.state == `Battle`) {
        return this.mapper?.properties?.battle?.yourPokemon?.["type_" + typeNumber.toString()].value?.toLowerCase()
    }
    if (this.state == `Overworld` || this.state == `To Battle` || this.state == `From Battle`) {
        return this.mapper?.properties?.player?.team[0]?.["type_" + typeNumber.toString()]?.value?.toLowerCase()
    }
    if (this.state != `Battle`) {
        return data["type_" + typeNumber.toString()].toLowerCase()
    }
    if (this.state == "No Pokemon" || this.mapper.properties.player.team[0].species.value == null) {
        return PokeData.getSpecies(this.starterName)["type_" + typeNumber.toString()]?.toLowerCase()
    }
}