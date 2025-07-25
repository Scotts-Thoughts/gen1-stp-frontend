<template>
    <div class="movepool-container">
        <table class="movepoolDemo" cellspacing="0" :style="mew_movepool_style">
            <tbody>
                <tr :class="`movepool_header background-${starter_type_2}`" style="outline: 2px solid #000">
                    <th class="movepool_header movepool_way">Way</th>
                    <th class="movepool_header movepool_move">Move</th>
                    <th class="movepool_header movepool_type">Type</th>
                    <th class="movepool_header movepool_tableC">Pwr.</th>
                    <th class="movepool_header movepool_tableC">Acc.</th>
                    <th class="movepool_header movepool_tableC">PP</th>
                </tr>
                <tr v-for="(x, index) in moves.level" :class="{ 'first-row': index === 0 }">
                    <td class="movepool_way">{{x.Level}}</td>
                    <td class="movepool_move">{{x.move}}</td>
                    <td :class="`movepool_type background-${x.type.toLowerCase()}`">{{x.type}}</td>
                    <td class="movepool_tableC">{{x.power}}</td>
                    <td class="movepool_tableC">{{x.accuracy}}%</td>
                    <td class="movepool_tableC">{{x.pp}}</td>
                </tr>
                <tr v-for="x in moves.tmhm">
                    <td class="movepool_way">{{x.tmhm}}</td>
                    <td class="movepool_move">{{x.move}}</td>
                    <td :class="`movepool_type background-${x.type.toLowerCase()}`">{{x.type}}</td>
                    <td class="movepool_tableC">{{x.power}}</td>
                    <td class="movepool_tableC">{{x.accuracy}}%</td>
                    <td class="movepool_tableC">{{x.pp}}</td>
                </tr>
            </tbody>
        </table>
        <div class="tinted-box" style="--url: url(../images/ui/movepool.svg); --drop-shadow: 0px 0px 1px #000;"></div>
        <div class="movepoolLabel">Movepool</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PokeData from "~/logic/PokeData";
import { PokemonMovePool } from "~/logic/PokeDataTypes";
import { useMetaStore } from "~/stores/metaStore";
export default defineComponent({
    data() {
        return { meta: useMetaStore() };
    },
    computed: {        
        mew_movepool_style(): string {
            if (this.meta.starter == "Mew") {
                return "font-size: 15px; line-height: 15.5px;"
            }
            return "";
        },
        moves(): PokemonMovePool {
            const result = PokeData.getMovepool(this.meta.currentSpecies ?? this.meta.starter);
            return result;
        },
        starter_type_2(): string {
            return PokeData.getSpecies(this.meta.starter).type_2.toLowerCase();
        }
    },
});
</script>