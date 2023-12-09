import numeral from "numeral";
import { ImperiumData } from "../imperium-data.js";
import {
	call2,
	gamedataString,
	localizationCharacterName,
	localizationItemName,
	localizationStringAuto,
} from "../localization.js";
import { Hero } from "../model/hero.js";
import { Item } from "../model/item.js";
import { arrayGroupBy, arraySum, arrayUnique, objectMap } from "../utils.js";

const GashaponsTable = ImperiumData.fromGamedata().getTable("Gashapons");

function gashaponItemCount2Rank(count: number) {
	switch (count) {
		case 50:
			return `三階`;
		case 20:
			return `二階`;
		case 5:
			return `一階`;
		case 2:
		case 1:
			return `零階`;
	}
	return `${count}`;
}

export default function wikiGashapons() {
	const out: string[] = [];
	const GashaponsGroup = arrayGroupBy(GashaponsTable.rows, (r) => r.get("packId"));
	const GashaponPositionKeys = ["金", "黑", "白"];
	for (const packId in GashaponsGroup) {
		if (GashaponsGroup.hasOwnProperty(packId)) {
			const entries = GashaponsGroup[packId];
			let str = `== ${call2(
				gamedataString("GashaponPacks", "id", "name"),
				localizationStringAuto(),
			)(packId)} ==
<blockquote>${call2(
				gamedataString("GashaponPacks", "id", "description"),
				localizationStringAuto(),
			)(packId).replace(/\n/g, "<br/>")}</blockquote>
{| class="wikitable" width=100%
|-
! width=20% | 階級
! width=60% colspan=2 | 角色
! width=20% | 個別機率
|-`;
			const tierGroup = arrayGroupBy(entries, (r) => r.get("itemCount"));
			const tierKeys = Object.keys(tierGroup)
				.map((s) => Number(s))
				.sort((a, b) => b - a);
			for (const tier of tierKeys) {
				const probabilityGroup = objectMap(
					arrayGroupBy(tierGroup[tier], (r) => String(r.get("weight"))),
					(key, value) =>
						arrayGroupBy(
							value
								.map((r) => {
									const itemId: string = r.get("itemId");
									const heroId = Item.get(itemId)?.effectValue;
									if (heroId) {
										return Hero.get(heroId.toString());
									}
									return;
								})
								.filter((r): r is Hero => !!r),
							(r) => r.slot,
						),
				);
				str += `\n| align="center" rowspan=${
					arraySum(
						Object.values(probabilityGroup).map((v) => Object.values(v).length),
						(v) => v,
					) + 1
				} | {{階級圖標|${gashaponItemCount2Rank(tier)}|100px}}<br>${gashaponItemCount2Rank(
					tier,
				)}`;
				let weightSum = 0;
				const weightKeys = Object.keys(probabilityGroup)
					.map((s) => Number(s))
					.sort((a, b) => b - a);
				for (const weight of weightKeys) {
					if (probabilityGroup.hasOwnProperty(weight)) {
						const positions = Object.keys(probabilityGroup[weight]).sort(
							(a, b) =>
								GashaponPositionKeys.indexOf(a) - GashaponPositionKeys.indexOf(b),
						);
						for (const position of positions) {
							if (probabilityGroup[weight].hasOwnProperty(position)) {
								const heroes = probabilityGroup[weight][position].sort(
									(a, b) => Number(a.id) - Number(b.id),
								);
								weightSum += heroes.length * Number(weight);
								str += `
| align="center" width=8% | [[檔案:${position}位 Icons.png|30px]]
| width=52% | ${heroes
									.map((hero) => localizationCharacterName()(hero.model))
									.map((str) => `[[${str}]]`)
									.join("、")}
| align="center" | {{Color|#0000ff|${numeral(Number(weight) / 10000).format("0.000")}%}}
|-`;
							}
						}
					}
				}
				str += `\n! colspan=3 | ${gashaponItemCount2Rank(
					tier,
				)}總機率：{{Color|#0000ff|${numeral(Number(weightSum) / 10000).format(
					"0.0",
				)}%}}\n|-`;
			}
			str += `\n|}`;
			out.push(str);
		}
	}

	return out.join("\n\n");
}

export function wikiGashaponsJson() {
	const EnabledGashaponIds = arrayUnique(GashaponsTable.rows.map((r) => r.get("packId")));
	const out: Record<string, { weight: number; id: string }[]> = {};
	for (let i = 0; i < EnabledGashaponIds.length; i++) {
		const gashaponId = EnabledGashaponIds[i];
		let gashaponName = call2(
			gamedataString("GashaponPacks", "id", "name"),
			localizationStringAuto(),
		)(gashaponId);
		gashaponName = String(gashaponName).replace(/\s/g, "");
		const dropTable = GashaponsTable.filter((r) => r.get("packId") == gashaponId);
		out[gashaponName] = dropTable.map((r) => {
			const itemId: string = r.get("itemId");
			let name = localizationItemName()(itemId);
			const heroId = Item.get(itemId)?.effectValue;
			if (heroId) {
				name = Hero.get(heroId.toString())?.firstname ?? name;
			}
			return {
				weight: r.get("weight"),
				id: `${name}:${gashaponItemCount2Rank(r.get("itemCount"))}`,
			};
		});
	}
	return out;
}
