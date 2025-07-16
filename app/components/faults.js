const template = /*html*/`
<div>
    <div v-show="mode == 'None'"      class="colored-image ds" :style="'filter: saturate('+saturation+') drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/timer_2.svg)"></div>
    <div v-show="mode == 'Blackouts'" class="colored-image ds" :style="'filter: saturate('+saturation+') drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/timer_2.svg)"></div>
    <div v-show="mode == 'Resets'"    class="colored-image ds" :style="'filter: saturate('+saturation+') drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/timer_2.svg)"></div>
    <div v-show="mode == 'Both'"      class="colored-image ds" :style="'filter: saturate('+saturation+') drop-shadow(0px 0px 1px #000000)'" style="--url: url(images/ui/timer.svg)"></div>

    <div v-show="mode == 'None'">
        <div class="genericLabels resetsLabel_1">faults</div>
    </div>
    <div v-show="mode == 'Resets'">
        <div class="genericLabels resetsLabel_1">resets</div>
    </div>
    <div v-show="mode == 'Blackouts'">
        <div class="genericLabels blackoutLabel_1">blackouts</div>
    </div>
    <div v-show="mode == 'Both'">
        <div class="genericLabels resetsLabel">resets</div>
        <div class="genericLabels blackoutLabel">blackouts</div>
    </div>

    <div v-show="mode == 'None'">
        <transition name="fade">
            <div class="faults_style resets_1"><div id="reset_counter">{{resets}}</div></div>
        </transition>
    </div>
    <div v-show="mode == 'Resets'">
        <transition name="fade">
            <div class="faults_style resets_1"><div id="reset_counter">{{resets}}</div></div>
        </transition>
    </div>
    <div v-show="mode == 'Blackouts'">
        <transition name="fade">
            <div class="faults_style blackouts_1" id="reset_counter">{{blackouts}}</div>
        </transition>
    </div>
    <div v-show="mode == 'Both'">
        <transition name="fade">
            <div class="faults_style resets"><div id="reset_counter">{{resets}}</div></div>
        </transition>
        <transition name="fade">
            <div class="faults_style blackouts" id="reset_counter">{{blackouts}}</div>
        </transition>
    </div>
</div>
`

module.exports = {
    template,
    props: [
        "mode",
        "resets",
        "blackouts",
        "saturation"
    ],
}