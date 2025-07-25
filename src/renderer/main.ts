import { createApp } from "vue/dist/vue.esm-bundler.js";
import { defineComponent } from "vue";
import PokeData from "~/logic/PokeData.js";
import { GameHookMapperClient } from "~/packages/gameHookMapperClient";
import frontend from "~/components/frontend.js";
import no_mapper from "~/components/no_mapper.js";
import keyhook from "~/components/keyhook.js";
import { PokemonGame } from "~/logic/PokeDataTypes.js";
import { createPinia } from "pinia";
import { useOverlaySettingsStore } from "~/stores/useOverlaySettingsStore.js";
import { useMetaStore } from "./stores/metaStore";

const main = defineComponent({
    components: {
        frontend,
        no_mapper,
        keyhook,
    },
    data() {
        return {
            overlaySettings: useOverlaySettingsStore(),
            ready: false as boolean,
            mapper: null as GameHookMapperClient|null,
            starterName: "Venomoth" as string,
            game_name: "Yellow" as PokemonGame,
        }
    },
    created() {
        this.mapper = new GameHookMapperClient();
        this.mapper.onMapperLoaded = async () => {
            const gameName = this.mapper!.properties.meta.gameName.value;
            PokeData.setGame(gameName);

            await this.overlaySettings.load();
            this.overlaySettings.setGame(gameName);
            this.ready = true;
        };
        this.mapper.onMapperUnloaded = () => {
            this.ready = false
        };
        this.mapper.connect();
    },
});

const pinia = createPinia();
export const app = createApp(main);
app.use(pinia);

app.config.errorHandler = ((err) => {
    console.log(err);
});

app.mount('#app');
