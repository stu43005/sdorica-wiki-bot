import { ImperiumData } from "../imperium-data";
import { rank } from "../localization";
import { ItemPayType } from "../model/enums/item-pay-type.enum";
import { ItemPayRef } from "../model/item-pay-ref";
import { ItemIconParams } from "../templates/item-icon";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { WikiTableCeil, WikiTableStruct, wikitable } from "../templates/wikitable";
import { wikiNextLine } from "../wiki-utils";

const RankUpItemRefsTable = ImperiumData.fromGamedata().getTable("RankUpItemRefs");
const RankUpItemsTable = ImperiumData.fromGamedata().getTable("RankUpItems");

export default function wikiResonance() {
	let out = `${wikiH1("共鳴")}\n\n${wikiH2(
		"共鳴所需道具數量"
	)}\n角色提升至共鳴階級或突破所需消耗的道具數量如下表：`;

	const table: WikiTableStruct = {
		attributes: `class="wikitable" style="text-align:center;"`,
		rows: [
			[
				`! rowspan="2" | 共鳴階級`,
				`! rowspan="2" style="background-color: #ffd700; color: #1e1e1e;" | 庫倫`,
				`! colspan="5" | 一般共鳴`,
				`! colspan="5" | 替代共鳴`,
			],
			[
				`! 淚`,
				`! 區域限定道具`,
				`! 共鳴魂能`,
				`! 魂能結晶`,
				`! 精煉魂能`,
				`! style="background-color: #00ffff; color: #1e1e1e;" | 起源魂石`,
				`! style="background-color: #00ffff; color: #1e1e1e;" | 精煉記憶石`,
				`! style="background-color: #00ffff; color: #1e1e1e;" | -`,
				`! style="background-color: #00ffff; color: #1e1e1e;" | -`,
				`! style="background-color: #00ffff; color: #1e1e1e;" | -`,
			],
		],
	};

	const ResonanceItems: Record<string, ItemPayRef> = {};
	for (let i = 0; i < RankUpItemRefsTable.length; i++) {
		const row = RankUpItemRefsTable.get(i);
		const category = row.get("category");
		const param1 = row.get("param1");
		if (category == "Common" || (category == "HeroID" && param1 == "21") /* 安潔莉亞 */) {
			const refId = row.get("refId");
			ResonanceItems[refId] = new ItemPayRef(
				row.get("payType"),
				row.get("payLinkId"),
				row.get("payAmount")
			);
		}
	}
	ResonanceItems["coin"] = new ItemPayRef(ItemPayType.Coin, "", 1);
	let SubRankUpItemCount: Record<string, number> = {};
	let SubRankUpExtCount: Record<string, number> = {};
	const ResonanceItemOptions: ItemIconParams = {
		height: 80,
		direction: "vertical",
		text: "",
	};
	for (let i = 0; i < RankUpItemsTable.length; i++) {
		const row = RankUpItemsTable.get(i);
		const category = row.get("category");
		const rank1 = row.get("param1");

		const items: { payRef: ItemPayRef; count: number; ref: string; type: "normal" | "ext" }[] =
			[
				{
					payRef: ResonanceItems[row.get("item4Ref")],
					count: row.get("item4Count"),
					ref: row.get("item4Ref"),
					type: "normal",
				},
				{
					payRef: ResonanceItems[row.get("item2Ref")],
					count: row.get("item2Count"),
					ref: row.get("item2Ref"),
					type: "normal",
				},
				{
					payRef: ResonanceItems[row.get("item1Ref")],
					count: row.get("item1Count"),
					ref: row.get("item1Ref"),
					type: "normal",
				},
				{
					payRef: ResonanceItems[row.get("item3Ref")],
					count: row.get("item3Count"),
					ref: row.get("item3Ref"),
					type: "normal",
				},
				{
					payRef: ResonanceItems[row.get("item5Ref")],
					count: row.get("item5Count"),
					ref: row.get("item5Ref"),
					type: "normal",
				},
				{
					payRef: ResonanceItems[row.get("ext1Ref")],
					count: row.get("ext1Count"),
					ref: row.get("ext1Ref"),
					type: "ext",
				},
				{
					payRef: ResonanceItems[row.get("ext2Ref")],
					count: row.get("ext2Count"),
					ref: row.get("ext2Ref"),
					type: "ext",
				},
				{
					payRef: ResonanceItems[row.get("ext3Ref")],
					count: row.get("ext3Count"),
					ref: row.get("ext3Ref"),
					type: "ext",
				},
				{
					payRef: ResonanceItems[row.get("ext4Ref")],
					count: row.get("ext4Count"),
					ref: row.get("ext4Ref"),
					type: "ext",
				},
				{
					payRef: ResonanceItems[row.get("ext5Ref")],
					count: row.get("ext5Count"),
					ref: row.get("ext5Ref"),
					type: "ext",
				},
			];

		/*
		Common,,CommonA,Item,251 (傑出戰士之淚),1
		Common,,CommonB,Item,252 (弒龍英雄之淚),1
		Common,,CommonC,Item,253 (上古巨龍之淚),1
		Common,,CommonD,Item,206 (精煉魂能),1
		Common,,CommonE,Item,504 (起源魂石),1
		Common,,CommonF,Item,207 (精煉記憶石),1
		HeroID,21 (安潔莉亞),CharItemA,Item,113 (安潔莉亞魂能結晶),1
		HeroID,21 (安潔莉亞),CharItemB,Item,236 (光明燭台),1
		HeroID,21 (安潔莉亞),CharItemC,Item,244 (神聖燭台),1
		HeroID,21 (安潔莉亞),CharItemD,Item,223 (白色一階魂能),1
		HeroID,21 (安潔莉亞),CharItemE,Item,224 (白色二階魂能),1
		HeroID,21 (安潔莉亞),CharItemF,Item,225 (白色三階魂能),1
		*/
		[
			// item
			["CommonA", "CommonB", "CommonC"],
			["CharItemB", "CharItemC"],
			["CharItemD", "CharItemE", "CharItemF"],
			["CharItemA"],
			["CommonD", "CommonF"],
			// ext
			["CommonE"],
			["CommonF"],
		].forEach((keys, keyIndex) => {
			const baseIndex = keyIndex < 5 ? 0 : 5;
			for (const key of keys) {
				for (
					let itemIndex = baseIndex;
					itemIndex < Math.min(baseIndex + 5, items.length);
					itemIndex++
				) {
					const item = items[itemIndex];
					if (item.ref === key) {
						if (keyIndex !== itemIndex) {
							[items[keyIndex], items[itemIndex]] = [
								items[itemIndex],
								items[keyIndex],
							];
							break;
						}
					}
				}
			}
		});

		const ceil: WikiTableCeil[] = [];
		switch (category) {
			case "Rank": {
				const currRankName = rank()(rank1);
				const privRankName = rank()(String(rank1 - 1));
				if (!currRankName || !privRankName) {
					continue;
				}
				ceil.push({
					header: true,
					text: wikiNextLine(`${privRankName}\n➡️\n${currRankName}`),
				});
				break;
			}
			case "SubRank":
				ceil.push({
					header: true,
					text: `+${rank1}`,
				});
				SubRankUpItemCount["coin"] ??= 0;
				SubRankUpItemCount["coin"] += row.get("coin");
				for (const item of items) {
					if (!item.payRef) continue;
					if (item.type === "normal") {
						SubRankUpItemCount[item.ref] ??= 0;
						SubRankUpItemCount[item.ref] += item.count;
					} else {
						SubRankUpExtCount[item.ref] ??= 0;
						SubRankUpExtCount[item.ref] += item.count;
					}
				}
				break;
			case "Sublimation":
				ceil.push({
					header: true,
					text: `[[轉化系統|轉化]]`,
				});
				items[5] = {
					payRef: ResonanceItems["CommonE"],
					count: 1,
					ref: "CommonE",
					type: "ext",
				};
				break;
			default:
				ceil.push({
					header: true,
					text: category,
				});
				break;
		}

		ceil.push(
			{
				attributes: `style="background-color: #ffd700; color: #1e1e1e;"`,
				text: ResonanceItems["coin"].toWiki({
					...ResonanceItemOptions,
					count: row.get("coin"),
				}),
			},
			...items.map(
				(item, index): WikiTableCeil => ({
					attributes:
						index >= 5 ? `style="background-color: #00ffff; color: #1e1e1e;"` : "",
					text:
						index === 4 && category === "Sublimation"
							? wikiNextLine(`➡️\n➡️\n➡️`)
							: item.payRef
							? item.payRef.toWiki({
									...ResonanceItemOptions,
									count: item.count,
							  })
							: "-",
				})
			)
		);
		table.rows.push(ceil);

		if (category == "SubRank" && rank1 == 15) {
			table.rows.push({
				headerBar: true,
				ceils: [
					wikiNextLine(`+1 ~ +15\n合計`),
					{
						attributes: `style="background-color: #ffd700; color: #1e1e1e;"`,
						text: ResonanceItems["coin"].toWiki({
							...ResonanceItemOptions,
							count: SubRankUpItemCount["coin"],
						}),
					},
					ResonanceItems["CommonB"].toWiki({
						...ResonanceItemOptions,
						count: SubRankUpItemCount["CommonB"],
					}),
					ResonanceItems["CharItemC"].toWiki({
						...ResonanceItemOptions,
						count: SubRankUpItemCount["CharItemC"],
					}),
					ResonanceItems["CharItemF"].toWiki({
						...ResonanceItemOptions,
						count: SubRankUpItemCount["CharItemF"],
					}),
					ResonanceItems["CharItemA"].toWiki({
						...ResonanceItemOptions,
						count: SubRankUpItemCount["CharItemA"],
					}),
					ResonanceItems["CommonD"].toWiki({
						...ResonanceItemOptions,
						count: SubRankUpItemCount["CommonD"],
					}),
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: ResonanceItems["CommonE"].toWiki({
							...ResonanceItemOptions,
							count: SubRankUpItemCount["CommonE"],
						}),
					},
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: "-",
					},
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: "-",
					},
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: "-",
					},
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: "-",
					},
				],
			});
			SubRankUpItemCount = {};
			SubRankUpExtCount = {};
		}
		if (category == "SubRank" && rank1 == 20) {
			table.rows.push({
				headerBar: true,
				ceils: [
					wikiNextLine(`+16 ~ +20\n合計`),
					{
						attributes: `style="background-color: #ffd700; color: #1e1e1e;"`,
						text: ResonanceItems["coin"].toWiki({
							...ResonanceItemOptions,
							count: SubRankUpItemCount["coin"],
						}),
					},
					ResonanceItems["CommonB"].toWiki({
						...ResonanceItemOptions,
						count: SubRankUpItemCount["CommonB"],
					}),
					ResonanceItems["CharItemC"].toWiki({
						...ResonanceItemOptions,
						count: SubRankUpItemCount["CharItemC"],
					}),
					ResonanceItems["CharItemF"].toWiki({
						...ResonanceItemOptions,
						count: SubRankUpItemCount["CharItemF"],
					}),
					ResonanceItems["CharItemA"].toWiki({
						...ResonanceItemOptions,
						count: SubRankUpItemCount["CharItemA"],
					}),
					ResonanceItems["CommonF"].toWiki({
						...ResonanceItemOptions,
						count: SubRankUpItemCount["CommonF"],
					}),
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: ResonanceItems["CommonE"].toWiki({
							...ResonanceItemOptions,
							count: SubRankUpItemCount["CommonE"],
						}),
					},
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: ResonanceItems["CommonF"].toWiki({
							...ResonanceItemOptions,
							count: SubRankUpItemCount["CommonF"],
						}),
					},
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: "-",
					},
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: "-",
					},
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: "-",
					},
				],
			});
		}
	}

	out += `\n${wikitable(
		table
	)}\n\n''註：本表以[[安潔莉亞]]共鳴道具為例，不同角色可能需要不同的道具。''`;
	return out;
}
