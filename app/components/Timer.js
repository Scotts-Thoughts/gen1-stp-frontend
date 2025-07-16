const PubSub = require("../logic/PubSub");

// How the component will render:
const template = /*html*/`
    <div class="gametime">
        <!-- <div class="genericLabels timerLabel">time played at 4x game speed</div> -->
        <div class="gametimeClock">{{time}}</div>
        <div class="gametimeFrames">{{frames}}</div>
    </div>
`

module.exports = {
    template,
    setup() {
        const time = Vue.ref("0");     // with a "ref", we can update the value of the variable and vue will automatically
        const frames = Vue.ref(".00"); // renrender the component.
        const onTimeUpdate = (value) => {
            time.value = value[0];
            frames.value = value[1];
        };
        PubSub.subscribe("time_update", onTimeUpdate);
        // Everything we return here can be accessed by other functions (and the rendering) of the component:
        return {
            time,
            frames,
            onTimeUpdate
        }
    },
    onUnmounted() {
        // Not strictly necessary for this component, but unsubscribe from the time_update event:
        PubSub.unsubscribe("time_update", this.onTimeUpdate);
    }
}
