import { createApp, defineComponent } from "vue/dist/vue.esm-bundler.js";
import PokeData from "./logic/PokeData.js";
import { GameHookMapperClient } from "./packages/gameHookMapperClient";
import frontend from "./components/frontend.js";
import no_mapper from "./components/no_mapper.js";
import keyhook from "./components/keyhook.js";
import { PokemonGame } from "./logic/PokeDataTypes.js";
import { createPinia } from "pinia";
import { useSettingsStore } from "./stores/useSettingsStore.js";
import { useMetaStore } from "./stores/metaStore.js";

const main = defineComponent({
    components: {
        frontend,
        no_mapper,
        keyhook,
    },
    data() {
        return {
            metaStore: useMetaStore(),
            settings: useSettingsStore(),
            ready: false as boolean,
            mapper: null as GameHookMapperClient|null,
            starterName: "Venomoth" as string,
            game_name: "Yellow" as PokemonGame,
        }
    },
    created: function () {
        this.mapper = new GameHookMapperClient();
        this.mapper.onMapperLoaded = () => {
            this.ready = true;
            this.metaStore.setGame(this.mapper.properties.meta.gameName.value);
            this.metaStore.setStarter(this.starterName);
            this.metaStore.setCurrentSpecies(this.starterName);

            this.settings.setStarter(this.starterName);
            this.settings.setGame(this.mapper.properties.meta.gameName.value);
            PokeData.setGame(this.mapper.properties.meta.gameName.value);
            this.mapper.properties.player.team[0].species.change(e => {
                console.log("this.mapper.properties.player.team[0].species: " + e.value);
            });
        }
        this.mapper.onMapperUnloaded = () => {
            this.ready = false
        }
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
