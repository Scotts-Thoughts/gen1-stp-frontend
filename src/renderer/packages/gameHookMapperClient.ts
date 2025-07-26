import {HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel} from "@microsoft/signalr";

export enum GamePropertyType {
	binaryCodedDecimal = "binaryCodedDecimal",
	bitArray = "bitArray",
	bool = "bool",
	int = "int",
	string = "string",
	uint = "uint",
	bit = "bit"
}

type GameHookPropertyOwnAttributes = 
    "_client"
    | "path"
    | "memoryContainer"
    | "address"
    | "length"
    | "type"
    | "size"
    | "reference"
    | "bits"
    | "description"
    | "value"
    | "bytes"
    | "isFrozen"
    | "isReadOnly"
    | "fieldsChanged"
    | "set"
    | "setBytes"
    | "freeze"
    | "change"
    | "once"
    | "toString"

type GamehookPropertyData<T = any> = {
    path: string,
    memoryContainer: string | null,
    address: number,
    length: number,
    type: GamePropertyType,
    size: number | null,
    reference: string | null,
    bits: string | null,
    description: string | null,
    value: T,
    bytes: number[],
    isFrozen: boolean,
    isReadOnly: boolean,
    fieldsChanged: string[]
};

interface IGameHookProperty<T = any> {
    _client: GameHookMapperClient;
    set(value: any, freeze?: boolean): Promise<void>;
    setBytes(bytes: number[], freeze?: boolean): Promise<void>;
    freeze(freeze?: boolean): Promise<void>;
    /**
     * Register a function that is called whenever the property received an update that changes it's `value`.
     * @param fn The callback function that will be invoked, with both the new and old property values.
     */
    change<T>(fn: (newValue: GameHookProperty, oldValue: GameHookProperty) => any): void;
    once(fn: Function): void;
    toString(): string | null;
}

export type GameHookProperty = GamehookPropertyData & IGameHookProperty & {
    // Index signature for dynamic keys
    [key: Exclude<string, GameHookPropertyOwnAttributes>]: GameHookProperty;
};

const GameHookPropertyPrototype = {
    async set(this: GameHookProperty, value: any, freeze?: boolean) {
        await this._client._editPropertyValue(this.path, value, freeze);
    },
    async setBytes(this: GameHookProperty, bytes: number[], freeze?: boolean) {
        await this._client._editPropertyBytes(this.path, bytes, freeze);
    },
    async freeze(this: GameHookProperty, freeze: boolean = true) {
        await this._client._editPropertyBytes(this.path, this.bytes, freeze);
    },
    change(this: GameHookProperty, fn: Function) {
        if (!this._client._change[this.path]) {
            this._client._change[this.path] = [];
        }
        this._client._change[this.path].push(fn);
    },
    once(this: GameHookProperty, fn: Function) {
        if (!this._client._once[this.path]) {
            this._client._once[this.path] = [];
        }
        this._client._once[this.path].push(fn);
    },
    toString(this: GameHookProperty) {
        if (this.value === undefined || this.value === null) { return null }
        return this.value.toString();
    }
};

function createGameHookProperty(
    client: GameHookMapperClient,
    obj: GamehookPropertyData
): GameHookProperty {
    const instance = Object.create(GameHookPropertyPrototype) as GameHookProperty;
    instance._client = client;
    // Assign all properties from obj
    Object.assign(instance, obj);
    return instance;
}

export class GameHookMapperClient {
    _connectionString: string;
    _signalrClient: HubConnection | null = null;
    _properties: GameHookProperty[] = [];
    _propertiesMap: Map<string, GameHookProperty> | null = null;
    _debouceTimeout = 10;
    _debouceList: string[] = [];
    _debouceMap;
    meta;
    properties: Record<string, GameHookProperty> = {};
    glossary;
    _change: Record<string, any[]> = {};
    _once: Record<string, any[]> = {};

    connected: boolean = false;
    private _options: { automaticRefreshMapperTimeMinutes: number; };

    get mapperLoaded() {
        return !this.meta ? false : true
    }

    get _signalrConnectionEstablished() {
        return this._signalrClient != null && this._signalrClient.state === HubConnectionState.Connected;
    }

    static decimalToHexdecimal(x: number, uppercase: boolean = true) {
        if (x == null) return null

        let stringValue = x.toString(16)

        // If the string is of odd length, we
        // need to introduce a leading zero.
        if (stringValue.length % 2) {
            stringValue = '0' + stringValue
        }

        if (uppercase) return stringValue.toUpperCase()
        else return stringValue
    }

