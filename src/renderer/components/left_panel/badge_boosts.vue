<template>
    <div v-if="game_properties.meta.state.value != 'No Pokemon'" class="badgesBar">          
        <img v-show="game_properties.player.badges.badge1.value === true" class="badgeBoostStyle badgeBoostAtk" :src="badgeGraphic(game_properties.player.badges.badge1)" />
        <img v-show="game_properties.player.badges.badge3.value === true" class="badgeBoostStyle badgeBoostDef" :src="badgeGraphic(game_properties.player.badges.badge3)" />                    
        <img v-show="game_properties.player.badges.badge5.value === true" class="badgeBoostStyle badgeBoostSpd" :src="badgeGraphic(game_properties.player.badges.badge5)" />                    
        <img v-show="game_properties.player.badges.badge7.value === true" class="badgeBoostStyle badgeBoostSpc" :src="badgeGraphic(game_properties.player.badges.badge7)" />      
    </div>  
</template>

<script lang="ts" setup>
import { GameHookProperty } from "../../packages/gameHookMapperClient";
import { inject } from "vue"

const game_properties = inject<Record<string, GameHookProperty>>("game_properties", {});

function badgeGraphic(x: GameHookProperty): string {
    if (x.value == true) {
        var badge = x.path.toString().substring(14);
        return `images/badges/${badge}.png`;
    }        
    return "";            
}
</script>