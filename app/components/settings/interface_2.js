const PubSub = require("../../logic/PubSub");

const template = /*html*/`
<div>
    <div>Solo Pokemon:</div>
    <select v-model="$parent.starterName" class="dropdownMenu dropdown_menu_column3" style="background-color: rgb(201, 199, 100)">
        <option disabled value="">Select a species</option>
        <option v-for="key in $parent.filtered_pokemon_list" :value="key">{{key}}</option>
    </select><br>
    <div>Search Pokemon:</div>
    <input type="text" v-model="$parent.search_term" placeholder="Search for a species">
    <button class="buttonStyle set_starter_button" @click="$parent.set_rom_starter">Set ROM Starter</button>
</div>
`

module.exports = {
    template,
}