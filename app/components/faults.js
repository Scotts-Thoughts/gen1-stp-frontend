const template = /*html*/`
<div>
    <div v-show="$parent.blackouts_resets == 'None'"      class="colored-image ds saturation" :style="'drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/timer_2.svg)"></div>
    <div v-show="$parent.blackouts_resets == 'Blackouts'" class="colored-image ds saturation" :style="'drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/timer_2.svg)"></div>
    <div v-show="$parent.blackouts_resets == 'Resets'"    class="colored-image ds saturation" :style="'drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/timer_2.svg)"></div>
    <div v-show="$parent.blackouts_resets == 'Both'"      class="colored-image ds saturation" :style="'drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/timer.svg)"></div>

    <div v-show="$parent.blackouts_resets == 'None'">
        <div class="genericLabels resetsLabel_1">faults</div>
    </div>
    <div v-show="$parent.blackouts_resets == 'Resets'">
        <div class="genericLabels resetsLabel_1">resets</div>
    </div>
    <div v-show="$parent.blackouts_resets == 'Blackouts'">
        <div class="genericLabels blackoutLabel_1">blackouts</div>
    </div>
    <div v-show="$parent.blackouts_resets == 'Both'">
        <div class="genericLabels resetsLabel">resets</div>
        <div class="genericLabels blackoutLabel">blackouts</div>
    </div>

    <div v-show="$parent.blackouts_resets == 'None'">
        <transition name="fade">
            <div class="faults_style resets_1" :style="{ 'font-size': font_size($parent.playerResetsDisplay) + 'px' }"><div id="reset_counter">{{$parent.playerResetsDisplay}}</div></div>
        </transition>
    </div>
    <div v-show="$parent.blackouts_resets == 'Resets'">
        <transition name="fade">
            <div class="faults_style resets_1" :style="{ 'font-size': font_size($parent.playerResetsDisplay) + 'px' }"><div id="reset_counter">{{$parent.playerResetsDisplay}}</div></div>
        </transition>
    </div>
    <div v-show="$parent.blackouts_resets == 'Blackouts'">
        <transition name="fade">
            <div class="faults_style blackouts_1" :style="{ 'font-size': font_size($parent.blackout_counter) + 'px' }" id="reset_counter">{{$parent.blackout_counter}}</div>
        </transition>
    </div>
    <div v-show="$parent.blackouts_resets == 'Both'">
        <transition name="fade">
            <div class="faults_style resets"><div :style="{ 'font-size': font_size($parent.playerResetsDisplay) + 'px' }" id="reset_counter">{{$parent.playerResetsDisplay}}</div></div>
        </transition>
        <transition name="fade">
            <div class="faults_style blackouts" :style="{ 'font-size': font_size($parent.blackout_counter) + 'px' }" id="reset_counter">{{$parent.blackout_counter}}</div>
        </transition>
    </div>
</div>
`

module.exports = {
    template,
    methods: {
        font_size(value) {
            var faultDisplayLength = value.toString().length;
			if (faultDisplayLength > 3) {
				return 44
			}
			if (faultDisplayLength > 2) {
				return 65
			}
			return 75; // >= 3 digits.
        }
    }
}