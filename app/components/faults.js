const Storage = require("../logic/Storage.js");

const template = /*html*/`
<div>
    <div v-show="$parent.timer_ui_style != 'Both'" class="colored-image ds saturation" :style="'drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/timer_2.svg)"></div>
    <div v-show="$parent.timer_ui_style == 'Both'" class="colored-image ds saturation" :style="'drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/timer.svg)"></div>

    <div v-show="$parent.timer_ui_style == 'None'"      class="genericLabels resetsLabel_1">faults</div>
    <div v-show="$parent.timer_ui_style == 'Resets'"    class="genericLabels resetsLabel_1">resets</div>
    <div v-show="$parent.timer_ui_style == 'Blackouts'" class="genericLabels blackoutLabel_1">blackouts</div>
    <div v-show="$parent.timer_ui_style == 'Both'">
        <div class="genericLabels resetsLabel">resets</div>
        <div class="genericLabels blackoutLabel">blackouts</div>
    </div>

    <div v-show="$parent.timer_ui_style == 'None' || $parent.timer_ui_style == 'Resets'">
        <transition name="fade">
            <div class="faults_style resets_1" :style="{ 'font-size': font_size(player_resets) + 'px' }"><div id="reset_counter">{{player_resets}}</div></div>
        </transition>
    </div>
    <div v-show="$parent.timer_ui_style == 'Blackouts'">
        <transition name="fade">
            <div class="faults_style blackouts_1" :style="{ 'font-size': font_size(blackout_counter) + 'px' }" id="reset_counter">{{blackout_counter}}</div>
        </transition>
    </div>
    <div v-show="$parent.timer_ui_style == 'Both'">
        <transition name="fade">
            <div class="faults_style resets"><div :style="{ 'font-size': font_size(player_resets) + 'px' }" id="reset_counter">{{player_resets}}</div></div>
        </transition>
        <transition name="fade">
            <div class="faults_style blackouts" :style="{ 'font-size': font_size(blackout_counter) + 'px' }" id="reset_counter">{{blackout_counter}}</div>
        </transition>
    </div>
</div>
`

// EVENTS
// RESET - increment value
// BLACKOUT PREREQUISITE - set flag
// BLACKOUT - increment value, clear flag

module.exports = {
    template,
    props: [
        "mapper",
        "game_over",
        "game_name",
        "starterName",
    ],
    data() {
        return {
            //! Initialize the values from the storage object because these values need to persist through refreshes/crashes
            player_resets   : Storage.games[this.game_name][this.starterName].data.player_resets    ?? 0,
            blackout_counter: Storage.games[this.game_name][this.starterName].data.blackout_counter ?? 0,
            blackout        : Storage.games[this.game_name][this.starterName].data.blackout ?? false,
        }
    },
    watch: {
        //! These watchers are just used to emit the changes of these properties for other components to use, there will be a better way to do this.
        //! This may be important just to keep thes values backed up
        player_resets() {
            if (this.player_resets < 0) {
                this.player_resets = 0;
            }
            this.blackout == false
            Storage.games[this.game_name][this.starterName].data.player_resets = this.player_resets
        },
        blackout_counter() {
            if (this.blackout_counter < 0) {
                this.blackout_counter = 0;
            }
            Storage.games[this.game_name][this.starterName].data.blackout_counter = this.blackout_counter
        },
        blackout(new_value) {
            Storage.games[this.game_name][this.starterName].data.blackout = new_value
        }
    },
    methods: {
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
        //! EVENT_CLEAR_RUN - clears resets, blackouts, flags, sets battle summary header, resets timer, clears finished logs, clears playerId, clears current splits
        async newRun() {
            this.current_splits = []

            this.battle_summary_header = "Battle Summary"
            this.timer.setTimer(this.timer_startTimeOffset)

            this.playerResets = 0
            this.finished_logs = false
            this.blackout_counter = 0
            this.playerId = 0
        },
    },
    mounted() {
        // reset tracking
        //! EVENT_RESET - Identifies when a reset occurs => clears blackout flag, increments resets
        this.mapper.properties.player.playerId.change((newProp, oldProp) => {
            if (newProp.value == 0 && oldProp.value > 0 && this.game_over == false) {
                this.blackout = false;
                this.player_resets++;
            } 
        })
        //! EVENT_NEW_RUN - everything from EVENT_CLEAR_RUN + startTime
        this.mapper.properties.player.playerId.change((newProp) => {
            if (newProp.value > 0 && this.game_over == false) {
                if (newProp.value != this.playerId) { //! 'playerId' In frontend.js
                    if (this.no_attempt == true) {
                        return
                    }
                    this.player_resets = 0;
                    this.blackout_counter = 0;
                    this.$parent.finished_logs = false; //! 'finished_logs' In frontend.js
                    if (this.test_run == false && this.refilming_mode == false) {
                        this.attempt_number++
                    };
                    this.timer.startTime(this.timer_startTimeOffset); //! Does this work?
                    if (this.toggle_wEarlyEncounters == false && this.toggle_wEarlyEncountersNoMoon == true) { //! 'toggle_wEarlyEncounters' In frontend.js
                        this.toggle_wEarlyEncounters == true
                    }
                    this.playerId = newProp.value;
                }
            }
        })
        //! EVENT_GAME_OVER - allows reseting after the champion without resets incrementing
        this.mapper.properties.player.name.change((newProp) => {
            if (this.game_over == true && newProp.value == "NINTEN") {
                this.game_over = false;
            }
        })

        // blackout tracking
        //! EVENT_PREPARE_BLACKOUT - Identifies the prerequesite state for a blackout, sets a flag that later events can use to confirm the blackout
        this.mapper.properties.player.team[0].hp.change((newProp, oldProp) => {
            if (newProp.value == 0 && this.state == `Battle`) {
                this.blackout = true;
            }
        })
        //! EVENT_BLACKOUT - Identifies when a blackout occurs => resets blackout prerequesite flag, increment blackout counter
        this.mapper.properties.meta.state.change((newProp, oldProp) => {
            if (newProp.value == "Overworld" && oldProp.value == "Battle" && this.blackout == true) {
                this.blackout = false;
                this.blackout_counter++;
            }
            else if (newProp.value == "Overworld") {
                this.blackout = false;
            }
            if (newProp.value == "To Battle" && this.automatic_splits == true && this.mapper.properties.battle.type.value == "Trainer") { //! WHAT IS THIS? I DON'T REMEMBER WHAT IT DOES...
                this.automatic_splits = false
                this.right_panel = 'Automatic'
            }
        });
        //! How much logic from the frontend.js needs to be in this component? 
        //!     UI for metrics? 
        //!     newRun function? 
        //!     I think it needs to be everything under the 'Set ROM Starter' button.
    }
}