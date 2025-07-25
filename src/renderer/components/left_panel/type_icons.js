import { defineComponent } from "vue";
import PokeData from "~/logic/PokeData";
import { useMetaStore } from "~/stores/metaStore";

const template = /*html*/`
    <div class="typeContainer">
        <div class="type">
            <img :src="'images/elements/types/' + get_type(1) + '.png'" />
            <img v-if="get_type(1) != get_type(2)" :src="'images/elements/types/' + get_type(2) + '.png'" />
        </div>
    </div>
`

export default defineComponent({
    template,
    inject: [ "game_properties" ],
    data() { return { meta: useMetaStore() }},
    methods: {
        get_type(typeNumber) {
            const data = PokeData.getSpecies(this.meta.currentSpecies);
            return data['type_' + typeNumber.toString()].toLowerCase();
        },
    }
});
