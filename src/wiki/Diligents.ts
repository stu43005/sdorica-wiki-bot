import _ from "lodash";
import numeral from "numeral";
import { ImperiumData } from "../imperium-data";
import { localizationItemNameWithType, localizationString } from "../localization";
import { Chapter } from "../model/chapter";
import { Item } from "../model/item";
import { TemplateString } from "../model/template-string";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikiPageLink } from "../templates/wikilink";
import { WikiTableStruct, wikitable } from "../templates/wikitable";

const DiligentGroupsTable = ImperiumData.fromGamedata().getTable("DiligentGroups");
const DiligentsTable = ImperiumData.fromGamedata().getTable("Diligents");

export default function wikiDiligents() {
	let out = wikiH1("閱歷值");

	const diligentGroups = _.groupBy(DiligentGroupsTable.rows, (r) => r.get("chapterId"));
	for (const [chapterId, group] of Object.entries(diligentGroups)) {
		const chapter = Chapter.get(chapterId);
		const levels = group
			.sort((a, b) => a.get("diligentAmount") - b.get("diligentAmount"))
			.map((level) => {
				const diligents = DiligentsTable.filter(
					(row) => level.get("levelGroup") == row.get("levelGroup")
				);
				return {
					level,
					diligentId: level.get("diligentId") as string,
					diligentAmount: +level.get("diligentAmount"),
					diligents: diligents.map((diligent) => ({
						diligent,
						diligentType: diligent.get("diligentType") as string,
						effect: new TemplateString(
							localizationString("Diligents")(diligent.get("diligentI2Key"))
						).apply({
							giveLinkId: localizationItemNameWithType()(
								`${diligent.get("giveLinkId")}:${diligent.get("giveType")}`
							),
							giveAmount: diligent.get("giveAmount"),
							abilityIncrease: diligent.get("abilityIncrease"),
							buffId: diligent.get("buffId"),
							buffLevel: diligent.get("buffLevel"),
						}),
					})),
				};
			});

		const diligentId = levels[0].diligentId;
		const table: WikiTableStruct = {
			attributes: `class="wikitable mw-collapsible"`,
			rows: [
				[
					`! 階段`,
					{
						header: true,
						text: (diligentId && Item.get(diligentId)?.toWiki()) || "閱歷值",
					},
					`! 效果`,
				],
			],
		};
		for (let i = 0; i < levels.length; i++) {
			const level = levels[i];
			for (let j = 0; j < level.diligents.length; j++) {
				const diligent = level.diligents[j];
				const styles: string[] = [];
				if (diligent.diligentType === "empty") {
					styles.push("color: #ccc;");
				}
				if (i > 0 && !levels[i - 1].diligents.find((e) => e.effect === diligent.effect)) {
					styles.push("background-color: #90ee90; color: #1e1e1e;");
				}
				table.rows.push([
					...(j === 0
						? [
								{
									attributes: `rowspan="${level.diligents.length}"`,
									text: i,
								},
								{
									attributes: `rowspan="${level.diligents.length}"`,
									text: numeral(level.diligentAmount).format("0,0"),
								},
						  ]
						: []),
					{
						attributes: styles.length ? `style="${styles.join(" ")}"` : "",
						text: diligent.effect,
					},
				]);
			}
		}

		out += `\n\n${wikiH2(
			chapter ? wikiPageLink("Chapter", chapter.getWikiFullName(), chapterId) : chapterId
		)}\n${wikitable(table)}`;
	}

	return out;
}
