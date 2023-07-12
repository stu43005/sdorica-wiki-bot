import { ImperiumData } from "../imperium-data";
import { localizationString } from "../localization";
import { Chapter } from "../model/chapter";
import { ChapterGroup } from "../model/enums/chapter-group.enum";
import { TemplateString } from "../model/template-string";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader";
import { wikiSectionLink } from "../templates/wikilink";
import { wikitable, WikiTableStruct } from "../templates/wikitable";
import { wikiNextLine } from "../wiki-utils";

const ScoreRulesTable = ImperiumData.fromGamedata().getTable("ScoreRules");

function advRuleNumber(v: number) {
	return v < 0 ? `扣${v * -1}` : `獲得${v}`;
}

export default function wikiAdventure() {
	let out = wikiH1("幻境試煉");

	out += `\n\n${wikiH2("計分機制")}`;
	const rulesTable: WikiTableStruct = [["! 機制", "! 詳細內容", "! 詳細計分方式"]];
	for (const row of ScoreRulesTable.rows) {
		const descs: string[] = [];
		if (row.get("finalArmor")) descs.push(`finalArmor: ${row.get("finalArmor")}`);
		if (row.get("finalDeathCount"))
			descs.push(`finalDeathCount: ${row.get("finalDeathCount")}`);
		if (row.get("finalHp")) descs.push(`finalHp: ${row.get("finalHp")}`);
		if (row.get("finalS1Count")) descs.push(`finalS1Count: ${row.get("finalS1Count")}`);
		if (row.get("finalS2Count")) descs.push(`finalS2Count: ${row.get("finalS2Count")}`);
		if (row.get("finalS4Count")) descs.push(`finalS4Count: ${row.get("finalS4Count")}`);
		if (row.get("levelScore")) descs.push(`levelScore: ${row.get("levelScore")}`);
		// if (row.get("totalDamageScore")) descs.push(`totalDamageScore: ${numeral(+row.get("totalDamageScore")).format("0,0")}`);
		if (row.get("turn")) {
			// 每經過1回合扣{[score]}分
			const score = row.get("turn") * -1;
			descs.push(
				new TemplateString(localizationString("ScoreMessage")("turnRule_info")).apply({
					score,
				})
			);
		}
		if (row.get("turnBuffer")) {
			// 超過{[turnBegin]}回合後，每經過1回合扣{[score]}分，第{[turnEnd]}回合後停止扣分
			const [score, turnBegin, turnEnd] = `${row.get("turnBuffer")}`.split(";");
			descs.push(
				new TemplateString(localizationString("ScoreMessage")("turnBufferRule_info")).apply(
					{
						score: +score * -1,
						turnBegin,
						turnEnd,
					}
				)
			);
		}
		if (row.get("wave")) {
			// 通過本波次獲得分數。
			descs.push(`每完成一個波次${advRuleNumber(row.get("wave"))}分`);
		}
		if (row.get("waveArmor")) {
			// 戰鬥結束時，計算我方角色盾量百分比，每1%獲得{[score]}分。
			const score = +row.get("waveArmor");
			descs.push(
				new TemplateString(localizationString("ScoreMessage")("armorRule_info")).apply({
					score,
				})
			);
		}
		if (row.get("waveArmorGain")) {
			// 計算本場戰鬥中我方角色技能的疊盾量，每{[score]}疊盾量獲得1分，最多{[limit]}分。
			const [pre, limit] = `${row.get("waveArmorGain")}`.split(";");
			descs.push(
				new TemplateString(localizationString("ScoreMessage")("gainArmorRule_info")).apply({
					score: 1000 / +pre,
					limit,
				})
			);
		}
		if (row.get("waveDeathCount")) {
			// 計算本場戰鬥中我方角色死亡次數，每次我方角色死亡扣{[score]}分。
			const score = row.get("waveDeathCount") * -1;
			descs.push(
				new TemplateString(localizationString("ScoreMessage")("deathRule_info")).apply({
					score,
				})
			);
		}
		if (row.get("waveHealGain")) {
			// 計算本場戰鬥中我方角色技能的治癒量，每{[score]}治癒量獲得1分，最多{[limit]}分。
			const [pre, limit] = `${row.get("waveHealGain")}`.split(";");
			descs.push(
				new TemplateString(localizationString("ScoreMessage")("healRule_info")).apply({
					score: 1000 / +pre,
					limit,
				})
			);
		}
		if (row.get("waveHp")) {
			// 戰鬥結束時，計算我方角色血量百分比，每1%獲得{[score]}分。
			const score = +row.get("waveHp");
			descs.push(
				new TemplateString(localizationString("ScoreMessage")("hpRule_info")).apply({
					score,
				})
			);
		}
		if (row.get("waveKillCount")) {
			// 計算本場戰鬥中敵方角色死亡次數，每次敵方角色死亡獲得{[score]}分，最多{[limit]}分。
			const [score, limit] = `${row.get("waveKillCount")}`.split(";");
			descs.push(
				new TemplateString(localizationString("ScoreMessage")("killRule_info")).apply({
					score,
					limit,
				})
			);
		}
		if (row.get("waveMaxSkillSetDamage")) {
			// 計算本場戰鬥中我方角色技能造成的最大傷害，每{[score]}傷害獲得1分，最多{[limit]}分。
			const [pre, limit] = `${row.get("waveMaxSkillSetDamage")}`.split(";");
			descs.push(
				new TemplateString(localizationString("ScoreMessage")("maxDamageRule_info")).apply({
					score: 1000 / +pre,
					limit,
				})
			);
		}
		if (row.get("waveS1Count")) {
			// 消除一個魂芯施展技能獲得{[score]}分。
			const score = +row.get("waveS1Count");
			descs.push(
				new TemplateString(localizationString("ScoreMessage")("s1Rule_info")).apply({
					score,
				})
			);
		}
		if (row.get("waveS2Count")) {
			// 消除兩個魂芯施展技能獲得{[score]}分。
			const score = +row.get("waveS2Count");
			descs.push(
				new TemplateString(localizationString("ScoreMessage")("s2Rule_info")).apply({
					score,
				})
			);
		}
		if (row.get("waveS4Count")) {
			// 消除四個魂芯施展技能獲得{[score]}分。
			const score = +row.get("waveS4Count");
			descs.push(
				new TemplateString(localizationString("ScoreMessage")("s4Rule_info")).apply({
					score,
				})
			);
		}
		if (row.get("waveTotalSkillSetDamage")) {
			// 計算本場戰鬥中我方角色技能造成的傷害，每{[score]}傷害獲得1分，最多{[limit]}分。
			const [pre, limit] = `${row.get("waveTotalSkillSetDamage")}`.split(";");
			descs.push(
				new TemplateString(
					localizationString("ScoreMessage")("totalDamageRule_info")
				).apply({
					score: 1000 / +pre,
					limit,
				})
			);
		}
		const id = row.get("id");
		const title = localizationString("ScoreMessage", (s) => s + "_title")(id);
		const text = localizationString("ScoreMessage", (s) => s + "_text")(id);
		rulesTable.push([
			{
				header: true,
				text: wikiH3(title || id, id, true),
			},
			wikiNextLine(text),
			wikiNextLine(descs.join("\n")),
		]);
	}
	out += `\n\n${wikitable(rulesTable)}`;

	const chapters = Chapter.getByGroup(ChapterGroup.Adventure);
	for (const chapter of chapters) {
		const idNumber = +chapter.id;
		const quests = chapter.quests.filter((quest) => quest.enable);
		if (quests.length > 0) {
			if (idNumber < 20018) {
				switch (idNumber % 10) {
					case 1:
						out += `\n\n${wikiH2("星期一/月曜日", chapter.id)}`;
						break;
					case 2:
						out += `\n\n${wikiH2("星期二/火曜日", chapter.id)}`;
						break;
					case 3:
						out += `\n\n${wikiH2("星期三/水曜日", chapter.id)}`;
						break;
					case 4:
						out += `\n\n${wikiH2("星期四/木曜日", chapter.id)}`;
						break;
					case 5:
						out += `\n\n${wikiH2("星期五/金曜日", chapter.id)}`;
						break;
					case 6:
						out += `\n\n${wikiH2("星期六/土曜日", chapter.id)}`;
						break;
					case 7:
						out += `\n\n${wikiH2("星期日/日曜日", chapter.id)}`;
						break;
					default:
						out += `\n\n${wikiH2(chapter.id)}`;
						break;
				}
			} else {
				out += `\n\n${wikiH2(chapter.id)}`;
			}

			const table: WikiTableStruct = [
				["! 類型", "! 等級", "! 關卡名稱", "! 關卡計分制", "! 模式"],
			];
			for (let j = 0; j < quests.length; j++) {
				const quest = quests[j];
				const rule = quest.drop.displayDropText.split("/").at(-1) || "";
				table.push([
					quest.subtitle,
					quest.recommendLevel,
					quest.title,
					{
						attributes: `style="padding-left: 10px;"`,
						text: wikiSectionLink(quest.extraSetting?.scoreRule ?? rule, rule),
					},
					quest.extraSetting?.questMode.map((mode) => mode.toString()).join("、") ?? "",
				]);
			}
			out += `\n\n${wikitable(table)}`;
		}
	}

	return out;
}
