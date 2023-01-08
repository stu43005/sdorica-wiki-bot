import { ImperiumData } from "../imperium-data";

const ConstantsTable = ImperiumData.fromGamedata().getTable("Constants");

export default function wikiConstantsJson() {
	const constants: Record<string, number> = {};
	for (const row of ConstantsTable) {
		constants[row.get("id")] = row.get("value");
	}
	return constants;
}
