import { ImperiumData } from "../imperium-data";
import { localizationString } from "../localization";
import { wikiH1, wikiH3 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";

const BuffInfoTable = ImperiumData.fromGamedata().getTable("BuffInfo");

export default function wikiBuffs() {
	let out = wikiH1("BUFF列表");

	const table: WikiTableStruct = [
		["! id", "! 名稱", "! 英文名稱", "! 說明", "! Icon"],
	];

	for (const row of BuffInfoTable.rows.sort(
		(a, b) => a.get("order") - b.get("order")
	)) {
		const id = row.get("id");
		const name = localizationString("BaseBuff")(
			row.get("localizationNameKey")
		);
		const enname = localizationString(
			"BaseBuff",
			"",
			"Key",
			"English"
		)(row.get("localizationNameKey"));
		const info = localizationString("BaseBuff")(
			row.get("localizationInfoKey")
		);
		const iconKey = row.get("iconKey");
		table.push({
			attributes: row.get("viewable")
				? ``
				: `style="background-color: #ccc; color: #1e1e1e;" title="不可見"`,
			ceils: [id, wikiH3(name, id, true), enname, info, iconKey],
		});
	}

	out += `\n\n${wikitable(table)}`;

	return out;
}
