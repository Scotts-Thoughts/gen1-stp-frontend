
<template>
    <div v-if="battle_fade == true && (meta.gameState == 'Battle' || meta.gameState == 'From Battle')">
        <transition name="fade">
            <div v-if="game_properties.battle.yourPokemon.modStageAccuracy.bytes[0] != 0x07 && game_properties.battle.yourPokemon.modStageAccuracy.bytes[0] != 0x00 && game_properties.battle.yourPokemon.modStageAccuracy.bytes[0] != 0xFF">
                <div class="tinted-box" style="--url: url(../images/ui/accuracy.svg)"></div>
                <div class="accuracyLabel">accuracy</div>
                <div class="popUpsStyle accuracyMod">{{ sign(game_properties.battle.yourPokemon.modStageAccuracy.value) }}</div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="game_properties.battle.yourPokemon.modStageEvasion.bytes[0] != 0x07 && game_properties.battle.yourPokemon.modStageEvasion.bytes[0] != 0x00 && game_properties.battle.yourPokemon.modStageEvasion.bytes[0] != 0xFF">
                <div class="tinted-box" style="--url: url(../images/ui/evasion.svg)"></div>
                <div class="evasionLabel2">evasion</div>
                <div class="popUpsStyle evasionMod">{{ sign(game_properties.battle.yourPokemon.modStageEvasion.value) }}</div>
            </div>
        </transition>
        <transition name="fade">
            <div v-if="game_properties.battle.yourPokemon.effects.reflect.bytes[0] != 0xFF && (game_properties.battle.yourPokemon.effects.reflect.value == true || game_properties.battle.yourPokemon.effects.lightScreen.value == true)">
                <div class="tinted-box"  style="--url: url(../images/ui/screens.svg)"></div>
                <div class="screensLabel">{{screen[2]}}</div>
                <div class="popUpsStyle screensValue" :style="screen[1]">{{ screen[0] }}</div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { GameHookProperty } from "~/packages/gameHookMapperClient";
import { useMetaStore } from "~/stores/metaStore";

export default defineComponent({
    data() {
        return { 
            game_properties: inject<Record<string, GameHookProperty>>("game_properties", {}),
            meta: useMetaStore(),
        }
    },
    methods: {
        sign(value) {
            if (value > 0) {
                return "+" + value
            }
            return value
        },
    },
    computed: {
        battle_fade() {
            const trainerClasses = ["LORELEI", "BRUNO", "AGATHA", "LANCE", "RIVAL3"];
            const validStates = ["To Battle", "From Battle"];
            if (this.meta.gameState == "Battle") {
                return true;
            }
            return validStates.includes(this.meta.gameState) 
                && (trainerClasses.includes(this.game_properties.battle.trainer.class.value) || this.meta.gameState != "From Battle")
        },
        screen() {
            if (this.game_properties.battle.yourPokemon.effects.reflect.value == true && this.game_properties.battle.yourPokemon.effects.lightScreen.value == true) {
                return ["Both","font-size: 20px","screens",]
            }
            if (this.game_properties.battle.yourPokemon.effects.lightScreen.value == true) {
                return ["Light Screen","font-size: 16px","screen",]
            }
            if (this.game_properties.battle.yourPokemon.effects.reflect.value == true) {
                return ["Reflect","font-size: 20px","screen",]
            }
            else {
                return [" ","font-size: 20px","screen",]
            }
        },
    }
});
</script>