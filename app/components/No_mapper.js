const template = /*html*/`
    <div>
        <div>Game:</div>
            <select v-model="$parent.game_name" class="dropdownMenu dropdown_menu_column3">
                <option>Yellow</option>
                <option v-if="$parent.release == false">Yellow Legacy</option>
                <option>Red</option>
                <option>Blue</option>
            </select><br>
            <div>Solo Pokemon:</div>
            <select v-model="$parent.starterName" class="dropdownMenu dropdown_menu_column3" style="background-color: rgb(201, 199, 100)">
                <option disabled value="">Select a species</option>
                <option v-for="key in $parent.filtered_pokemon_list" :value="key">{{key}}</option>
                <option>Pikachu</option>
            </select><br>
    </div>
`

module.exports = {
    template,
}