const template = `
    <div class="typeContainer">
        <div class="type">
            <img :src="'images/elements/types/' + pkmn_type(1) + '.png'" />
            <img v-if="pkmn_type(1) != pkmn_type(2)" :src="'images/elements/types/' + pkmn_type(2) + '.png'" />
        </div>
    </div>
`

module.exports = {
    template,
    props: [
        "pkmn_type",
    ],
}
