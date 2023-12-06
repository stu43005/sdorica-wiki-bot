import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { localizationString } from "../localization";
import { LookupTableCategory } from "../model/enums/lookup-table-category.enum";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikiimage } from "../templates/wikiimage";
import { WikiTableStruct, wikitable } from "../templates/wikitable";

const BlessEffectsTable = ImperiumData.fromGamedata().getTable("BlessEffects");

export default function wikiBlessEffects() {
	let out = wikiH1("幻境祝福");

	const blessEffectGroups = _.groupBy(BlessEffectsTable.rows, (row) => row.get("groupId"));
	for (const [groupId, group1] of Object.entries(blessEffectGroups)) {
		out += `\n\n${wikiH2(groupId)}`;

		const table: WikiTableStruct = [["! 位置", "! iconKey", "! 效果"]];
		const positionGroups = _.groupBy(group1, (row) => row.get("positionGroup"));
		for (const [positionGroup, group2] of Object.entries(positionGroups)) {
			for (let i = 0; i < group2.length; i++) {
				const row = group2[i];
				table.push([
					...(i === 0
						? [
								{
									header: true,
									attributes: `rowspan="${group2.length}"`,
									text: positionGroup,
								},
						  ]
						: []),
					wikiimage({
						category: LookupTableCategory.EncounterOptionIcon,
						key: row.get("iconKey"),
						width: 25,
					}) +
						" " +
						row.get("iconKey"),
					localizationString("BlessEffects")(row.get("i2Key")),
				]);
			}
		}

		out += `\n${wikitable(table)}`;
	}

	return out;
}
