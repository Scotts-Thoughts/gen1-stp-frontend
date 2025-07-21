export function openFolder(folderName, game_name = "Yellow", path = "", path2) {
    const fs = require('fs');
    const fullPath = path ? `.\\${folderName}\\${game_name}\\${path}\\${path2}` : `.\\${folderName}\\${game_name}\\${path}\\${path2}`;

    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    require('child_process').exec(`start ${fullPath}`);
}