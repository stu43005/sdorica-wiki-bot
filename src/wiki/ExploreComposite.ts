import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { localizationExploreBuildingName } from "../localization";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";
import { range } from "../utils";
import { item2wiki } from "../wiki-item";

const ExploreBuildingTable = ImperiumData.fromGamedata().getTable("ExploreBuilding");
const ExploreCompositeTable = ImperiumData.fromGamedata().getTable("ExploreComposite");

export default function wikiExploreComposite() {
	let out = wikiH1("探索合成表");

	const groups = _.groupBy(
		ExploreCompositeTable.filter((r) => r.get("enable")),
		(r) => r.get("requireBuildingId")
	);
	for (const [requireBuildingId, group] of Object.entries(groups)) {
		const building = ExploreBuildingTable.find((r) => r.get("id") === requireBuildingId);

		const table: WikiTableStruct = [[`! 設施等級`, `! 道具名稱`, `! 合成素材`, `! 合成條件`]];
		for (const entry of group) {
			const items = range(1, 4)
				.map((i) =>
					item2wiki(entry.get(`item${i}Id`), entry.get(`item${i}Count`), true, {
						size: "20px",
					})
				)
				.filter(Boolean);
			const reset =
				entry.get("resetDay") != -1
					? `\n(${entry.get("maxCount")}次/${entry.get("resetDay")}日)`
					: "";

			table.push({
				attributes: entry.get("enable")
					? ""
					: `style="background-color: #ccc; color: #1e1e1e;" title="停用"`,
				ceils: [
					{
						attributes: `style="text-align:center"`,
						text: `Lv ${building?.get("level") ?? "?"}`,
					},
					`${item2wiki(entry.get("itemId"), undefined, true)}${reset}`,
					items.join(" "),
					{
						attributes: `style="text-align: center"`,
						text: entry.get("requireFlagId") ? `{{?}}` : "-",
					},
				],
			});
		}

		const header = building
			? `${localizationExploreBuildingName()(building.get("type"))} Lv ${building.get(
					"level"
			  )}`
			: `requireBuildingId: ${requireBuildingId}`;
		out += `\n\n${wikiH2(header)}\n${wikitable(table)}`;
	}

	const otherComposites = ExploreCompositeTable.filter((r) => !r.get("enable"));
	if (otherComposites.length > 0) {
		const table: WikiTableStruct = [[`! 設施`, `! 道具名稱`, `! 合成素材`, `! 合成條件`]];
		for (const entry of otherComposites) {
			if (+entry.get("itemId") >= 1 && +entry.get("itemId") <= 11) continue;

			const items = range(1, 4)
				.map((i) =>
					item2wiki(entry.get(`item${i}Id`), entry.get(`item${i}Count`), true, {
						size: "20px",
					})
				)
				.filter(Boolean);
			const reset =
				entry.get("resetDay") != -1
					? `\n(${entry.get("maxCount")}次/${entry.get("resetDay")}日)`
					: "";

			const building = ExploreBuildingTable.find(
				(r) => r.get("id") === entry.get("requireBuildingId")
			);
			const header = building
				? `${localizationExploreBuildingName()(building.get("type"))} Lv ${building.get(
						"level"
				  )}`
				: entry.get("requireBuildingId");

			table.push({
				attributes: entry.get("enable")
					? ""
					: `style="background-color: #ccc; color: #1e1e1e;" title="停用"`,
				ceils: [
					{
						attributes: `style="text-align:center"`,
						text: header,
					},
					`${item2wiki(entry.get("itemId"), undefined, true)}${reset}`,
					items.join(" "),
					{
						attributes: `style="text-align: center"`,
						text: entry.get("requireFlagId") ? `{{?}}` : "-",
					},
				],
			});
		}

		out += `\n\n${wikiH2("其他停用製作項目")}\n${wikitable(table)}`;
	}

	return out;
}
