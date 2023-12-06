import _ from "lodash";
import { ImperiumData } from "../imperium-data";
import { localizationHomelandBuildingName } from "../localization";
import { TavernMission } from "../model/tavern-mission";
import { TavernMissionRequire } from "../model/tavern-mission-require";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader";
import { wikiimage } from "../templates/wikiimage";
import { WikiTableStruct, wikitable } from "../templates/wikitable";
import { range } from "../utils";
import { wikiNextLine } from "../wiki-utils";

const TavernMissionDropTable = ImperiumData.fromGamedata().getTable("TavernMissionDrop");

function getTavernMissionTypeName(type: string, buildingId: string) {
	switch (type) {
		case "HomeLevel":
			return "冒險營地";
		case "Building":
			return localizationHomelandBuildingName()(buildingId);
		case "PlayerLevel":
			return `諦視者`;
	}
	return "";
}

export default function wikiTavernMissionCompact() {
	let out = wikiH1(`篝火 (完整版)`);

	const TavernMissionDropEnabled = TavernMissionDropTable.filter(
		(r) => TavernMission.get(r.get("missionId"))?.enable ?? false
	);

	out += `\n\n${wikiH2(`每日任務`)}`;

	const dailyMissionIds = TavernMission.getAll()
		.filter((r) => r.tab == "daily" && r.category == "daily")
		.map((r) => r.id);
	const dropDaily = TavernMissionDropEnabled.filter(
		(r) =>
			dailyMissionIds.includes(r.get("missionId")) &&
			r.get("type") == "Building" &&
			r.get("param1") == 2 /*篝火*/ &&
			TavernMission.get(r.get("missionId"))?.questRank == r.get("param2")
	);
	const dropDailyRanks = _.groupBy(
		dropDaily,
		(r) => `${r.get("type")},${r.get("param1")},${r.get("param2")}`
	);

	for (const [rankKey, group1] of Object.entries(dropDailyRanks)) {
		const [, buildingId, questRank] = rankKey.split(",");
		const maxReqSkillCount = Math.max(
			1,
			...group1.map((r) => {
				const reqSkill = TavernMissionRequire.get(r.get("missionId"));
				return reqSkill.length;
			})
		);

		out += `\n\n${wikiH3(
			`${localizationHomelandBuildingName()(buildingId)} ${questRank} 級【${questRank} ★】`
		)}`;
		const table: WikiTableStruct = {
			attributes: `class="wikitable table-responsive-autowrap"`,
			rows: [
				[
					`! 類型`,
					`! 任務`,
					{
						header: true,
						attributes: `colspan="${maxReqSkillCount}"`,
						text: `所需技能`,
					},
					`! 基礎獎勵`,
					`! 額外獎勵`,
				],
			],
		};

		const groupIds = _.groupBy(group1, (r) => r.get("groupId"));
		for (const [, group2] of Object.entries(groupIds)) {
			const missions = group2
				.map((r) => TavernMission.get(r.get("missionId")))
				.filter((r): r is TavernMission => !!r);
			const sameDropItem = missions.every((m1, index) =>
				missions
					.slice(index + 1)
					.every((m2) => m1.displayDropItem.compare(m2.displayDropItem))
			);
			const sameExtraDropItem = missions.every((m1, index) =>
				missions
					.slice(index + 1)
					.every((m2) => m1.displayExtraDropItem.compare(m2.displayExtraDropItem))
			);

			for (let k = 0; k < missions.length; k++) {
				const mission = missions[k];
				table.rows.push([
					...(k === 0
						? [
								{
									attributes: `rowspan="${group2.length}" style="text-align: center;"`,
									text: wikiNextLine(
										`${wikiimage({
											url: mission.getIconAssetUrl(),
											width: 40,
										})}\n${mission.getWikiCategoryName()}`
									),
								},
						  ]
						: []),
					`${
						mission.heroSlot
							? `${wikiimage({
									url: mission.getHeroSlotAssetUrl(),
									height: 24,
							  })} `
							: ""
					}${mission.name}`,
					...range(1, maxReqSkillCount).map(
						(value) => mission.reqSkills[value - 1]?.toWiki() ?? ""
					),
					...(!sameDropItem || k == 0
						? [
								{
									attributes: sameDropItem ? `rowspan="${group2.length}"` : "",
									text: mission.displayDropItem.toWiki({ text: "" }),
								},
						  ]
						: []),
					...(!sameExtraDropItem || k == 0
						? [
								{
									attributes: sameExtraDropItem
										? `rowspan="${group2.length}"`
										: "",
									text: mission.displayExtraDropItem.toWiki({ text: "" }),
								},
						  ]
						: []),
				]);
			}
		}

		out += `\n${wikitable(table)}`;
	}

	out += `\n\n${wikiH2(`成長任務`)}`;

	const achievementMissionIds = TavernMission.getAll()
		.filter((r) => r.tab == "achievement" && r.category == "achievement")
		.map((r) => r.id);
	const dropAchievement = TavernMissionDropEnabled.filter((r) =>
		achievementMissionIds.includes(r.get("missionId"))
	);
	const dropAchievementTypes = _.groupBy(dropAchievement, (r) =>
		r.get("type") == "Building" ? `${r.get("type")},${r.get("param1")}` : r.get("type")
	);

	for (const [typeKey, group1] of Object.entries(dropAchievementTypes)) {
		const [type, buildingId] = typeKey.split(",");
		const maxReqSkillCount = Math.max(
			1,
			...group1.map((r) => {
				const reqSkill = TavernMissionRequire.get(r.get("missionId"));
				return reqSkill.length;
			})
		);
		const typeName = getTavernMissionTypeName(type, buildingId);

		out += `\n\n${wikiH3(typeName)}`;
		const table: WikiTableStruct = {
			attributes: `class="wikitable table-responsive-autowrap"`,
			rows: [
				[
					`! 類型`,
					{
						header: true,
						text: typeName,
					},
					`! 星級`,
					`! 任務`,
					{
						header: true,
						attributes: `colspan="${maxReqSkillCount}"`,
						text: `所需技能`,
					},
					`! 基礎獎勵`,
					`! 額外獎勵`,
				],
			],
		};

		for (let k = 0; k < group1.length; k++) {
			const row = group1[k];
			const mission = TavernMission.get(row.get("missionId"));
			if (!mission) continue;

			table.rows.push([
				...(k === 0
					? [
							{
								attributes: `rowspan="${group1.length}" style="text-align: center;"`,
								text: wikiNextLine(
									`${wikiimage({
										url: mission.getIconAssetUrl(),
										width: 40,
									})}\n${mission.getWikiCategoryName()}`
								),
							},
					  ]
					: []),
				`Lv ${row.get("param2") == -1 ? row.get("param1") : row.get("param2")}`,
				mission.questRankStar,
				`${
					mission.heroSlot
						? `${wikiimage({
								url: mission.getHeroSlotAssetUrl(),
								height: 24,
						  })} `
						: ""
				}${mission.name}`,
				...range(1, maxReqSkillCount).map(
					(value) => mission.reqSkills[value - 1]?.toWiki() ?? ""
				),
				mission.displayDropItem.toWiki({ text: "" }),
				mission.displayExtraDropItem.toWiki({ text: "" }),
			]);
		}

		out += `\n${wikitable(table)}`;
	}

	return out;
}
