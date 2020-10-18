import numeral from "numeral";
import { ImperiumData } from "../imperium-data";

const LevelUpsTable = ImperiumData.fromGamedata().getTable("LevelUps");

export default function wikiLevelUps() {
	const out: string[] = [];

	const LevelUpKeys = ["exp", "heroexp", "homeexp", "monsterexp"];
	for (const key of LevelUpKeys) {
		let str = `== ${key} ==
{| class="wikitable" style="text-align:center; font-family: Consolas, Monaco, monospace;"
|-
! width=70px | 等級
! width=80px | 魂能
! width=80px | 累加魂能`;
		for (let i = 0; i < LevelUpsTable.length; i++) {
			const level = LevelUpsTable.get(i);
			if (i + 1 < LevelUpsTable.length) {
				const nextLevel = LevelUpsTable.get(i + 1);
				str += `\n|-\n| ${level.get("level")} || ${numeral(nextLevel.get(key) - level.get(key)).format("0,0")} || ${numeral(nextLevel.get(key)).format("0,0")}`;
			}
			else {
				str += `\n|-\n| ${level.get("level")}\n| colspan=2 | -封頂-`;
			}
		}
		str += `\n|}`;
		out.push(str);
	}

	const LevelUpKeys2 = ['level', 'rank', 'subrank'];
	for (const key of LevelUpKeys2) {
		let str = `== ${key} ==
{| class="wikitable" style="text-align:center; font-family: Consolas, Monaco, monospace;"
|-
! width=70px | 等級
! width=80px | HP
! width=80px | ATK`;
		for (let i = 0; i < LevelUpsTable.length; i++) {
			const row = LevelUpsTable.get(i);
			const level = row.get("level");
			const hp = row.get(`${key}Hp`);
			const atk = row.get(`${key}Atk`);
			if (hp === -1) {
				break;
			}
			str += `\n|-\n| ${level} || ${hp} || ${atk}`;
		}
		str += `\n|}`;
		out.push(str);
	}

	return out.join("\n\n");
}
