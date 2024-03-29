import * as _ from "lodash-es";
import numeral from "numeral";
import { ImperiumData } from "../imperium-data.js";
import { localizationString } from "../localization.js";
import { LookupTableCategory } from "../model/enums/custom/lookup-table-category.enum.js";
import { ItemGiveRef } from "../model/item-give-ref.js";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader.js";
import { wikiimage } from "../templates/wikiimage.js";
import { WikiTableCeil, WikiTableStruct, wikitable } from "../templates/wikitable.js";
import { range } from "../utils.js";
import { wikiNextLine } from "../wiki-utils.js";

const AdventureDailyRankTable = ImperiumData.fromGamedata().getTable("AdventureDailyRank");
const AdventureTierTable = ImperiumData.fromGamedata().getTable("AdventureTier");
const AdventureWeekPointTable = ImperiumData.fromGamedata().getTable("AdventureWeekPoint");
const AdventureWeekRankTable = ImperiumData.fromGamedata().getTable("AdventureWeekRank");

export default function wikiAdventureRank() {
	let out = wikiH1("幻境排名獎勵");

	out += `\n\n${wikiH2("本日總積分、評價與獎勵")}`;
	const dailyRankGroups = _.groupBy(
		AdventureDailyRankTable.filter((r) => r.get("image") !== "rank_daily_no"),
		(r) => r.get("groupId"),
	);
	for (const [groupId, group] of Object.entries(dailyRankGroups)) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable mw-collapsible"`,
			rows: [[`! 評價`, `! colspan="4" | 獎勵`]],
		};
		for (let i = 0; i < group.length; i++) {
			const entry = group[i];
			table.rows.push([
				`${wikiimage({
					category: LookupTableCategory.TierMedalSprite,
					key: entry.get("image"),
					width: 64,
				})} (${entry.get("maxPercentage")}% ~ ${entry.get("minPercentage")}%)`,
				...range(1, 4).map(
					(i): WikiTableCeil => ({
						text: new ItemGiveRef(
							entry.get(`giveType${i}`),
							entry.get(`giveLinkId${i}`),
							entry.get(`giveAmount${i}`),
						).toWiki(),
					}),
				),
			]);
		}
		out += `\n\n${wikiH3(`本日總積分、評價與獎勵 ${groupId}`)}\n${wikitable(table)}`;
	}

	out += `\n\n${wikiH2("本週總積分、排名與獎勵")}`;
	const weekRankGroups = _.groupBy(
		AdventureWeekRankTable.filter((r) => r.get("image") !== "rank_week_no"),
		(r) => r.get("groupId"),
	);
	for (const [groupId, group] of Object.entries(weekRankGroups)) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable mw-collapsible"`,
			rows: [[`! colspan="2" | 排名`, `! colspan="4" | 獎勵`]],
		};
		for (let i = 0; i < group.length; i++) {
			const entry = group[i];
			table.rows.push([
				{
					attributes: `style="text-align: center;"`,
					text: wikiimage({
						category: LookupTableCategory.TierMedalSprite,
						key: entry.get("image"),
						width: 64,
					}),
				},
				{
					attributes: `style="text-align: center;"`,
					text: wikiNextLine(
						`No.${entry.get("maxRanking")}\n｜\n${
							entry.get("minRanking") == -1 ? "∞" : `No.${entry.get("minRanking")}`
						}`,
					),
				},
				...range(1, 4).map(
					(i): WikiTableCeil => ({
						text: new ItemGiveRef(
							entry.get(`giveType${i}`),
							entry.get(`giveLinkId${i}`),
							entry.get(`giveAmount${i}`),
						).toWiki(),
					}),
				),
			]);
		}
		out += `\n\n${wikiH3(`本週總積分、排名與獎勵 ${groupId}`)}\n${wikitable(table)}`;
	}

	out += `\n\n${wikiH2("階級排名獎勵")}`;
	const advTierGroups = _.groupBy(
		AdventureTierTable.filter((r) => r.get("maxPercentage") != -1),
		(r) => r.get("groupId"),
	);
	for (const [groupId, group] of Object.entries(advTierGroups)) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable mw-collapsible"`,
			rows: [[`! 階級`, `! 評價`, `! colspan="5" | 獎勵`, `! 下週階級變化`]],
		};
		const rankGroups = _.groupBy(group, (r) => r.get("rankName"));
		for (const [rankName, ranks] of Object.entries(rankGroups)) {
			const rankNameCh = localizationString("Adventure")(rankName);
			for (let index = 0; index < ranks.length; index++) {
				const entry = ranks[index];
				table.rows.push([
					...(index === 0
						? [
								{
									header: true,
									attributes: `rowspan="${ranks.length}"`,
									text: wikiNextLine(
										`${wikiimage({
											category: LookupTableCategory.TierMedalSprite,
											key: entry.get("image"),
											width: 64,
										})}\n${rankNameCh}`,
									),
								},
						  ]
						: []),
					{
						attributes: `style="text-align: center;"`,
						text: `${entry.get("maxPercentage")}% ~ ${entry.get("minPercentage")}%`,
					},
					...range(1, 5).map(
						(i): WikiTableCeil => ({
							text: new ItemGiveRef(
								entry.get(`giveType${i}`),
								entry.get(`giveLinkId${i}`),
								entry.get(`giveAmount${i}`),
							).toWiki(),
						}),
					),
					localizationString("Adventure", "tier_rank")(entry.get("nextRank")),
				]);
			}
		}
		out += `\n\n${wikiH3(`階級排名獎勵 ${groupId}`)}\n${wikitable(table)}`;
	}

	out += `\n\n${wikiH2("積分獎勵")}`;
	const weekPointGroups = _.groupBy(AdventureWeekPointTable.rows, (r) => r.get("groupId"));
	for (const [groupId, group] of Object.entries(weekPointGroups)) {
		const sorted = group.sort((a, b) => a.get("points") - b.get("points"));
		const table: WikiTableStruct = {
			attributes: `class="wikitable mw-collapsible"`,
			rows: [[`! 積分`, `! colspan="5" | 獎勵`]],
		};
		for (let i = 0; i < sorted.length; i++) {
			const entry = sorted[i];
			table.rows.push([
				`${numeral(Number(entry.get("points"))).format("0,0")}分`,
				...range(1, 5).map(
					(i): WikiTableCeil => ({
						text: new ItemGiveRef(
							entry.get(`giveType${i}`),
							entry.get(`giveLinkId${i}`),
							entry.get(`giveAmount${i}`),
						).toWiki(),
					}),
				),
			]);
		}
		out += `\n\n${wikiH3(`積分獎勵 ${groupId}`)}\n${wikitable(table)}`;
	}

	return out;
}
