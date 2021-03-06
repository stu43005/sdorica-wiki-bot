import { ImperiumData } from "../imperium-data";
import { localizationString } from "../localization";
import { arrayUnique } from "../utils";
import { item2wikiWithType } from "../wiki-item";

const SignInRewardTable = ImperiumData.fromGamedata().getTable("SignInReward");

export default function wikiSignInReward() {
	const SignInRewardGroupIds = arrayUnique(SignInRewardTable.rows.map(r => r.get("groupId")));
	const out: string[] = [
		`[[檔案:2.4_版本前瞻_每日簽到.png|link=【2020.02.19】世界變動記錄/版本前瞻與後續規劃]]`,
		`==簽到規則==`,
		`<pre>${localizationString("Metagame")("signInCardDescription") || `◆ 每日5:00刷新簽到格，簽到表會在第28日結束後更換
◆ 未簽到格可使用透晶石進行補簽，每日可補簽1次
◆ 簽到表更換後，每周獎勵、全勤獎勵的進度將被重置
◆ 每一次簽到或補簽，都能使寶箱升一等，直到等級上限為止
◆ 寶箱等級只會在購買後重置，不受簽到表更換影響`}</pre>`];

	for (let i = 0; i < SignInRewardGroupIds.length; i++) {
		const groupId = SignInRewardGroupIds[i];
		const day = SignInRewardTable.filter(r => r.get("groupId") == groupId && r.get("category") == "day").sort((a, b) => a.get("param1") - b.get("param1"));
		const week = SignInRewardTable.filter(r => r.get("groupId") == groupId && r.get("category") == "week").sort((a, b) => a.get("param1") - b.get("param1"));
		const month = SignInRewardTable.filter(r => r.get("groupId") == groupId && r.get("category") == "month").sort((a, b) => a.get("param1") - b.get("param1"));
		let str = `== Group ${groupId} ==
{| class="wikitable" style="text-align: center;"`;
		for (let i = 0, weekIndex = 0; i < day.length; i += 7, weekIndex++) {
			const weekRow = week[weekIndex];
			str += `\n|-\n! - !! ${i + 1} !! ${i + 2} !! ${i + 3} !! ${i + 4} !! ${i + 5} !! ${i + 6} !! ${i + 7}`;
			str += `\n! 第 ${weekRow.get("param1")} ~ ${weekRow.get("param2")} 天`;
			str += `\n|-\n! 第 ${Math.floor(i / 7) + 1} 週`;
			for (let j = 0; j < 7; j++) {
				str += `\n| `;
				if (day[i + j]) {
					str += `${item2wikiWithType(day[i + j].get("giveType"), day[i + j].get("giveLinkId"), day[i + j].get("giveAmount"), {
						direction: "vertical"
					})}`;
				}
			}
			str += `\n| ${item2wikiWithType(weekRow.get("giveType"), weekRow.get("giveLinkId"), weekRow.get("giveAmount"), {
				direction: "vertical"
			})}`;
		}
		str += `\n|}
=== month ===
{| class="wikitable"`;
		for (let i = 0; i < month.length; i++) {
			const row = month[i];
			str += `\n|-
! 第 ${row.get("param1")} ~ ${row.get("param2")} 天
| ${item2wikiWithType(row.get("giveType"), row.get("giveLinkId"), row.get("giveAmount"))}`;
		}
		str += `\n|}`;
		out.push(str);
	}

	return out.join("\n\n");
}
