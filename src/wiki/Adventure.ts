import { ImperiumData } from "../imperium-data";
import { localizationQuestSubtitle, localizationString, localizationStringAuto } from "../localization";
import { questMetadata } from "../wiki-quest";

const AdventureRuleTable = ImperiumData.fromGamedata().getTable("AdventureRule");
const ChaptersTable = ImperiumData.fromGamedata().getTable("Chapters");
const QuestsTable = ImperiumData.fromGamedata().getTable("Quests");

function advRuleNumber(v: number) {
	return v < 0 ? `扣${v * -1}` : `獲得${v}`;
}

export default function wikiAdventure() {
	const out: string[] = [];
	out.push(`===計分機制===`);

	let advRuleOut = `{| class="wikitable"
! 機制
! 詳細內容`;
	for (let i = 0; i < AdventureRuleTable.length; i++) {
		const row = AdventureRuleTable.get(i);
		const descs: string[] = [];
		if (row.get("finalArmor")) descs.push(`finalArmor: ${row.get("finalArmor")}`);
		if (row.get("finalDeathCount")) descs.push(`finalDeathCount: ${row.get("finalDeathCount")}`);
		if (row.get("finalHp")) descs.push(`finalHp: ${row.get("finalHp")}`);
		if (row.get("finalS1Count")) descs.push(`finalS1Count: ${row.get("finalS1Count")}`);
		if (row.get("finalS2Count")) descs.push(`finalS2Count: ${row.get("finalS2Count")}`);
		if (row.get("finalS4Count")) descs.push(`finalS4Count: ${row.get("finalS4Count")}`);
		if (row.get("levelScore")) descs.push(`levelScore: ${row.get("levelScore")}`);
		if (row.get("totalDamageScore")) descs.push(`totalDamageScore: ${row.get("totalDamageScore")}`);
		if (row.get("turn")) descs.push(`每使用1個回合${advRuleNumber(row.get("turn"))}分`);
		if (row.get("wave")) descs.push(`每完成一個波次${advRuleNumber(row.get("wave"))}分`);
		if (row.get("waveHp")) descs.push(`每完成一個波次時，其所有角色每1%血量獲得${advRuleNumber(row.get("waveHp"))}分`);
		if (row.get("waveArmor")) descs.push(`每完成一個波次時，其所有角色每1%盾量${advRuleNumber(row.get("waveArmor"))}分`);
		if (row.get("waveDeathCount")) descs.push(`每完成一個波次時，其所有角色每死亡一次${advRuleNumber(row.get("waveDeathCount"))}分`);
		if (row.get("waveS1Count")) descs.push(`waveS1Count: ${row.get("waveS1Count")}`);
		if (row.get("waveS2Count")) descs.push(`waveS2Count: ${row.get("waveS2Count")}`);
		if (row.get("waveS4Count")) descs.push(`waveS4Count: ${row.get("waveS4Count")}`);
		advRuleOut += `
|-
! <h5 class="norm">${localizationString("ScoreMessage", (s) => s + "_title")(row.get("id"))}</h5>
| ${localizationString("ScoreMessage", (s) => s + "_text")(row.get("id")).replace(/\n/g, "<br/>")}`;
	}
	advRuleOut += `\n|}`;
	out.push(advRuleOut);

	const AdvChapters = ChaptersTable.filter(ch => ch.get("group") == "Adventure");
	for (let i = 0; i < AdvChapters.length; i++) {
		const row = AdvChapters[i];
		const chID = Number(row.get("id"));
		const quests = QuestsTable.filter(q => q.get("chapter") == chID && q.get("enable"));
		if (quests.length > 0) {
			let str = ``;
			if (chID < 20018) {
				switch (chID % 10) {
					case 1:
						str += `=== 星期一/月曜日 ===`;
						break;
					case 2:
						str += `=== 星期二/火曜日 ===`;
						break;
					case 3:
						str += `=== 星期三/水曜日 ===`;
						break;
					case 4:
						str += `=== 星期四/木曜日 ===`;
						break;
					case 5:
						str += `=== 星期五/金曜日 ===`;
						break;
					case 6:
						str += `=== 星期六/土曜日 ===`;
						break;
					case 7:
						str += `=== 星期日/日曜日 ===`;
						break;
					default:
						str += `=== ${chID} ===`;
						break;
				}
			}
			else {
				str += `=== ${chID} ===`;
			}
			str += `\n{|`;
			for (let j = 0; j < quests.length; j++) {
				const quest = quests[j];
				const { name: qname } = questMetadata(quest, row);
				str += `\n{{旅途|${localizationQuestSubtitle()(quest.get("subtitle"))}|${quest.get("recommendLevel")}|||${qname}}}\n| style="padding-left: 10px;" | [[#${localizationStringAuto()(quest.get("displayDropText"))}]]`;
			}
			str += `\n|}`;
			out.push(str);
		}
	}

	return out.join("\n\n");
}
