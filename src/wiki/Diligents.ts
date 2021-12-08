import numeral from "numeral";
import { ImperiumData } from "../imperium-data";
import { localizationChapterName, localizationItemNameWithType, localizationString } from "../localization";
import { TemplateString } from "../model/template-string";
import { arrayGroupBy } from "../utils";
import { item2wiki } from "../wiki-item";

const DiligentGroupsTable = ImperiumData.fromGamedata().getTable("DiligentGroups");
const DiligentsTable = ImperiumData.fromGamedata().getTable("Diligents");

export default function wikiDiligents() {
	let out: string[] = [];

	const diligentGroups = arrayGroupBy(DiligentGroupsTable.rows, (row) => row.get("chapterId"));
	for (const chapterId of Object.keys(diligentGroups)) {
		const levelGroups = diligentGroups[chapterId].sort((a, b) => a.get("diligentAmount") - b.get("diligentAmount"));
		const levelDiligents = levelGroups.map(levelRow => DiligentsTable.filter(row => levelRow.get("levelGroup") == row.get("levelGroup")));
		const levelEffects: string[][] = [];
		const diligentId: string = levelGroups[0]?.get("diligentId");

		let str = `=== ${chapterId}:${localizationChapterName()(chapterId)} ===
{| class="wikitable mw-collapsible"
|-
! 階段 !! ${item2wiki(diligentId)} !! 效果`;

		for (let level = 0; level < levelGroups.length; level++) {
			const levelGroup = levelGroups[level];
			const diligents = levelDiligents[level];
			const effects: string[] = levelEffects[level] = [];
			const rowspan = diligents.length;

			str += `\n|-
! rowspan="${rowspan}" | ${level}
| rowspan="${rowspan}" | ${numeral(+levelGroup.get("diligentAmount")).format("0,0")}`;

			for (let j = 0; j < diligents.length; j++) {
				const diligent = diligents[j];
				let style = "";
				if (diligent.get("diligentType") == "empty") {
					style += "color: #ccc;";
				}
				const effect = effects[j] = new TemplateString(localizationString("Diligents")(diligent.get("diligentI2Key"))).apply({
					giveLinkId: localizationItemNameWithType()(`${diligent.get("giveLinkId")}:${diligent.get("giveType")}`),
					giveAmount: diligent.get("giveAmount"),
					abilityIncrease: diligent.get("abilityIncrease"),
					buffId: diligent.get("buffId"),
					buffLevel: diligent.get("buffLevel"),
				});
				if (level > 0 && !levelEffects[level - 1].find(e => e === effect)) {
					style += "background-color: #90ee90;";
				}

				if (j > 0) {
					str += "\n|-";
				}
				str += `\n|${style ? ` style="${style}" ` : ""}| ${effect}`;
			}
		}

		str += `\n|}`

		out.push(str);
	}

	return out.join("\n\n");
}
