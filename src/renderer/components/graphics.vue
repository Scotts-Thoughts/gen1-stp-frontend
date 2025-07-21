<template>
    <div>
        <img class="canvas" ref="background_texture" :src="currentBackground" 
            :style="{ 
                'filter': `blur(${style.backgroundBlur}px) hue-rotate(${style.backgroundHue}deg) brightness(${style.backgroundBrightness}%) contrast(${style.backgroundContrast}%) saturate(${style.backgroundSaturation}%)` ,
                'transform': `scale(${style.backgroundScale}%) ${style.backgroundFlip ? 'rotateY(180deg)' : ''} translate(${style.backgroundXOffset}px, ${-style.backgroundYOffset}px)`
            }"
        />
        <img class="canvas" ref="old_background_texture" style="opacity: 0" />
        <img class="canvas" style="top: -160px;" src="/images/elements/floor/pokeball.png" />
        <img v-show="meta.game == 'Yellow'" class="pokemon_art"
            :style="{
                'transform': `scale(${style.imageScale}) ${style.imageFlip ? 'rotateY(180deg)' : ''} translate(${style.imageXOffset}px, ${-style.imageYOffset}px) rotate(${style.imageRotation}deg)`,
                'filter': `saturate(${style.imageSat}%)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(${style.imageFlip ? '-3px' : '3px'} 3px 3px #000)
                `
            }" 
            :src="`images/pokemon/${pokemonArt}.png`" 
        />
        <img v-if="meta.game == 'Red and Blue'" class="pokemon_art2" 
            :style="{
                'transform': `scale(${style.imageScale}) ${style.imageFlip ? 'rotateY(180deg)' : ''} translate(${style.imageXOffset}px, ${-style.imageYOffset}px)`,
                'filter': `saturate(${style.imageSat}%)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(${style.imageFlip ? '-3px' : '3px'} 3px 3px #000)
                `
            }" 
            :src="`images/pokemon/Red_and_Blue/${meta.currentSpecies}.png`" 
        />
        <div class="tinted-box" style="--drop-shadow: 0px 0px 1px #000000; --url: url(../images/ui/stats.svg)"></div>
        <div class="tinted-box" style="--drop-shadow: 0px 0px 1px #000000; --url: url(../images/ui/moveset.svg)"></div>
        <img class="svg" src="/images/ui/current_hp_spd_stats_backgrounds.svg"/>
        <img class="svg" style="opacity: .8; filter: drop-shadow(0px 0px 2px #000000);" src="/images/ui/gamearea.svg"/>
        <div class="genericLabels timerLabel" style="z-index: 200000; font-size: 16px;">time played at 4x game speed</div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { textures } from '../data/textures';
import { transition } from "../utils/transition";
import { useUIStylesStore } from "../stores/styleStore";
import { storeToRefs } from "pinia";
import { useMetaStore } from "../stores/metaStore";
const style = storeToRefs(useUIStylesStore()).settings;
const meta = useMetaStore();

const background_texture = ref<HTMLImageElement | null>(null);
const old_background_texture = ref<HTMLImageElement | null>(null);

const currentBackground = computed(() => {
    return textures[style.value.backgroundTexture];
});

const pokemonArt = computed(() => {
    return meta.currentSpecies === 'Backport'
        ? meta.starter
        : meta.currentSpecies || meta.starter;
});

watch(
    () => pokemonArt,
    async () => {
        //transition between background textures
        if (background_texture.value && old_background_texture.value) {
            const oldTexture = background_texture.value.src;
            old_background_texture.value.src = oldTexture;
            old_background_texture.value.style.opacity = '1';

            await transition(
                (t) => {
                    if (old_background_texture.value) {
                        old_background_texture.value.style.opacity = String(1 - t);
                    }
                },
                500
            );
            old_background_texture.value.src = '';
        }
    }
);
</script>