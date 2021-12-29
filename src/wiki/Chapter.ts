import { ImperiumData } from "../imperium-data";
import { localizationQuestName, localizationQuestSubtitle, localizationString, localizationVolumeNameById } from "../localization";
import { objectEach } from "../utils";
import { item2wiki, item2wikiWithType, treasureList } from "../wiki-item";
import { chapterMetadata, questMetadata } from "../wiki-quest";
import { titleparts } from "../wiki-utils";
import { Chapter } from './../model/chapter';

const ChaptersTable = ImperiumData.fromGamedata().getTable("Chapters");
const QuestsTable = ImperiumData.fromGamedata().getTable("Quests");
const VolumeTable = ImperiumData.fromGamedata().getTable("Volume");

function stateCondition(cond: string, param1: string): string {
	switch (cond) {
		case "PlayerLevel":
			return `諦視者等級 ${param1}`;
		case "QuestComplete":
			return `通過關卡 ${localizationQuestName()(param1)}`;
		case "VolumeExist":
			return `已開啟卷 ${localizationVolumeNameById()(param1)}`;
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
		const chapter = Chapter.get(row);
		const quests = QuestsTable.filter(q => q.get("chapter") == chapter.id && q.get("enable"));
		const { name, title, imageName, group } = chapterMetadata(row);
		let str = `===${name}：${title}===
* 章節可見條件：${stateCondition(chapter.visibleCondition, chapter.visibleConditionParam)}
* 章節解鎖條件：${stateCondition(chapter.unlockCondition, chapter.unlockConditionParam)}${chapter.chapterCount ? `
* 累積最大關卡次數：${chapter.chapterCount.max}
* 自動恢復關卡次數：${chapter.chapterCount.regainString}
* 增加可完成次數消耗：${chapter.chapterCount.payItem.toWiki()}${chapter.chapterCount.payItem2.toWiki()}` : ''}
* 章節完成獎勵：${treasureList(chapter.dropGroupID, '*')}
{{旅途表格|${imageName}}}`;
		for (let j = 0; j < quests.length; j++) {
			const quest = quests[j];
			const { prefix, ch, ch2, name: questName, wikilink } = questMetadata(quest, row);
			const wikilinkLastPart = titleparts(wikilink, 0, -1);
			str += `\n{{旅途|${localizationQuestSubtitle()(quest.get("subtitle"))}|${quest.get("recommendLevel")}|${prefix}|${ch}${ch2 ? "-" + ch2 : ""}|${wikilink}${wikilinkLastPart != questName ? `|${questName}` : ""}}}`;
		}
		str += `\n{{旅途表格結束}}`;
		if (!chapter.enable) {
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
