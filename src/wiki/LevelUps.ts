import numeral from "numeral";
import { ImperiumData } from "../imperium-data.js";
import { wikiH1, wikiH2 } from "../templates/wikiheader.js";
import { wikitable, WikiTableStruct } from "../templates/wikitable.js";

const LevelUpsTable = ImperiumData.fromGamedata().getTable("LevelUps");

export default function wikiLevelUps() {
	let out = wikiH1("等級");

	const expKeys = ["exp", "heroexp", "homeexp", "monsterexp"];
	for (const key of expKeys) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable" style="text-align:center; font-family: Consolas, Monaco, monospace;"`,
			rows: [
				[
					`! style="min-width: 80px;" | 等級`,
					`! style="min-width: 80px;" | 魂能`,
					`! style="min-width: 80px;" | 累加魂能`,
				],
			],
		};
		for (let i = 0; i < LevelUpsTable.length; i++) {
			const level = LevelUpsTable.get(i);
			if (i + 1 < LevelUpsTable.length) {
				const nextLevel = LevelUpsTable.get(i + 1);
				if (nextLevel.get(key) != -1) {
					const diff = nextLevel.get(key) - level.get(key);
					if (diff > 0) {
						table.rows.push([
							level.get("level"),
							numeral(diff).format("0,0"),
							numeral(nextLevel.get(key)).format("0,0"),
						]);
						continue;
					}
				}
			}
			table.rows.push([
				level.get("level"),
				{
					attributes: `colspan=2`,
					text: `-封頂-`,
				},
			]);
			break;
		}
		out += `\n\n${wikiH2(key)}\n${wikitable(table)}`;
	}

	const levelKeys = ["level", "rank", "subrank"];
	for (const key of levelKeys) {
		const table: WikiTableStruct = {
			attributes: `class="wikitable" style="text-align:center; font-family: Consolas, Monaco, monospace;"`,
			rows: [
				[
					`! style="min-width: 80px;" | 等級`,
					`! style="min-width: 80px;" | HP`,
					`! style="min-width: 80px;" | ATK`,
				],
			],
		};
		let privHp = 0;
		let privAtk = 0;
		for (let i = 0; i < LevelUpsTable.length; i++) {
			const row = LevelUpsTable.get(i);
			const level = row.get("level");
			const hp = row.get(`${key}Hp`);
			const atk = row.get(`${key}Atk`);
			if (hp === -1) {
				break;
			}
			table.rows.push([
				level,
				`${hp}${privHp == 0 ? "" : ` (x ${numeral(hp / privHp).format("0.[000]")})`}`,
				`${atk}${privAtk == 0 ? "" : ` (x ${numeral(atk / privAtk).format("0.[000]")})`}`,
			]);
			privHp = hp;
			privAtk = atk;
		}
		out += `\n\n${wikiH2(key)}\n${wikitable(table)}`;
	}

	return out;
}

export function wikiLevelUpsJson() {
	const out: Record<string, number[]> = {};
	for (const column of LevelUpsTable.colname) {
		out[column] = [];
		for (const row of LevelUpsTable) {
			const value = row.get(column);
			if (value >= 0) {
				out[column].push(value);
			}
		}
	}
	return out;
}
