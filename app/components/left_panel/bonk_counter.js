const Storage = require("../../logic/Storage.js");
const PubSub = require("../../logic/PubSub");

const template = /*html*/`
    <div v-if="dropdown_bonks_items == 'Bonks'">
        <transition name="fade">
            <div v-if="show_bonk_counter == true && state == 'Overworld' && top_left_ui_selector != 'Both'">
                <div class="colored-image saturation"  style="--url: url(images/ui/bonks.svg)"></div>
                <div class="bonksLabel">bonks</div>
                <div class="popUpsStyle bonksValue">{{ mapper?.properties?.patch?.steps?.bonks }}</div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="show_bonk_counter == true && state == 'Overworld' && top_left_ui_selector == 'Both'">
                <div class="colored-image saturation"  style="--url: url(images/ui/bonks_2.svg)"></div>
                <div class="bonksLabel_1">bonks</div>
                <div class="popUpsStyle bonksValue_1">{{ mapper?.properties?.patch?.steps?.bonks }}</div>
            </div>
        </transition>
    </div>
    <div v-else-if="dropdown_bonks_items == 'Item Count'">
        <transition name="fade">
            <div v-if="show_bonk_counter == true && state == 'Overworld' && top_left_ui_selector != 'Both'">
                <div class="colored-image saturation"  style="--url: url(images/ui/bonks.svg)"></div>
                <div class="bonksLabel">item count</div>
                <div class="popUpsStyle bonksValue">{{ mapper?.properties?.player.itemCount.value }}</div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="show_bonk_counter == true && state == 'Overworld' && top_left_ui_selector == 'Both'">
                <div class="colored saturation-image" style="--url: url(images/ui/bonks_2.svg)"></div>
                <div class="bonksLabel_1">item count</div>
                <div class="popUpsStyle bonksValue_1">{{ mapper?.properties?.player.itemCount.value }}</div>
            </div>
        </transition>
    </div>
`

module.exports = {
    template,
    props: [
        "mapper",
        "state",
        "show_bonk_counter",
        "dropdown_bonks_items",
        "top_left_ui_selector",
    ],
}