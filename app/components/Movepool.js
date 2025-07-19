const tmhmMapping = require("../data/tmhmmapping");
const moveData = require("../data/g1MoveData");

const template = /*html*/`
    <div class="movepool-container">
        <table class="movepoolDemo" cellspacing="0" :style="mew_movepool_style">
            <tbody>
                <tr :class="\`movepool_header background-\${starting_type_fix[1]}\`" style="outline: 2px solid #000">
                    <th class="movepool_header movepool_way">Way</th>
                    <th class="movepool_header movepool_move">Move</th>
                    <th class="movepool_header movepool_type">Type</th>
                    <th class="movepool_header movepool_tableC">Pwr.</th>
                    <th class="movepool_header movepool_tableC">Acc.</th>
                    <th class="movepool_header movepool_tableC">PP</th>
                </tr>
                <tr v-for="(x, index) in getMovepool(pokemon_version_specific_data, 'gen1', dynamicReset?.species?.value).initial" :class="{ 'first-row': index === 0 }">
                    <td class="movepool_way">1</td>
                    <td class="movepool_move">{{x.Move}}</td>
                    <td :class="\`movepool_type background-\${x.Type.toLowerCase()}\`">{{x.Type}}</td>
                    <td class="movepool_tableC">{{x.Power}}</td>
                    <td class="movepool_tableC">{{x.Accuracy}}%</td>
                    <td class="movepool_tableC">{{x.PP}}</td>
                </tr>
                <tr v-for="x in getMovepool(pokemon_version_specific_data, 'gen1', dynamicReset?.species?.value).level">
                    <td class="movepool_way">{{x.Level}}</td>
                    <td class="movepool_move">{{x.Move}}</td>
                    <td :class="\`movepool_type background-\${x.Type.toLowerCase()}\`">{{x.Type}}</td>
                    <td class="movepool_tableC">{{x.Power}}</td>
                    <td class="movepool_tableC">{{x.Accuracy}}%</td>
                    <td class="movepool_tableC">{{x.PP}}</td>
                </tr>
                <tr v-for="x in getMovepool(pokemon_version_specific_data, 'gen1', dynamicReset?.species?.value).tmhm">
                    <td class="movepool_way">{{x.tmhm}}</td>
                    <td class="movepool_move">{{x.Move}}</td>
                    <td :class="\`movepool_type background-\${x.Type.toLowerCase()}\`">{{x.Type}}</td>
                    <td class="movepool_tableC">{{x.Power}}</td>
                    <td class="movepool_tableC">{{x.Accuracy}}%</td>
                    <td class="movepool_tableC">{{x.PP}}</td>
                </tr>
            </tbody>
        </table>
        <div class="colored-image ds saturation" style="--url: url(images/ui/movepool.svg); filter: drop-shadow(0px 0px 1px #000);"></div>
        <div class="movepoolLabel">Movepool</div>
    </div>
`

module.exports = {
    template,
    props: [
        "starterName",
        "pokemon_version_specific_data",
        "dynamicReset",
        "starting_type_fix",
    ],
    computed: {        
        mew_movepool_style() {
            if (this.starterName == "Mew") {
                return "font-size: 15px; line-height: 15.5px;"
            }
        },
    },
    methods: {
        dataSearch(dataObject, pointerValue) {
            if (!pointerValue) return ""
            if (!dataObject) return ""
            const key = Object.keys(dataObject).find(x => x.toLowerCase() == pointerValue.toLowerCase())
            return dataObject[key] || "ERROR"
        },
        getMovepool(gen1PkmnData, generation, species) {
            const pkmn = this.dataSearch(gen1PkmnData, species)
            if (pkmn.initial_moveset == undefined) {  }
            let obj = {
                initial: pkmn.initial_moveset?.map(x => {
                    return this.dataSearch(moveData[generation], x)
                }),
                level: pkmn.levelup_moveset?.map(x => {
                    return {
                        ...{Level: x[0]},
                        ...this.dataSearch(moveData[generation], x[1]) //searching for index 1
                    }
                }),     
                tmhm: pkmn.tm_hm_learnset?.map(x => {
                    return {
                        ...{tmhm: tmhmMapping[generation].find(y => y.Move == x)?.tmhmIndex??"ERRO"},
                        ...this.dataSearch(moveData[generation], x)
                    }
                }),     
            }
            return obj
        },
    }
}