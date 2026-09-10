<template>
    <div class="typeContainer">
        <div class="type">
            <img :src="'images/elements/types/' + get_type(1) + '.png'" />
            <img v-if="get_type(1) != get_type(2)" :src="'images/elements/types/' + get_type(2) + '.png'" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PokeData from "~/logic/PokeData";
import { useMetaStore } from "~/stores/metaStore";

export default defineComponent({
    data() {
        return { meta: useMetaStore() }
    },
    methods: {
        /** Get the nth type of the current pokemon, as a lower case string. Falls back to the starter, then "normal". */
        get_type(typeNumber: 1 | 2): string {
            const data = PokeData.findSpecies(this.meta.currentSpecies) ?? PokeData.findSpecies(this.meta.starter);
            const type = typeNumber === 1 ? data?.type_1 : data?.type_2;
            return (type ?? "Normal").toLowerCase();
        },
    }
});
</script>
