const template = /*html*/`
    <div>
        <img class="canvas" ref="background_texture" :src="textures[backgroundTexture]" 
        :style=" 
            'filter': 'blur(' + backgroundBlur + 'px) hue-rotate(' + backgroundHue + 'deg) brightness(' + backgroundBrightness + '%) contrast(' + backgroundContrast + '%) saturate(' + backgroundSaturation + '%)' ,
            'transform': 'scale(' + backgroundScale + '%) ' + (backgroundFlip ? 'rotateY(180deg)' : '') + ' translate(' + backgroundXOffset + 'px, ' + -backgroundYOffset + 'px)'
        "/>
        <img class="canvas" ref="old_background_texture" style="opacity: 0" />
        <img class="canvas" style="top: -160px;" :src="images/elements/floor/pokeball.png" />
        <img v-show="game_name == 'Yellow'" class="pokemon_art" ref="pokemon_art"
            :style="{
                'transform': 'scale(' + imageScale + ') ' + (imageFlip ? 'rotateY(180deg)' : '') + ' translate(' + imageXOffset + 'px, ' + -imageYOffset + 'px) rotate(' + imageRotation + 'deg)',
                'filter': 'saturate(' + imageSat + '%)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(' + (imageFlip ? '-3px' : '3px') + ' 3px 3px #000)
                '
            }" 
            :src="'images/pokemon/' + dynamicReset.species.value == 'Backport' ? this.starterName : dynamicReset.species.value + '.png'" />
        <img v-if="game_name == 'Red' || game_name == 'Blue'" class="pokemon_art2" ref="pokemon_art"
            :style="{
                'transform': 'scale(' + imageScale + ') ' + (imageFlip ? 'rotateY(180deg)' : '') + ' translate(' + imageXOffset + 'px, ' + -imageYOffset + 'px)',
                'filter': 'saturate(' + imageSat + '%)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(0 0 0.4px #000)
                drop-shadow(' + (imageFlip ? '-3px' : '3px') + '3px 3px #000)
                '
            }" 
            :src="'images/pokemon/Red_and_Blue/' + dynamicReset.species.value + '.png'" />

        <div class="colored-image ds" :style="'filter: saturate(' + ui_saturation + ') drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/stats.svg)"></div>
        <div class="colored-image ds" :style="'filter: saturate(' + ui_saturation + ') drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/moveset.svg)"></div>
        <div class="expBar"><div class="expMeterStyle expMeterOuter"><div class="expMeterStyle expMeterInner" ref="expBar"></div></div></div>
        <img class="svg" :src="'images/ui/' + ui_type_color_modifier + ui_stat_arrangement_modifier + 'stats_backgrounds.svg'"/>
        <img class="svg" style="opacity: .8; filter: drop-shadow(0px 0px 2px #000000);" src="images/ui/gamearea.svg"/>

        <div class="genericLabels timerLabel" style="z-index: 200000">time played at 4x game speed</div>
    </div>
`

module.exports = {
    template,
    props: [
        "backgroundTexture",
        "backgroundBlur",
        "backgroundHue",
        "backgroundBrightness",
        "backgroundContrast",
        "backgroundSaturation",
        "backgroundScale",
        "backgroundFlip",
        "backgroundXOffset",
        "backgroundYOffset",
        "imageScale",
        "imageFlip",
        "imageXOffset",
        "imageYOffset",
        "imageRotation",
        "imageSat",
        "ui_saturation",
        "ui_type_color_modifier",
        "ui_stat_arrangement_modifier",
        "game_name",
        "starterName",
        "dynamicReset",
    ]
}