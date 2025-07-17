const PokeData = require("../logic/PokeData");

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
                <tr v-for="(x, index) in moves.initial" :class="{ 'first-row': index === 0 }">
                    <td class="movepool_way">1</td>
                    <td class="movepool_move">{{x.move}}</td>
                    <td :class="\`movepool_type background-\${x.type.toLowerCase()}\`">{{x.type}}</td>
                    <td class="movepool_tableC">{{x.power}}</td>
                    <td class="movepool_tableC">{{x.accuracy}}%</td>
                    <td class="movepool_tableC">{{x.pp}}</td>
                </tr>
                <tr v-for="x in moves.level">
                    <td class="movepool_way">{{x.Level}}</td>
                    <td class="movepool_move">{{x.move}}</td>
                    <td :class="\`movepool_type background-\${x.type.toLowerCase()}\`">{{x.type}}</td>
                    <td class="movepool_tableC">{{x.power}}</td>
                    <td class="movepool_tableC">{{x.accuracy}}%</td>
                    <td class="movepool_tableC">{{x.pp}}</td>
                </tr>
                <tr v-for="x in moves.tmhm">
                    <td class="movepool_way">{{x.tmhm}}</td>
                    <td class="movepool_move">{{x.move}}</td>
                    <td :class="\`movepool_type background-\${x.type.toLowerCase()}\`">{{x.type}}</td>
                    <td class="movepool_tableC">{{x.power}}</td>
                    <td class="movepool_tableC">{{x.accuracy}}%</td>
                    <td class="movepool_tableC">{{x.pp}}</td>
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
        "dynamicReset",
        "starting_type_fix",
    ],
    computed: {        
        mew_movepool_style() {
            if (this.starterName == "Mew") {
                return "font-size: 15px; line-height: 15.5px;"
            }
        },
        moves() {
            // really PokeDex should be a single-instance thing that gets the generation set once the mapper is detected
            // but this is just a proof of concept:
            const result = PokeData.getMovepool(this.dynamicReset?.species?.value);
            return result;
        },
    },
}