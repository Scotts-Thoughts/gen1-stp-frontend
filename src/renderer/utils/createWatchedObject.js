export function createWatchedObject(watcher) {
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
