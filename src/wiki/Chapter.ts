import { ImperiumData } from "../imperium-data";
import { localizationQuestName, localizationQuestSubtitle, localizationString } from "../localization";
import { objectEach } from "../utils";
import { item2wiki, item2wikiWithType, treasureList } from "../wiki-item";
import { chapterMetadata, questMetadata } from "../wiki-quest";
import { titleparts } from "../wiki-utils";

const ChaptersTable = ImperiumData.fromGamedata().getTable("Chapters");
const QuestsTable = ImperiumData.fromGamedata().getTable("Quests");
const VolumeTable = ImperiumData.fromGamedata().getTable("Volume");

function stateCondition(cond: string, param1: string): string {
	switch (cond) {
		case "PlayerLevel":
			return `諦視者等級 ${param1}`;
		case "QuestComplete":
			return `通過關卡 ${localizationQuestName()(param1)}`;
		case "FlagCondition":
			return `Flag: ${param1}`;
	}
	console.log(`unknown state condition: ${cond}:${param1}`);
	debugger;
	return `${cond}:${param1}`;
}

export default function wikiChapter() {
	const chapterGroupOut: Record<string, string[]> = {};
	for (let i = 0; i < ChaptersTable.length; i++) {
		const row = ChaptersTable.get(i);
		const chID = row.get("id");
		const quests = QuestsTable.filter(q => q.get("chapter") == chID && q.get("enable"));
		const { name, title, imageName, group } = chapterMetadata(row);
		let str = `===${name}：${title}===
* 章節可見條件：${stateCondition(row.get("visibleCondition"), row.get("param1"))}
* 章節解鎖條件：${stateCondition(row.get("unlockCondition"), row.get("param2"))}${row.get("countDisplay") ? `
* 每日可通關次數：${row.get("dailyCount")}
* 增加可完成次數消耗：${!row.get("extraCountCurrency") ? item2wiki(row.get("extraCountItem"), row.get("extraCountItemCount")) : item2wikiWithType(row.get("extraCountCurrency"), "", row.get("extraCountPrice"))}` : ''}
* 章節完成獎勵：${treasureList(row.get('dropGroupID'), '*')}
{{旅途表格|${imageName}}}`;
		for (let j = 0; j < quests.length; j++) {
			const quest = quests[j];
			const { prefix, ch, ch2, name: questName, wikilink } = questMetadata(quest, row);
			const wikilinkLastPart = titleparts(wikilink, 0, -1);
			str += `\n{{旅途|${localizationQuestSubtitle()(quest.get("subtitle"))}|${quest.get("recommendLevel")}|${prefix}|${ch}${ch2 ? "-" + ch2 : ""}|${wikilink}${wikilinkLastPart != questName ? `|${questName}` : ""}}}`;
		}
		str += `\n{{旅途表格結束}}`;
		if (!row.get("enable")) {
			str = `<!--\n${str}\n-->`;
		}
		if (!chapterGroupOut[group]) chapterGroupOut[group] = [];
		chapterGroupOut[group].push(str);
	}

	let out: string[] = [];
	objectEach(chapterGroupOut, (group, outs) => {
		out.push(`==${group}==`);
		const volume = VolumeTable.find(row => group.includes(row.get("title")) || (group.includes("Sdorica") && row.get("volume") == 'Main'));
		if (volume) {
			const name = localizationString("Metagame")(volume.get("name"));
			out.push(`* ${name}可見條件：${stateCondition(volume.get("visibleCondition"), volume.get("param1"))}
* ${name}解鎖條件：${stateCondition(volume.get("unlockCondition"), volume.get("param2"))}`);
		}
		out = out.concat(outs);
	});

	return out.join("\n\n");
}
