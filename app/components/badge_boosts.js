const template = /*html*/`
    <div v-if="display_badge_boosts == true && mapper.properties.meta.state.value != 'No Pokemon'" class="badgesBar">          
        <img v-show="mapper.properties.player.badges.badge1.value === true" class="badgeBoostStyle badgeBoostAtk" :src="badgeGraphic(mapper.properties.player.badges.badge1)" />
        <img v-show="mapper.properties.player.badges.badge3.value === true" class="badgeBoostStyle badgeBoostDef" :src="badgeGraphic(mapper.properties.player.badges.badge3)" />                    
        <img v-show="mapper.properties.player.badges.badge5.value === true" class="badgeBoostStyle badgeBoostSpd" :src="badgeGraphic(mapper.properties.player.badges.badge5)" />                    
        <img v-show="mapper.properties.player.badges.badge7.value === true" class="badgeBoostStyle badgeBoostSpc" :src="badgeGraphic(mapper.properties.player.badges.badge7)" />      
    </div>  
`

module.exports = {
    template,
    props: [
        "mapper",
        "display_badge_boosts",
    ],
    methods: {
        badgeGraphic(x) {
            if (x.value == true) {
                var badge = x.path.toString().substring(14)
                return `images/badges/${badge}.png`
            }
            else if (x.value == false) {   
                return null
            }
        },
    }
}