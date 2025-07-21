
<template>
	<battle_popups/>
	<type_icons/>
	<moveset />
	<stats />
	<exp_bar />
	<badge_boosts />
	<badges />
	<timer />
</template>

<script>
import { defineComponent } from "vue";
import battle_popups from "./left_panel/battle_popups.vue";
import type_icons from "./left_panel/type_icons.js";
import moveset from "./left_panel/move_set.vue";
import stats from "./left_panel/stats";
import exp_bar from "./left_panel/exp_bar";
import badge_boosts from "./left_panel/badge_boosts.vue";
import badges from "./left_panel/badges.vue";
import timer from "./left_panel/timer";

export default defineComponent({
	components: {
		battle_popups,
		type_icons,
		moveset,
		stats,
		exp_bar,
		badge_boosts,
		badges,
		timer
	}
})
</script>