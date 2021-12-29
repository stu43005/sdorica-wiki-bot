import numeral from "numeral";
import { ImperiumData } from "../imperium-data";
import { localizationString } from "../localization";
import { arrayUnique } from "../utils";
import { item2wiki, item2wikiWithType } from "../wiki-item";

const AdventureDailyRankTable = ImperiumData.fromGamedata().getTable("AdventureDailyRank");
const AdventureTierTable = ImperiumData.fromGamedata().getTable("AdventureTier");
const AdventureWeekPointTable = ImperiumData.fromGamedata().getTable("AdventureWeekPoint");
const AdventureWeekRankTable = ImperiumData.fromGamedata().getTable("AdventureWeekRank");

export default function wikiAdventureRank() {
	const out: string[] = [];
	const dailyRankGroups = arrayUnique(AdventureDailyRankTable.rows.map(r => r.get("groupId")));
	const dailyRankImage: Record<string, string> = {
		"rank_daily_01": "幻境試煉_日排名_01_Icon.png",
		"rank_daily_02": "幻境試煉_日排名_02_Icon.png",
		"rank_daily_03": "幻境試煉_日排名_03_Icon.png",
		"rank_daily_04": "幻境試煉_日排名_04_Icon.png",
		"rank_daily_05": "幻境試煉_日排名_05_Icon.png",
	};

	out.push(`==本日總積分、評價與獎勵==`);
	for (let i = 0; i < dailyRankGroups.length; i++) {
		const groupId = dailyRankGroups[i];
		let str = `===group ${groupId}===
{| class="wikitable mw-collapsible"
|-
! 評價
! colspan="4" | 獎勵`;
		const entries = AdventureDailyRankTable.filter(r => r.get("groupId") == groupId && r.get("image") != "rank_daily_no");
		for (let j = 0; j < entries.length; j++) {
			const entry = entries[j];
			str += `\n|-
| [[File:${dailyRankImage[entry.get("image")]}|64px]] (${entry.get("maxPercentage")}% ~ ${entry.get("minPercentage")}%)
| ${item2wikiWithType(entry.get("giveType1"), entry.get("giveLinkId1"), entry.get("giveAmount1"))}
| ${item2wikiWithType(entry.get("giveType2"), entry.get("giveLinkId2"), entry.get("giveAmount2"))}
| ${item2wikiWithType(entry.get("giveType3"), entry.get("giveLinkId3"), entry.get("giveAmount3"))}
| ${item2wikiWithType(entry.get("giveType4"), entry.get("giveLinkId4"), entry.get("giveAmount4"))}`;
		}
		str += `\n|}`;
		out.push(str);
	}
	const weekRankGroups = arrayUnique(AdventureWeekRankTable.rows.map(r => r.get("groupId")));
	const weekRankImage: Record<string, string> = {
		"rank_week_01": "幻境試煉_週排名_01_Icon.png",
		"rank_week_02": "幻境試煉_週排名_02_Icon.png",
		"rank_week_03": "幻境試煉_週排名_03_Icon.png",
		"rank_week_04": "幻境試煉_週排名_04_Icon.png",
		"rank_week_05": "幻境試煉_週排名_05_Icon.png",
	};

	out.push(`==本週總積分、排名與獎勵==`);
	for (let i = 0; i < weekRankGroups.length; i++) {
		const groupId = weekRankGroups[i];
		let str = `===group ${groupId}===
{| class="wikitable mw-collapsible"
|-
! colspan="2" | 排名
! colspan="4" | 獎勵`;
		const entries = AdventureWeekRankTable.filter(r => r.get("groupId") == groupId && r.get("image") != "rank_week_no");
		for (let j = 0; j < entries.length; j++) {
			const entry = entries[j];
			str += `\n|-
| style="text-align: center;" | [[File:${weekRankImage[entry.get("image")]}|64px]]
| style="text-align: center;" | No.${entry.get("maxRanking")}<br>｜<br>${entry.get("minRanking") == -1 ? "∞" : `No.${entry.get("minRanking")}`}
| ${item2wikiWithType(entry.get("giveType1"), entry.get("giveLinkId1"), entry.get("giveAmount1"))}
| ${item2wikiWithType(entry.get("giveType2"), entry.get("giveLinkId2"), entry.get("giveAmount2"))}
| ${item2wikiWithType(entry.get("giveType3"), entry.get("giveLinkId3"), entry.get("giveAmount3"))}
| ${item2wikiWithType(entry.get("giveType4"), entry.get("giveLinkId4"), entry.get("giveAmount4"))}`;
		}
		str += `\n|}`;
		out.push(str);
	}

	const advTierGroups = arrayUnique(AdventureTierTable.rows.map(r => r.get("groupId")));
	out.push(`==階級排名獎勵==`);
	for (let i = 0; i < advTierGroups.length; i++) {
		const groupId = advTierGroups[i];
		let str = `===group ${groupId}===
{| class="wikitable mw-collapsible"
|-
! 階級
! 評價
! colspan="4" | 獎勵
! 下週階級變化`;
		const groupEntries = AdventureTierTable.filter(r => r.get("groupId") == groupId && r.get("maxPercentage") != -1);
		const ranks = arrayUnique(groupEntries.map(r => r.get("rankName")));
		for (let j = 0; j < ranks.length; j++) {
			const rankName = ranks[j];
			const entries = groupEntries.filter(r => r.get("rankName") == rankName);
			const rankNameCh = localizationString("Adventure")(rankName);
			str += `\n|-
! rowspan="${entries.length}" | [[檔案:幻境${rankNameCh}_Icon.png|30px]]<br>${rankNameCh}`;
			for (let j = 0; j < entries.length; j++) {
				const entry = entries[j];
				if (j > 0) {
					str += `\n|-`;
				}
				str += `
| style="text-align: center;" | ${entry.get("maxPercentage")}% ~ ${entry.get("minPercentage")}%
| ${item2wikiWithType(entry.get("giveType1"), entry.get("giveLinkId1"), entry.get("giveAmount1"))}
| ${item2wikiWithType(entry.get("giveType2"), entry.get("giveLinkId2"), entry.get("giveAmount2"))}
| ${item2wikiWithType(entry.get("giveType3"), entry.get("giveLinkId3"), entry.get("giveAmount3"))}
| ${item2wikiWithType(entry.get("giveType4"), entry.get("giveLinkId4"), entry.get("giveAmount4"))}
| ${localizationString("Adventure", "tier_rank")(entry.get("nextRank"))}`;
			}
		}
		str += `\n|}`;
		out.push(str);
	}

	const weekPointGroups = arrayUnique(AdventureWeekPointTable.rows.map(r => r.get("groupId")));
	out.push(`==積分獎勵==`);
	for (let i = 0; i < weekPointGroups.length; i++) {
		const groupId = weekPointGroups[i];
		let str = `===group ${groupId}===
{| class="wikitable mw-collapsible"
|-
! 積分
! colspan="4" | 獎勵`;
		const entries = AdventureWeekPointTable.filter(r => r.get("groupId") == groupId).sort((a, b) => a.get("points") - b.get("points"));
		for (let j = 0; j < entries.length; j++) {
			const entry = entries[j];
			str += `\n|-
| ${numeral(Number(entry.get("points"))).format("0,0")}分
| ${item2wikiWithType(entry.get("giveType1"), entry.get("giveLinkId1"), entry.get("giveAmount1"))}
| ${item2wikiWithType(entry.get("giveType2"), entry.get("giveLinkId2"), entry.get("giveAmount2"))}
| ${item2wikiWithType(entry.get("giveType3"), entry.get("giveLinkId3"), entry.get("giveAmount3"))}
| ${item2wikiWithType(entry.get("giveType4"), entry.get("giveLinkId4"), entry.get("giveAmount4"))}`;
		}
		str += `\n|}`;
		out.push(str);
	}

	return out.join("\n\n");
}
