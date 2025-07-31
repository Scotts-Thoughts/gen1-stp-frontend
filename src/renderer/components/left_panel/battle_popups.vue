<template>
	<pop_ups />        
	<bonk_counter />  
	<repel_counter />
</template>

<script>
/* TODO: Previously there was "battlePopUps" setting with this description:
// shows reflect, lightscreen, safeguard, weather, accuracy, evasion, etc.
I think that is entirely obsolete with the new overlay_settings structure?
But that also has not yet been hooked up to pop_ups. Only the bonk_counter and repel_counter.
- Ion.
*/
import pop_ups from "./pop_ups.vue";
import bonk_counter from "./bonk_counter.vue";
import repel_counter from "./repel_counter.vue";
export default {
	components: {
		pop_ups,
		bonk_counter,
		repel_counter,
	}
};
</script>