import "../imperium-data-local.js";
//
import path from "node:path";
import { DATA_PATH } from "../config.js";
import { ImperiumData } from "../imperium-data.js";
import { outText } from "../out.js";
import { sortKeyByTable } from "../out-sort-key.js";
import { flipMatrix } from "../utils.js";

function typeName(type: string): string {
	if (type.startsWith("enum:")) {
		return type.substring("enum:".length);
	}
	const maps: Record<string, string> = {
		String: "string",
		Integer: "int",
		Boolean: "bool",
		Float: "float",
	};
	if (type in maps) {
		return maps[type];
	}
	return type;
}

function quickInlineRef(columnName: string) {
	if (columnName === "chapterId") return ` [ref: > Chapters.id]`;
	if (columnName === "diligentId") return ` [ref: > Diligents.id]`;
	if (columnName === "questId") return ` [ref: > Quests.id]`;
	if (columnName === "heroId") return ` [ref: > Heroes.id]`;
	if (columnName === "extraSettingId") return ` [ref: > QuestExtraSettings.id]`;
	if (columnName === "battlefieldId") return ` [ref: > Battlefields.id]`;
	if (columnName === "questModeId") return ` [ref: > QuestMode.id]`;
	return "";
}

const out: string[] = [];
const gamedata = ImperiumData.fromGamedata();
const raw = gamedata.getRawData();
for (const tableName of Object.keys(raw.C)) {
	const table = raw.C[tableName];
	const [types, keys] = flipMatrix(
		flipMatrix([table.T, table.K]).sort(sortKeyByTable(tableName)),
	);
	const columns: string[] = [];
	for (let i = 0; i < keys.length; i++) {
		const columnName = keys[i];
		if (/^\w+$/.test(columnName)) {
			columns.push(
				`  ${columnName} ${typeName(types[i] ?? "")}${quickInlineRef(columnName)}`,
			);
		}
	}
	out.push(`Table ${tableName} {
${columns.join("\n")}
}`);
}
for (const enumName of Object.keys(raw.E)) {
	const values = raw.E[enumName];
	out.push(`Enum ${enumName.substring("enum:".length)} {
${values.map((v) => `  ${v}`).join("\n")}
}`);
}
out.push(`
Ref: ExploreComposite.requireBuildingId > ExploreBuilding.id
Ref: Chapters.dropGroupID > DropItems.groupId
Ref: Quests.dropGroupId > DropItems.groupId
Ref: AchievementConditions.conditionGroupId > EvaluateAchievements.conditionGroupId
Ref: EvaluateAchievements.groupId > LoreChapterSettings.evaluateAchievementGroupId
Ref: Evaluates.groupId > LoreChapterSettings.evaluateGroupId
Ref: AdventureWeekPoint.groupId > LoreChapterSettings.pointGroupId
Ref: BattlefieldRanks.groupId > LoreChapterSettings.rankGroupId
Ref: BattlefieldRanks.groupId > Battlefields.id
Ref: BattlefieldDropItems.groupId > Battlefields.questLvDropId
// Ref: QuestExtraSettings.extraMode >
`);
await outText(path.join(DATA_PATH, `dbml.txt`), out.join("\n\n"));
