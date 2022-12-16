export const camelCase2: function (str) {
    if (!str || !str.toString()) { return '' }
    return str.toString().replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toUpperCase() : word.toLowerCase();
    })
}