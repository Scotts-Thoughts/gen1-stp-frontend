const PubSub = require("../../logic/PubSub");

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
    data() {
        return {
            time: "0",
            frames: ".00",
        };
    },
    methods: {
        onTimeUpdate(value) {
            this.time = value[0];
            this.frames = value[1];
        },
    },
    created() {
        PubSub.subscribe("@timer/update", this.onTimeUpdate);
    },
    onUnmounted() {
        // Not strictly necessary for this component, but unsubscribe from the time_update event:
        PubSub.unsubscribe("@timer/update", this.onTimeUpdate);
    }
}