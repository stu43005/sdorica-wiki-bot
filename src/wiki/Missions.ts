import { ImperiumData, RowWrapper } from "../imperium-data";
import { localizationCharacterNameByHeroId, localizationString } from "../localization";
import { item2wikiWithType } from "../wiki-item";
import { questMetadata } from "../wiki-quest";

const ChaptersTable = ImperiumData.fromGamedata().getTable("Chapters");
const MissionsTable = ImperiumData.fromGamedata().getTable("Missions");
const QuestsTable = ImperiumData.fromGamedata().getTable("Quests");

export default function wikiMissions() {
	const out: string[] = [];
	const MissionsTabs = [...new Set(MissionsTable.rows.map(r => r.get("tab")))];
	for (let i = 0; i < MissionsTabs.length; i++) {
		const tab = MissionsTabs[i];
		out.push(`==${tab}==`);
		const categorys = [...new Set(MissionsTable.filter(r => r.get("tab") == tab).sort((a, b) => Number(a.get("order")) - Number(b.get("order"))).map(r => r.get("category")))].sort((a, b) => a.localeCompare(b));
		for (let j = 0; j < categorys.length; j++) {
			const category = categorys[j];
			let str = `===${category}===
{| class="wikitable mw-collapsible"
|-
! 諦視者等級 !! 任務內容 !! 任務獎勵`;
			const missions = MissionsTable.filter(r => r.get("tab") == tab && r.get("category") == category);
			for (let k = 0; k < missions.length; k++) {
				const mission = missions[k];
				if (mission.get("enable") && mission.get("weight") != 0) {
					str += `\n|-`;
				}
				else {
					str += `\n|- style="background-color: #ccc" title="停用"`;
				}
				str += `\n| ${mission.get("minLv") == -1 ? `style="text-align: center;" | -` : mission.get("maxLv") == 99 ? `${mission.get("minLv")} ↑` : `${mission.get("minLv")} ~ ${mission.get("maxLv")}`}\n| ${missionName(mission)}\n| ${item2wikiWithType(mission.get("giveType"), mission.get("giveLinkId"), mission.get("giveAmount"))}`;
			}
			str += `\n|}`;
			out.push(str);
		}
	}

	return out.join("\n\n");
}

function missionName(mission: RowWrapper) {
	if (mission.get("type") != "Quest") {
		return localizationString("Mission", "mission_")(mission.get("id")) || mission.get("name");
	}

	let prefix = "";
	if (mission.get("tab") == "guild") {
		const lv = mission.get("category").replace(/guild/g, "");
		prefix = localizationString("Mission")("prefix_level").replace(/{\[level\]}/g, lv);
	}
	else if (mission.get("category") == "limit7" || mission.get("category") == "treasure") {
		prefix = localizationString("Mission")("prefix_treasure");
	}
	else if (mission.get("category") == "limit6" || mission.get("category") == "gemCard") {
		prefix = localizationString("Mission")("prefix_gem");
	}

	const limitations = (mission.get("param3") as string).split(";").map(limit => {
		if (limit.startsWith("LimitTurn")) {
			const turn = limit.replace(/LimitTurn_/g, "");
			return localizationString("Mission")("limit_turn").replace(/{\[turn\]}/g, turn);
		}
		if (limit.startsWith("LimitDead")) {
			const count = limit.replace(/LimitDead_/g, "");
			if (Number(count) == 0) {
				return localizationString("Mission")("limit_no_casualties");
			}
			return localizationString("Mission")("limit_casualties_count").replace(/{\[casualty\]}/g, count);
		}
		if (limit.startsWith("Use")) {
			const id = limit.replace(/Use_/g, "");
			return localizationString("Mission")("use_heroId").replace(/{\[characterName\]}/g, localizationCharacterNameByHeroId()(id));
		}
		if (limit.startsWith("NoUse")) {
			const id = limit.replace(/NoUse_/g, "");
			return localizationString("Mission")("not_use_heroId").replace(/{\[characterName\]}/g, localizationCharacterNameByHeroId()(id));
		}
		if (limit.startsWith("NoAssistant")) {
			return localizationString("Mission")("no_assistant");
		}
		if (limit.startsWith("NoGuild")) {
			return localizationString("Mission")("no_guild_assistant");
		}
		if (limit.startsWith("CastMore")) {
			let match = limit.match(/^CastMore_S(\d+)_(\d+)$/);
			if (match) {
				return localizationString("Mission")("castmore_Skill").replace(/{\[block\]}/g, match[1]).replace(/{\[skillCount\]}/g, match[2]);
			}
			match = limit.match(/^CastMore_(\w+)_(\d+)$/);
			if (match) {
				return localizationString("Mission")(`castmore_${match[1]}`).replace(/{\[skillCount\]}/g, match[2]);
			}
			debugger;
			return limit;
		}
		if (limit.startsWith("CastLess")) {
			let match = limit.match(/^CastLess_S(\d+)_(\d+)$/);
			if (match) {
				if (Number(match[2]) == 0) {
					return localizationString("Mission")("cast_no_erase_Skill").replace(/{\[block\]}/g, match[1]);
				}
				return localizationString("Mission")("castless_Skill").replace(/{\[block\]}/g, match[1]).replace(/{\[skillCount\]}/g, match[2]);
			}
			match = limit.match(/^CastLess_(\w+)_(\d+)$/);
			if (match) {
				if (Number(match[2]) == 0) {
					return localizationString("Mission")(`cast_no_${match[1]}`);
				}
				return localizationString("Mission")(`castless_${match[1]}`).replace(/{\[skillCount\]}/g, match[2]);
			}
			debugger;
			return limit;
		}
		if (limit.startsWith("limitS")) {
			const match = limit.match(/^limitS(\d+)$/);
			if (match) {
				return localizationString("Mission")("cast_no_erase_Skill").replace(/{\[block\]}/g, match[1]);
			}
			debugger;
			return limit;
		}
	});

	let clear = mission.get("param1");
	const quest = QuestsTable.find(q => q.get("id") == mission.get("param1"));
	if (quest) {
		const chapterId = quest.get("chapter");
		const chapter = ChaptersTable.find(c => c.get("id") == chapterId);
		if (chapter) {
			const qq = questMetadata(quest, chapter);
			const questname = `${qq.prefix}${qq.ch}-${qq.ch2} [[${qq.name}]]`;
			switch (chapter.get("group")) {
				case "Region":
					clear = localizationString("Mission")("clear_region").replace(/{\[questname\]}/g, questname);
					break;
				case "Challenge":
					clear = localizationString("Mission")("clear_challenge").replace(/{\[questname\]}/g, questname);
					break;
			}
		}
	}
	return `${prefix} ${limitations.join(` ${localizationString("Mission")("and_description")} `)} ${clear}`;
}
