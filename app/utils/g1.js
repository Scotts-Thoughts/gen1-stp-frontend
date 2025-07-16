import pokemonData from "../data/pokemonData"

export function pkmn_type(typeNumber) {
    data = pokemonData.gen1[this.starterName]
    if (this.state == `Battle`) {
        return this.mapper?.properties?.battle?.yourPokemon?.["type" + typeNumber.toString()].value?.toLowerCase()
    }
    if (this.state == `Overworld` || this.state == `To Battle` || this.state == `From Battle`) {
        return this.mapper?.properties?.player?.team[0]?.["type" + typeNumber.toString()]?.value?.toLowerCase()
    }
    if (this.state != `Battle`) {
        return data["type" + typeNumber.toString()].toLowerCase()
    }
    if (this.state == "Base Stats" || this.mapper.properties.player.team[0].species.value == null) {
        return pokemonData.gen1[this.starterName]["type" + typeNumber.toString()]?.toLowerCase()
    }
}