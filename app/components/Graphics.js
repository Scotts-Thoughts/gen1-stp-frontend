const PubSub = require("../logic/PubSub");
const textures = require("../data/textures");
const UIStyles = require("../logic/UIStyles")

const template = /*html*/`
    <div>
        <img class="canvas" ref="background_texture" :src="currentBackground" 
            :style="{ 
                'filter': \`blur(\${style.backgroundBlur}px) hue-rotate(\${style.backgroundHue}deg) brightness(\${style.backgroundBrightness}%) contrast(\${style.backgroundContrast}%) saturate(\${style.backgroundSaturation}%)\` ,
                'transform': \`scale(\${style.backgroundScale}%) \${style.backgroundFlip ? 'rotateY(180deg)' : ''} translate(\${style.backgroundXOffset}px, \${-style.backgroundYOffset}px)\`
            }"
        />
        <img class="canvas" ref="old_background_texture" style="opacity: 0" />
        <img class="canvas" style="top: -160px;" :src="\`images/elements/floor/pokeball.png\`" />
        <img v-show="game_name == 'Yellow'" class="pokemon_art" ref="pokemon_art"
            :style="{
                'transform': \`scale(\${style.imageScale}) \${style.imageFlip ? 'rotateY(180deg)' : ''} translate(\${style.imageXOffset}px, \${-style.imageYOffset}px) rotate(\${style.imageRotation}deg)\`,
                'filter': \`saturate(\${style.imageSat}%)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(\${style.imageFlip ? '-3px' : '3px'} 3px 3px #000)
                \`
            }" 
            :src="\`images/pokemon/\${dynamicReset.species.value == 'Backport' ? this.starterName : dynamicReset.species.value}.png\`" 
        />
        <img v-if="game_name == 'Red' || game_name == 'Blue'" class="pokemon_art2" ref="pokemon_art"
            :style="{
                'transform': \`scale(\${style.imageScale}) \${style.imageFlip ? 'rotateY(180deg)' : ''} translate(\${style.imageXOffset}px, \${-style.imageYOffset}px)\`,
                'filter': \`saturate(\${style.imageSat}%)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(\${style.imageFlip ? '-3px' : '3px'} 3px 3px #000)
                \`
            }" 
            :src="\`images/pokemon/Red_and_Blue/\${dynamicReset.species.value}.png\`" 
        />
        <div class="colored-image ds colored-box saturation" :style="'drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/stats.svg)"></div>
        <div class="colored-image ds colored-box saturation" :style="'drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/moveset.svg)"></div>
        <img class="svg" :src="'images/ui/current_' + ui_stat_arrangement_modifier + 'stats_backgrounds.svg'"/>
        <img class="svg" style="opacity: .8; filter: drop-shadow(0px 0px 2px #000000);" src="images/ui/gamearea.svg"/>
        <div class="genericLabels timerLabel" style="z-index: 200000; font-size: 16px;">time played at 4x game speed</div>
    </div>
    <div class="colored-image ds saturation" :style="\`drop-shadow(0px 0px 1px #000000)\`" style="--url: url(images/ui/stats.svg)"></div>
    <div class="colored-image ds saturation" :style="\`drop-shadow(0px 0px 1px #000000)\`" style="--url: url(images/ui/moveset.svg)"></div>
    <img class="svg" :src="\`images/ui/current_\${ui_stat_arrangement_modifier}stats_backgrounds.svg\`"/>
    <img class="svg" style="opacity: .8; filter: drop-shadow(0px 0px 2px #000000);" src="images/ui/gamearea.svg"/>
    <img class="canvas" src="images/elements/badges.png"/>
`

module.exports = {
    template,
    props: [
        "g1PokemonData",
        "ui_stat_arrangement_modifier",
        "game_name",
        "starterName",
        "dynamicReset",
        "timer_settings",
    ],
    setup(){
        const style = Vue.ref(UIStyles.settings);
        const onStyles = (newSettings) => {
            style.value = newSettings;
        };
        PubSub.subscribe("ui_styles", onStyles);
        return {
            style,
            onStyles
        };
    },
    computed: {
        currentBackground() {
            // can't directly reference the textures object in the template.
            return textures[this.style.backgroundTexture];
        }
    },
    onUnmounted() {
        // Not strictly necessary for this component, but unsubscribe from the time_update event:
        PubSub.unsubscribe("ui_styles", onStyles);
    },
    watch: {
        async starterName(newValue, oldValue) {
               //transition between background textures
            this.$refs.old_background_texture.src = `images/textures/${this.g1PokemonData[oldValue].type1}.png`
            this.$refs.old_background_texture.style.opacity = 1
            
            await transition((t) => {
                this.$refs.old_background_texture.style.opacity = 1 - t
            }, 500)
            
            this.$refs.old_background_texture.src = ""
        },
    }
}