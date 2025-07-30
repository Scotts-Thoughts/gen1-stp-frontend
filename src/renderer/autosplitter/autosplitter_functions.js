const path = require("path");
const fs = require("fs");

export function logCopy(gameName, gameName_Path, file_name, starterName, finished_run_count, refilming_mode, refilmed_attempt) {
    var dirPathAttempts = refilming_mode ? `./splits/${gameName_Path}/${starterName}/refilmed/attempts/` : `./splits/${gameName_Path}/${starterName}/attempts/`
    var dirPathFinishes = refilming_mode ? `./splits/${gameName_Path}/${starterName}/refilmed/finishes/` : `./splits/${gameName_Path}/${starterName}/finishes/`
    let attempt_number = refilming_mode ? refilmed_attempt : file_name;
    let finish_number = refilming_mode ? refilmed_attempt : finished_run_count;
    console.log("LogCopy Variables", gameName, gameName_Path, file_name, starterName, finished_run_count, dirPathAttempts, dirPathFinishes, attempt_number, finish_number)
    fs.mkdir(dirPathFinishes, { recursive: true }, (err) => {
        fs.copyFile(
            path.join(dirPathAttempts, `${gameName}-${starterName}-${attempt_number}-simple.csv`), 
            path.join(dirPathFinishes, `${gameName}-${starterName}-${finish_number}-simple.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.copyFile(
            path.join(dirPathAttempts, `${gameName}-${starterName}-${attempt_number}-full.csv`), 
            path.join(dirPathFinishes, `${gameName}-${starterName}-${finish_number}-full.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
        fs.copyFile(
            path.join(dirPathAttempts, `${gameName}-${starterName}-${attempt_number}.csv`), 
            path.join(dirPathFinishes, `${gameName}-${starterName}-${finish_number}.csv`), (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
}