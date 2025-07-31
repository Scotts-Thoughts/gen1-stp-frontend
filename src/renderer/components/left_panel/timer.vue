<template>
    <div class="gametime">
        <!-- <div class="genericLabels timerLabel">time played at 4x game speed</div> -->
        <div class="gametimeClock">{{time}}</div>
        <div class="gametimeFrames">{{frames}}</div>
    </div>
</template>

<script lang="ts">
import PubSub from "~/logic/PubSub";
export default {
    data() {
        return {
            time: "0",
            frames: ".00",
        };
    },
    methods: {
        onTimeUpdate(value: string[]) {
            this.time = value[0];
            this.frames = value[1];
        },
    },
    created() {
        PubSub.subscribe("@timer/update", this.onTimeUpdate);
    },
    onUnmounted() {
        PubSub.unsubscribe("@timer/update", this.onTimeUpdate);
    }
}
</script>