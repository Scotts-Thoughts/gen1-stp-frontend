function createWatchedObject(watcher) {
    const root = {};
    const handler = {
        get(target, property, receiver) {
            const value = Reflect.get(target, property, receiver);
            if (typeof value === 'object' && value !== null) {
                return new Proxy(value, handler);
            }
            return value;
        },
        set(target, property, value, receiver) {
            const result = Reflect.set(target, property, value, receiver);
            watcher(root, {target, property, value});
            return result;
        },
        deleteProperty(target, property) {
            if (property in target) {
                delete target[property];    
                watcher(root, {target, property, value: undefined});  
            }
        },
        //* Using the deleteProperty function:
            // Storage.test = 10
            // delete Storage.test
            //
            // OR
            //
            // Storage["test"] = 20
            // delete Storage["test"]
    };
    return new Proxy(root, handler);
}

const MyStorage = require("./logic/MyStorage");
const PokeData = require("./logic/PokeData.js");
const Storage = require("./logic/Storage");

const app = Vue.createApp({
    components: {
        "frontend": require("./components/frontend.js"),
        "no_mapper": require("./components/No_mapper.js"),
        "keyhook": require("./components/keyhook.js"),
    },
    data() {
        return {
            ready: false,
            mapper: null,
            starterName: "Venomoth",
            game_name: "Yellow",
        }
    },
    mounted: async function () {
        const that = this
        this.mapper = new GameHookMapperClient()
        this.mapper.onMapperLoaded = (x) => {
            this.ready = true;
            PokeData.setGame(this.mapper.properties.meta.gameName.value);
        }
        this.mapper.onMapperUnloaded = (x) => this.ready = false
        await this.mapper.connect()
    },
}).mount('#app')