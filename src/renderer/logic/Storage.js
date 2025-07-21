const path = require("path");
import { createWatchedObject } from "../createWatchedObject";

/**
 * @param {string} folder_path                                  path to the file
 * @param {string} file_name                             name of the file to save the data
 * @param {object?} options
 * @param {number?} options.saveTimeout                  time in milliseconds to wait before saving the file
 * @param {((data:string) => void)?} options.onSave      called after the file is saved
 */
function createStoredObject(folder_path, file_name, { saveTimeout, onSave } = {}) {
    saveTimeout = saveTimeout || 250;
    onSave = onSave || (() => {});

    var fs = require('fs');
    // const fs = require("fs");
    const path = require("path");
    
    const loadFromFile = () => {
        try {
            const data = fs.readFileSync(`${folder_path}/${file_name}`, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.warn('[StoredObject] loadFromFile:', err.message);
            return {};
        }
    };

    const saveToFile = (root) => {
        const data = JSON.stringify(root, null, 4);
        if (!fs.existsSync(folder_path)) {
            fs.mkdirSync(folder_path, { recursive: true });
        }
        fs.writeFile(`${folder_path}/${file_name}`, data, (err) => {
            if (err) console.error('[StoredObject] saveToFile:', err.message);
            else onSave(data);
        });
    };

    // after the watcher receives the first change it will wait 
    // for "saveTimeout" milliseconds before saving the file.
    // then it will reset the timer and wait for the next change.
    // this is done to avoid saving the file too often when
    // multiple changes are made in a short period of time.
    let timeoutId = null;
    const watcher = (root, props) => {
        // console.error("trigger", props)
        if (timeoutId == null) {
            timeoutId = setTimeout(() => {
                // console.error("timeout", props)
                saveToFile(root);
                timeoutId = null;
            }, saveTimeout);
        }
    };

    const obj = createWatchedObject(watcher);
    Object.assign(obj, loadFromFile());
    return obj;
}


export default createStoredObject('./storage', 'Storage.json', {
    saveTimeout: 250,
    onSave: (data) => {
        // console.log('[Storage] saved:', data);
        // do something after the file is saved
        // like creating a backup somewhere else
    }
});