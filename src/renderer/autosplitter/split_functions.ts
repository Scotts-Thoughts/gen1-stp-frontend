import { useMetaStore } from "~/stores/metaStore";
import { useBattleStore } from "~/stores/useBattleStore";
import { useSpeciesMetricsStore } from "~/stores/useSpeciesMetricsStore";
import { FullSplit, SplitHeading } from "./types";
import { deprecated_split_columns } from "./definitions/deprecated_split_columns";
import { simple_split_columns } from "./definitions/simple_split_columns";
import { GameHookProperty, GamePropertyMap } from "~/packages/gameHookMapperClient";
const path = require("path");
const fs = require("fs");

export type FullSplitFunction = (
	properties: GamePropertyMap, 
	meta: ReturnType<typeof useMetaStore>,
	metrics: ReturnType<typeof useSpeciesMetricsStore>,
	battle: ReturnType<typeof useBattleStore>
) => FullSplit;

export type UniqueTrainerIdFunction = (properties: GamePropertyMap) => string;

export function isTargetSplit(trainerId: string, targetSplits: string[]) {
	for(var split of targetSplits) {
		if (split.endsWith("*")) {
			if (trainerId.startsWith(split.substring(0, split.length-1))) {
				return true;
			}
		} else {
			if (split === trainerId) {
				return true;
			}
		}
	}
	return false;
}

export type SplitConfiguration = {
	/** On which trainers to do a simple split. */
	simple: string[],
	/** On which trainers to automatically show the splits panel. */
	show_panel: string[],
	/** On which trainers to do a "deprecated" split. */
	deprecated: string[],
	/** Which trainers are the final battle split. */
	final_splits: string[],
}

export function createFullSplitHeader(fullSplit: FullSplit) {
	return Object.entries(fullSplit).map(([value, _]) => value).join(",") + "\n";
}

export function createFullSplitRow(fullSplit: FullSplit) {
	return Object.entries(fullSplit).map(([_, heading]) => heading).join(",") + "\n";
}

export function createSplitRow(fullSplit: FullSplit, headings: Readonly<SplitHeading[]>) {
	return headings.map(heading => fullSplit[heading]).join(",") + "\n";
}

export function getSplitArray(fullSplit: FullSplit, headings: Readonly<SplitHeading[]>) {
	return headings.map(heading => fullSplit[heading]);
}

export function createSplitHeader(headings: Readonly<SplitHeading[]>) {
	return headings.join(",") + "\n";
}

export function write_split_csv(
	gameName: string, 
	gameName_Path: string, 
	data: FullSplit,
	log_type: "Simple" | "Full" | "Deprecated", 
	testStatus: any, 
	refilming_mode: any, 
	refilmed_attempt: any
) {
	const dirPath = refilming_mode ? `./splits_new/${gameName_Path}/${data.Species}/refilmed/attempts/` : `./splits/${gameName_Path}/${data.Species}/attempts/`;
	const testStatusText = testStatus ? "test_run_" : "";
	
	let attempt_number = refilming_mode ? refilmed_attempt : data["Attempt Number"];
	let filePath = path.join(dirPath, `${gameName}-${testStatusText}${data.Species}-${attempt_number}-simple.csv`);
	let header: string;
	let row: string;
	if (log_type == "Simple") {
		header = createSplitHeader(simple_split_columns);
		row = createSplitRow(data, simple_split_columns);
	} else if (log_type == "Full") {
		filePath = path.join(dirPath, `${gameName}-${testStatusText}${data.Species}-${attempt_number}-full.csv`);
		header = createFullSplitHeader(data);
		row = createFullSplitRow(data);
	} else if (log_type == "Deprecated") {
		filePath = path.join(dirPath, `${gameName}-${testStatusText}${data.Species}-${attempt_number}.csv`);
		header = createSplitHeader(deprecated_split_columns);
		row = createSplitRow(data, deprecated_split_columns);
	}
	fs.mkdir(dirPath, { recursive: true }, () => {
		if (!fs.existsSync(filePath)) {
			fs.writeFileSync(filePath, header);
			fs.appendFileSync(filePath, row);
		} else {
			fs.appendFileSync(filePath, row);
		}
	});
}

export function log_split(split: FullSplit, properties: Record<string, GameHookProperty>) {
	const opponent = properties.battle.trainer.class.value;
	console.log(`Autosplitter - Battle Ended: Split: ${opponent} at ${split.real_time_total} (Gametime: ${split["Game Time"]})`)
}

export function padTime(time: string|number) {
	return !time 
		? "00" 
		: time.toString().padStart(2, "0");
}