<template>
    <div>
        <img class="canvas" ref="background_texture" :src="currentBackground" 
            :style="{ 
                'filter': `blur(${background.blur}px) hue-rotate(${background.hue}deg) brightness(${background.brightness}%) contrast(${background.contrast}%) saturate(${background.saturation}%)` ,
                'transform': `scale(${background.scale}%) ${background.flip ? 'rotateY(180deg)' : ''} translate(${background.offset_x}px, ${-background.offset_y}px)`
            }"
        />
        <img class="canvas" ref="old_background_texture" style="opacity: 0" />
        <img class="canvas" style="top: -160px;" src="/images/elements/floor/pokeball.png" />
        <img v-show="meta.game == 'Yellow'" class="pokemon_art"
            :style="{
                'transform': `scale(${artwork.scale}) ${artwork.flip ? 'rotateY(180deg)' : ''} translate(${artwork.offset_x}px, ${-artwork.offset_y}px) rotate(${artwork.rotation}deg)`,
                'filter': `saturate(${artwork.saturation}%)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(${artwork.flip ? '-3px' : '3px'} 3px 3px #000)
                `
            }" 
            :src="`images/pokemon/${pokemonArt}.png`" 
        />
        <img v-if="meta.game == 'Red and Blue'" class="pokemon_art2" 
            :style="{
                'transform': `scale(${artwork.scale}) ${artwork.flip ? 'rotateY(180deg)' : ''} translate(${artwork.offset_x}px, ${-artwork.offset_y}px)`,
                'filter': `saturate(${artwork.saturation}%)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(${artwork.flip ? '-3px' : '3px'} 3px 3px #000)
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
import { useMetaStore } from "../stores/metaStore";
import { useGameSpeciesData } from "../stores/useGameSpeciesData";
import { storeToRefs } from "pinia";
const { artwork, background } = storeToRefs(useGameSpeciesData());
const meta = useMetaStore();

const background_texture = ref<HTMLImageElement | null>(null);
const old_background_texture = ref<HTMLImageElement | null>(null);

const currentBackground = computed(() => {
    return textures[background.value.texture];
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