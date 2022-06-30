import path from "path";
import { DATA_PATH } from "./src/config";
import { ImperiumData } from "./src/imperium-data";
import { registerImperiumLocalLoader } from "./src/imperium-data-local";
import { outText } from "./src/out";
import { sortKeyByTable } from "./src/out-sort-key";
import { flipMatrix } from "./src/utils";

registerImperiumLocalLoader();

(async () => {
	const out: string[] = [];
	const gamedata = ImperiumData.fromGamedata();
	const raw = gamedata.getRawData();
	for (const tableName of Object.keys(raw.C)) {
		const table = raw.C[tableName];
		const [types, keys] = flipMatrix(flipMatrix([table.T, table.K]).sort(sortKeyByTable(tableName)));
		const columns: string[] = [];
		for (let i = 0; i < keys.length; i++) {
			const columnName = keys[i];
			if (/^\w+$/.test(columnName)) {
				columns.push(`  ${columnName} ${typeName(types[i] ?? "")}${quickInlineRef(columnName)}`);
			}
		}
		out.push(`Table ${tableName} {
${columns.join("\n")}
}`);
	}
	for (const enumName of Object.keys(raw.E)) {
		const values = raw.E[enumName];
		out.push(`Enum ${enumName.substring("enum:".length)} {
${values.map(v => `  ${v}`).join("\n")}
}`)
	}
	out.push(`
Ref: ExploreComposite.requireBuildingId > ExploreBuilding.id
Ref: Chapters.dropGroupID > DropItems.groupId
Ref: Quests.dropGroupId > DropItems.groupId
`);
	await outText(path.join(DATA_PATH, `dbml.txt`), out.join("\n\n"));
})();

function typeName(type: string): string {
	if (type.startsWith("enum:")) {
		return type.substring("enum:".length);
	}
	const maps = {
		"String": "string",
		"Integer": "int",
		"Boolean": "bool",
		"Float": "float",
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
	if (columnName === "evaluateId") return ` [ref: > Evaluates.groupId]`;
	return "";
}