const Storage = require("../../logic/Storage.js");
const PubSub = require("../../logic/PubSub");

const template = /*html*/`
<div>
    <div v-show="top_left_ui_selector != 'Both'" class="colored-image ds saturation" :style="'drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/timer_2.svg)"></div>
    <div v-show="top_left_ui_selector == 'Both'" class="colored-image ds saturation" :style="'drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/timer.svg)"></div>

    <div v-show="top_left_ui_selector == 'None'"      class="genericLabels resetsLabel_1">faults</div>
    <div v-show="top_left_ui_selector == 'Resets'"    class="genericLabels resetsLabel_1">resets</div>
    <div v-show="top_left_ui_selector == 'Blackouts'" class="genericLabels blackoutLabel_1">blackouts</div>
    <div v-show="top_left_ui_selector == 'Both'">
        <div class="genericLabels resetsLabel">resets</div>
        <div class="genericLabels blackoutLabel">blackouts</div>
    </div>

    <div v-show="top_left_ui_selector == 'None' || top_left_ui_selector == 'Resets'">
        <transition name="fade">
            <div class="faults_style resets_1" :style="{ 'font-size': font_size(counter_resets) + 'px' }"><div id="reset_counter">{{counter_resets}}</div></div>
        </transition>
    </div>
    <div v-show="top_left_ui_selector == 'Blackouts'">
        <transition name="fade">
            <div class="faults_style blackouts_1" :style="{ 'font-size': font_size(counter_blackouts) + 'px' }" id="reset_counter">{{counter_blackouts}}</div>
        </transition>
    </div>
    <div v-show="top_left_ui_selector == 'Both'">
        <transition name="fade">
            <div class="faults_style resets"><div :style="{ 'font-size': font_size(counter_resets) + 'px' }" id="reset_counter">{{counter_resets}}</div></div>
        </transition>
        <transition name="fade">
            <div class="faults_style blackouts" :style="{ 'font-size': font_size(counter_blackouts) + 'px' }" id="reset_counter">{{counter_blackouts}}</div>
        </transition>
    </div>
</div>
`

module.exports = {
    template,
    props: [
        "mapper",
        "flag_player_finished_the_run",
        "game_name",
        "starterName",
        "no_attempt",
    ],
    data() {
        return {
            counter_resets            : Storage.games[this.game_name]?.[this.starterName]?.data?.counter_resets             ?? 0,
            counter_blackouts         : Storage.games[this.game_name]?.[this.starterName]?.data?.counter_blackouts          ?? 0,
            flag_blackout_prerequisite: Storage.games[this.game_name]?.[this.starterName]?.data?.flag_blackout_prerequisite ?? false,
        }
    },
    computed: {
        top_left_ui_selector() {
            const allow_none = true // Toggle that allows for the UI to display no border if there are no faults
            let value = ""
            if (allow_none == true && this.counter_blackouts == 0 && this.counter_resets == 0) {
                value = "None"
            }
            else if (this.counter_blackouts == 0 && this.counter_resets > 0) {
                value = "Resets"
            }
            else if (this.counter_blackouts > 0 && this.counter_resets == 0) {
                value = "Blackouts"
            }
            else {
                value = "Both"
            }
            PubSub.publish("@ui/top_left_ui", value);
            return value
        },
    },
    methods: {
        clear_playthrough_data() {
            this.counter_resets = 0
            this.counter_blackouts = 0
            this.flag_blackout_prerequisite = false
        },
        reset_occurred() {
            this.flag_blackout_prerequisite = false;
            this.counter_resets++;
            PubSub.publish("@property/update/counter_resets", this.counter_resets);
        },
        check_blackout(newProp, oldProp) {
            if (newProp?.value == "Overworld" && oldProp?.value == "Battle" && this.flag_blackout_prerequisite == true) {
                this.flag_blackout_prerequisite = false;
                this.counter_blackouts++;
                PubSub.publish("@property/update/counter_blackouts", this.counter_blackouts);
            }
            else if (newProp.value == "Overworld") {
                this.flag_blackout_prerequisite = false;
            }
        },
        new_run_started() {
            if (this.no_attempt == true) {
                return
            }
            this.counter_resets = 0;
            this.counter_blackouts = 0;
        },
        increment_property(property) {
            this[property]++;
            PubSub.publish(`@property/update/${property}`, this[property]);
        },
        decrement_property(property) {
            if (this[property] == 0) {
                return 0
            }
            this[property]--;
            PubSub.publish(`@property/update/${property}`, this[property]);
        },
        font_size(value) {
            var faultDisplayLength = value.toString().length;
			if (faultDisplayLength > 3) {
				return 44
			}
			if (faultDisplayLength > 2) {
				return 65
			}
			return 75;
        },
    },
    created() {
        PubSub.subscribe("@run/cleared", this.clear_playthrough_data);
        PubSub.subscribe("@run/reset_occurred", this.reset_occurred);
        PubSub.subscribe("@run/check_blackout", this.check_blackout);
        PubSub.subscribe("@run/new_run_started", this.new_run_started);
        PubSub.subscribe("@property/increment", this.increment_property);
        PubSub.subscribe("@property/decrement", this.decrement_property);
    },
    watch: {
        //! These watchers are just used to emit the changes of these properties for other components to use, there will be a better way to do this.
        //! This may be important just to keep thes values backed up
        counter_resets() {
            if (this.counter_resets < 0) {
                this.counter_resets = 0;
            }
            this.blackout == false
            Storage.games[this.game_name][this.starterName].data.counter_resets = this.counter_resets
        },
        counter_blackouts() {
            if (this.counter_blackouts < 0) {
                this.counter_blackouts = 0;
            }
            Storage.games[this.game_name][this.starterName].data.counter_blackouts = this.counter_blackouts
        },
        flag_blackout_prerequisite(new_value) {
            Storage.games[this.game_name][this.starterName].data.flag_blackout_prerequisite = new_value
        }
    },
    mounted() {
        this.mapper.properties.player.team[0].hp.change((newProp, oldProp) => {
            if (newProp.value == 0 && this.mapper.properties.meta.state.value == 'Battle') {
                this.flag_blackout_prerequisite = true;
            }
        })
    },
    onUnmounted() {
        PubSub.unsubscribe("@run/cleared", this.clear_playthrough_data);
        PubSub.unsubscribe("@run/reset_occurred", this.reset_occurred);
        PubSub.unsubscribe("@run/check_blackout", this.check_blackout);
        PubSub.unsubscribe("@run/new_run_started", this.new_run_started);
    }
}