    static hexdecimalToDecimal(x: string|null) {
        if (x == null) return null
        return parseInt(x, 16)
    }

    constructor(connectionString = 'http://localhost:8085') {
        this._connectionString = connectionString

        this._options = {
            automaticRefreshMapperTimeMinutes: 1
        }
    }

    _deconstructMapper() {
        this.meta = null;
        this._properties = [];
        this._propertiesMap = null;
        this._debouceMap = null;
        this.properties = {};
        this.glossary = null;
    }

    get(path) {
        return this._propertiesMap?.get(path)
    }

    deboucePath(path) {
        this._debouceList.push(path)
    }

    async loadMapper() {
        console.debug('[GameHook Client] Loading mapper.')

        function assign(target: any, path: string[], value: any) {
            let lastKeyIndex = path.length - 1

            for (var i = 0; i < lastKeyIndex; ++i) {
                let key = path[i]
                if (!(key in target)) {
                    target[key] = /^\d+$/.test(path[i + 1]) ? [] : {}
                }

                target = target[key]
            }

            target[path[lastKeyIndex]] = value
        }

        let mapper = await fetch(`${this._connectionString}/mapper`)
            .then(async (x) => {
                return { response: x, body: await x.json() }
            })
            .then(x => {
                if (x.response.status === 200) {
                    return x.body
                } else {
                    this._deconstructMapper()

                    if (x.body) {
                        throw x.body
                    } else {
                        throw new Error('Unknown error.')
                    }
                }
            })

        this.meta = mapper.meta
        this.glossary = mapper.glossary

        // Translate properties from a flat array to a nested object.
        this.properties = {};
        this._properties = mapper.properties.map((x: GamehookPropertyData) => createGameHookProperty(this, x));
        this._properties.forEach((x: { path: string; }) => assign(this.properties, x.path.split('.'), x));

        this._propertiesMap = new Map();
        this._properties.forEach(x => this._propertiesMap?.set(x.path, x));

        this._debouceMap = new Map()
        this._debouceList.forEach(x => {
            this._properties.forEach(y => {
                if (y.path.startsWith(x)) {
                    this._debouceMap.set(y.path, {
                        property: y,
                        timeoutFrames: -1,
                        newProperty: null
                    })
                }
            })
        })

        setTimeout(() => this.loadMapper(), this._options.automaticRefreshMapperTimeMinutes * 60000)

        return this
    }

    async _establishConnection() {
        try {
            if (this._signalrConnectionEstablished == false && this._signalrClient) {
                await this._signalrClient.start()
                console.debug('[GameHook Client] GameHook successfully established a SignalR connection.')
            }

            this.connected = true
            this.onConnected()
            console.debug('[GameHook Client] GameHook is now connected.')

            try {
                await this.loadMapper(); 
                this.onMapperLoaded();
            } catch {}

            return true
        } catch (err) {
            this._deconstructMapper()

            console.error(err)
            this.onMapperLoadError(err)

            setTimeout(() => this._establishConnection(), 5000)

            return false
        }
    }

