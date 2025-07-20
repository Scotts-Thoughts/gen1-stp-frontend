const template = /*html*/`
    <transition name="fade">
        <div v-if="battle_fade == true && mapper.properties.battle.yourPokemon.modStageAccuracy.bytes != 0x07 && mapper.properties.battle.yourPokemon.modStageAccuracy.bytes != 0x00 && mapper.properties.battle.yourPokemon.modStageAccuracy.bytes != 0xFF && (state == 'Battle' || state == 'From Battle')">
            <div class="colored-image saturation" style="--url: url(images/ui/accuracy.svg)"></div>
            <div class="accuracyLabel">accuracy</div>
            <div class="popUpsStyle accuracyMod">{{ accEva(mapper.properties.battle.yourPokemon.modStageAccuracy.value) }}</div>
        </div>
    </transition>
    <transition name="fade">
        <div v-if="battle_fade == true && mapper.properties.battle.yourPokemon.modStageEvasion.bytes != 0x07 && mapper.properties.battle.yourPokemon.modStageEvasion.bytes != 0x00 && mapper.properties.battle.yourPokemon.modStageEvasion.bytes != 0xFF && (state == 'Battle' || state == 'From Battle')">
            <div class="colored-image saturation" style="--url: url(images/ui/evasion.svg)"></div>
            <div class="evasionLabel2">evasion</div>
            <div class="popUpsStyle evasionMod">{{ accEva(mapper.properties.battle.yourPokemon.modStageEvasion.value) }}</div>
        </div>
    </transition>
    <transition name="fade">
        <div v-if="battle_fade == true && mapper.properties.battle.yourPokemon.effects.reflect.bytes != 0xFF && (mapper.properties.battle.yourPokemon.effects.reflect.value == true || mapper.properties.battle.yourPokemon.effects.lightScreen.value == true) && (state == 'Battle' || state == 'From Battle')">
            <div class="colored-image saturation"  style="--url: url(images/ui/screens.svg)"></div>
            <div class="screensLabel">{{screen[2]}}</div>
            <div class="popUpsStyle screensValue" :style="screen[1]">{{ screen[0] }}</div>
        </div>
    </transition>
`

module.exports = {
    template,
    props: [
        "mapper",
        "state",
        "battle_fade",
    ],
    methods: {
        accEva(mod) {
            if (mod > 0) {
                return "+" + mod
            }
            else return mod
        },
    },
    computed: {
        screen() {
            if (this.mapper.properties.battle.yourPokemon.effects.reflect.value == true && this.mapper.properties.battle.yourPokemon.effects.lightScreen.value == true) {
                return ["Both","font-size: 20px","screens",]
            }
            if (this.mapper.properties.battle.yourPokemon.effects.lightScreen.value == true) {
                return ["Light Screen","font-size: 16px","screen",]
            }
            if (this.mapper.properties.battle.yourPokemon.effects.reflect.value == true) {
                return ["Reflect","font-size: 20px","screen",]
            }
            else {
                return [" ","font-size: 20px","screen",]
            }
        },
    }
}