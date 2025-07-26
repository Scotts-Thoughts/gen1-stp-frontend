export const LocalStorageProxy = new Proxy<Record<string, string>>({}, {
    set: (_, prop: string, value) => {
        if (value === undefined || value === null)
            localStorage.removeItem(prop);
        else
            localStorage.setItem(prop, JSON.stringify(value));
        return true
    },
    get: (_, prop: string) => {
        if (prop === "clear")
            return () => localStorage.clear();
        if (prop === "entries")
            return () => Object.entries(localStorage);
        if (prop === "keys")
            return () => Object.keys(localStorage);
        if (prop === "has")
            return (key) => localStorage.getItem(key) === null;
        return JSON.parse(localStorage.getItem(prop) ?? "");
    }
});