    async connect() {
        var that = this

        this._signalrClient = new HubConnectionBuilder()
            .withUrl(`${this._connectionString}/updates`)
            .configureLogging(LogLevel.Warning)
            .build()

        this._signalrClient.onclose(async () => {
            console.debug('[GameHook Client] SignalR connection lost. Attempting to reconnect...')

            this._deconstructMapper()

            this.onDisconnected()
            this.connected = false

            await this._establishConnection()
        })

        function updateProperty(propertyChanged) {
            let property = that._propertiesMap?.get(propertyChanged.path);
            if (!property) {
                return;
            }

            let oldProperty = {
                path: property.path,
                memoryContainer: property.memoryContainer,
                address: property.address,
                length: property.length,
                size: property.size,
                reference: property.reference,
                bits: property.bits,
                description: property.description,
                value: property.value,
                bytes: property.bytes,
                isFrozen: property.isFrozen,
                isReadOnly: property.isReadOnly,
                type: property.type,
                fieldsChanged: property.fieldsChanged,
            }

            property.memoryContainer = propertyChanged.memoryContainer
            property.address = propertyChanged.address
            property.length = propertyChanged.length
            property.size = propertyChanged.size
            property.reference = propertyChanged.reference
            property.bits = propertyChanged.bits
            property.description = propertyChanged.description
            property.value = propertyChanged.value
            property.bytes = propertyChanged.bytes
            property.isFrozen = propertyChanged.isFrozen
            property.isReadOnly = propertyChanged.isReadOnly

            // Only trigger the property's change events when
            // the value has changed.

            // This is functionally 'weird', but users are really
            // only interested in when the value changed.

            // If they need to know about other fields changing,
            // they can register to the global GameHook event handler.

            if (propertyChanged.fieldsChanged.includes('value')) {
                // Trigger the property.change events if any.
                const changeArray = that._change[property.path]
                if (changeArray && changeArray.length > 0) {
                    changeArray.forEach(x => {
                        x(property, oldProperty)
                    }) 
                }

                // Trigger the property.once events if any.
                const onceArray = that._once[property.path]
                if (onceArray && onceArray.length > 0) {
                    onceArray.forEach(x => {
                        x(property, oldProperty)
                    })

                    that._once[property.path] = []
                }
            }

            // Trigger the global property changed event.
            if (that.onPropertyChanged) {
                that.onPropertyChanged(property, oldProperty, propertyChanged.fieldsChanged)
            }
        }

        this._signalrClient.on('PropertiesChanged', (propertiesChanged) => {
            try {       
                if (that._properties && that._properties.length > 0) {
                    for (const propertyChanged of propertiesChanged) {
                        let property = that._propertiesMap?.get(propertyChanged.path)
                        if (!property) {
                            console.warn(`[GameHook Client] Could not find a related property in PropertyUpdated event for: ${propertyChanged.path}`)
                            return
                        }
                        if (that._debouceMap.has(propertyChanged.path)) {
                            this._debouceMap.get(propertyChanged.path).timeoutFrames = this._debouceTimeout
                            this._debouceMap.get(propertyChanged.path).newProperty = propertyChanged
                        } else {
                            updateProperty(propertyChanged)
                        }
                    }
                } else {
                    console.debug('[GameHook Client] Mapper is not loaded, throwing away PropertiesChanged event.')
                }
            } catch (e) {
                console.error(e);
            }
        })

        function debouce() {
            for (const value of that._debouceMap.values()) {
                if (value.timeoutFrames > 0) {
                    value.timeoutFrames--
                } else if (value.timeoutFrames === 0) {
                    updateProperty(value.newProperty)
                    value.timeoutFrames = -1
                }
            }
            if (that.connected === true)
                requestAnimationFrame(debouce)
        }

        this._signalrClient.on('MapperLoaded', async () => { 
            try {
                await this.loadMapper(); 
                this.onMapperLoaded() 
            } catch {}
        });
        this._signalrClient.on('InstanceReset', () => { this.onMapperUnloaded() });
        this._signalrClient.on('Error', () => { });
        this._signalrClient.on('Hello', () => { });


        const result = await this._establishConnection()
        if (result === true) debouce()
        return result
    }

    async _editPropertyValue(path, value, freeze) {
        path = path.replace('.', '/')

        await fetch(`${this._connectionString}/mapper/set-property-value/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, value, freeze })
        })
            .then(async (x) => { return { response: x } })
            .then(x => {
                if (x.response.status === 200) {
                    return
                } else {
                    throw new Error('Unknown error')                    
                }
            })
    }

    async _editPropertyBytes(path, bytes, freeze) {
        path = path.replace('.', '/')

        await fetch(`${this._connectionString}/mapper/set-property-bytes/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, bytes, freeze })
        })
            .then(async (x) => { return { response: x } })
            .then(x => {
                if (x.response.status === 200) {
                    return
                } else {
                    throw new Error('Unknown error')                    
                }
            })
    }

    //For setting multiple bits within the same byte at the same time
    async setBits(propertyArray) {
        const modifiedArray = propertyArray.map(item => ({
            ...item,
            path: item.path.replace(/\./g, '/')
        }));

        await fetch(`${this._connectionString}/mapper/set-properties-by-bits/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modifiedArray)
        })
            .then(async (x) => { return { response: x } })
            .then(x => {
                if (x.response.status === 200) {
                    return
                } else {
                    console.log(x)
                    throw new Error('Unknown error')                    
                }
            })
    }

    onConnected() { /* Override this with your own function. */ }
    onDisconnected() { /* Override this with your own function. */ }

    onMapperLoaded() { /* Override this with your own function. */ }
    onMapperUnloaded() { /* Override this with your own function. */ }
    onMapperLoadError: (err: any) => void = () => { }
    onPropertyChanged: (property: GameHookProperty, oldProperty: GamehookPropertyData, fieldsChanged: string[]) => void
        = () => {};
}