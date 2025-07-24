<template>
    <img class="canvas" src="/images/elements/badges.png"/>
    <div v-show="game_properties.meta.state.value != 'No Pokemon'">
        <div v-for="x in [1, 2, 3, 4, 5, 6, 7, 8]">
            <transition name="fade">
                <img 
                    v-show="game_properties.player.badges['badge'+x].value == true" 
                    :src="`images/badges/progress bar/badge${x}.png`" 
                    class="canvas" />
            </transition>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { GameHookProperty } from "../../packages/gameHookMapperClient";
import { inject } from "vue";

const game_properties = inject<Record<string, GameHookProperty>>("game_properties", {});
</script>