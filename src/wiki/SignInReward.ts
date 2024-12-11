import * as _ from "lodash-es";
import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { localizationString } from "../localization.js";
import { ItemGiveRef } from "../model/item-give-ref.js";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader.js";
import { WikiTableRow, WikiTableStruct, wikitable } from "../templates/wikitable.js";
import { range } from "../utils.js";

const SignInRewardTable = ImperiumData.fromGamedata().getTable("SignInReward");

export default function wikiSignInReward() {
	let out = wikiH1(localizationString("Metagame")("dailySignInTitle"));

	out += `\n\n${wikiH2(localizationString("Metagame")("signInRule"))}\n<pre>${localizationString(
		"Metagame",
	)("signInCardDescription")}</pre>`;

	const groups = _.groupBy(SignInRewardTable.rows, (r) => r.get("groupId"));
	for (const [groupId, group] of Object.entries(groups)) {
		const categories = _.groupBy(
			group.sort((a, b) => a.get("param1") - b.get("param1")),
			(r) => r.get("category"),
		);

		if (categories["special"]) {
			const groupTitle = localizationString("SignInSpecial")(`${groupId}_title`) || groupId;
			const groupDesc = localizationString("SignInSpecial")(`${groupId}_description`);
			out += `\n\n${wikiH2(groupTitle, groupId)}\n<pre>${groupDesc}</pre>`;
		} else {
			out += `\n\n${wikiH2(groupId)}`;
		}

		if (categories["day"]) {
			out += `\n${wikitable(buildWeekTable(categories["day"], categories["week"]))}`;
		}
		if (categories["month"]) {
			const table: WikiTableStruct = categories["month"].map(
				(row): WikiTableRow => [
					{
						header: true,
						text: `第 ${row.get("param1")} ~ ${row.get("param2")} 天`,
					},
					new ItemGiveRef(
						row.get("giveType"),
						row.get("giveLinkId"),
						row.get("giveAmount"),
					).toWiki(),
				],
			);
			out += `\n${wikiH3(
				localizationString("Metagame")("signInMonthReward"),
				`${groupId}_month`,
			)}\n${wikitable(table)}`;
		}
		const otherCategories = Object.keys(categories).filter(
			(key) => !["day", "week", "month"].includes(key),
		);
		for (const category of otherCategories) {
			const name =
				category == "special" ? localizationString("Metagame")("signInSpecial") : category;
			out += `\n${wikiH3(name, `${groupId}_${category}`)}\n${wikitable(
				buildWeekTable(categories[category]),
			)}`;
		}
	}

	return out;
}

function buildWeekTable(days: RowWrapper[], weeks?: RowWrapper[]): WikiTableStruct {
	const table: WikiTableStruct = {
		attributes: `class="wikitable" style="text-align: center;"`,
		rows: [],
	};
	for (let i = 0, weekIndex = 0; i < days.length; i += 7, weekIndex++) {
		const weekRow = weeks?.[weekIndex];
		table.rows.push(
			{
				headerBar: true,
				ceils: [
					"-",
					...range(i + 1, i + 7),
					...(weekRow
						? [`第 ${weekRow.get("param1")} ~ ${weekRow.get("param2")} 天`]
						: []),
				],
			},
			[
				{
					header: true,
					text: `第 ${Math.floor(i / 7) + 1} 週`,
				},
				...range(0, 6).map((j) =>
					days[i + j]
						? new ItemGiveRef(
								days[i + j].get("giveType"),
								days[i + j].get("giveLinkId"),
								days[i + j].get("giveAmount"),
						  ).toWiki({
								direction: "vertical",
						  })
						: "",
				),
				...(weekRow
					? [
							new ItemGiveRef(
								weekRow.get("giveType"),
								weekRow.get("giveLinkId"),
								weekRow.get("giveAmount"),
							).toWiki({
								direction: "vertical",
							}),
					  ]
					: []),
			],
		);
	}
	return table;
}
