import { ImperiumData } from "../imperium-data";
import { localizationQuestSubtitle, localizationString, localizationStringAuto } from "../localization";
import { questMetadata } from "../wiki-quest";
import { TemplateString } from './../model/template-string';

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
! 詳細內容
! 詳細計分方式`;
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
		// if (row.get("totalDamageScore")) descs.push(`totalDamageScore: ${numeral(+row.get("totalDamageScore")).format("0,0")}`);
		if (row.get("turn")) {
			// 每經過1回合扣{[score]}分
			const score = row.get("turn") * -1;
			descs.push(new TemplateString(localizationString("ScoreMessage")("turnRule_info")).apply({
				score,
			}));
		}
		if (row.get("turnBuffer")) {
			// 超過{[turnBegin]}回合後，每經過1回合扣{[score]}分，第{[turnEnd]}回合後停止扣分
			const [score, turnBegin, turnEnd] = `${row.get("turnBuffer")}`.split(";");
			descs.push(new TemplateString(localizationString("ScoreMessage")("turnBufferRule_info")).apply({
				score: +score * -1, turnBegin, turnEnd,
			}));
		}
		if (row.get("wave")) {
			// 通過本波次獲得分數。
			descs.push(`每完成一個波次${advRuleNumber(row.get("wave"))}分`);
		}
		if (row.get("waveArmor")) {
			// 戰鬥結束時，計算我方角色盾量百分比，每1%獲得{[score]}分。
			const score = +row.get("waveArmor");
			descs.push(new TemplateString(localizationString("ScoreMessage")("armorRule_info")).apply({
				score,
			}));
		}
		if (row.get("waveArmorGain")) {
			// 計算本場戰鬥中我方角色技能的疊盾量，每{[score]}疊盾量獲得1分，最多{[limit]}分。
			const [score, limit] = `${row.get("waveArmorGain")}`.split(";");
			descs.push(new TemplateString(localizationString("ScoreMessage")("gainArmorRule_info")).apply({
				score, limit,
			}));
		}
		if (row.get("waveDeathCount")) {
			// 計算本場戰鬥中我方角色死亡次數，每次我方角色死亡扣{[score]}分。
			const score = row.get("waveDeathCount") * -1;
			descs.push(new TemplateString(localizationString("ScoreMessage")("deathRule_info")).apply({
				score,
			}));
		}
		if (row.get("waveHealGain")) {
			// 計算本場戰鬥中我方角色技能的治癒量，每{[score]}治癒量獲得1分，最多{[limit]}分。
			const [score, limit] = `${row.get("waveHealGain")}`.split(";");
			descs.push(new TemplateString(localizationString("ScoreMessage")("healRule_info")).apply({
				score, limit,
			}));
		}
		if (row.get("waveHp")) {
			// 戰鬥結束時，計算我方角色血量百分比，每1%獲得{[score]}分。
			const score = +row.get("waveHp");
			descs.push(new TemplateString(localizationString("ScoreMessage")("hpRule_info")).apply({
				score,
			}));
		}
		if (row.get("waveKillCount")) {
			// 計算本場戰鬥中敵方角色死亡次數，每次敵方角色死亡獲得{[score]}分，最多{[limit]}分。
			const [score, limit] = `${row.get("waveKillCount")}`.split(";");
			descs.push(new TemplateString(localizationString("ScoreMessage")("killRule_info")).apply({
				score, limit,
			}));
		}
		if (row.get("waveMaxSkillSetDamage")) {
			// 計算本場戰鬥中我方角色技能造成的最大傷害，每{[score]}傷害獲得1分，最多{[limit]}分。
			const [score, limit] = `${row.get("waveMaxSkillSetDamage")}`.split(";");
			descs.push(new TemplateString(localizationString("ScoreMessage")("maxDamageRule_info")).apply({
				score, limit,
			}));
		}
		if (row.get("waveS1Count")) {
			// 消除一個魂芯施展技能獲得{[score]}分。
			const score = +row.get("waveS1Count");
			descs.push(new TemplateString(localizationString("ScoreMessage")("s1Rule_info")).apply({
				score,
			}));
		}
		if (row.get("waveS2Count")) {
			// 消除兩個魂芯施展技能獲得{[score]}分。
			const score = +row.get("waveS2Count");
			descs.push(new TemplateString(localizationString("ScoreMessage")("s2Rule_info")).apply({
				score,
			}));
		}
		if (row.get("waveS4Count")) {
			// 消除四個魂芯施展技能獲得{[score]}分。
			const score = +row.get("waveS4Count");
			descs.push(new TemplateString(localizationString("ScoreMessage")("s4Rule_info")).apply({
				score,
			}));
		}
		if (row.get("waveTotalSkillSetDamage")) {
			// 計算本場戰鬥中我方角色技能造成的傷害，每{[score]}傷害獲得1分，最多{[limit]}分。
			const [score, limit] = `${row.get("waveTotalSkillSetDamage")}`.split(";");
			descs.push(new TemplateString(localizationString("ScoreMessage")("totalDamageRule_info")).apply({
				score, limit,
			}));
		}
		advRuleOut += `
|-
! <h5 class="norm">${localizationString("ScoreMessage", (s) => s + "_title")(row.get("id")) || row.get("id")}</h5>
| ${localizationString("ScoreMessage", (s) => s + "_text")(row.get("id")).replace(/\n/g, "<br/>")}
| ${descs.join("<br/>\n")}`;
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
				str += `\n{{旅途|${localizationQuestSubtitle()(quest.get("subtitle"))}|${quest.get("recommendLevel")}|||${qname}}}\n| style="padding-left: 10px;" | [[#${localizationStringAuto()(quest.get("displayDropText")) || `${quest.get("displayDropText")}`.split("/").at(-1)}]]`;
			}
			str += `\n|}`;
			out.push(str);
		}
	}

	return out.join("\n\n");
}
