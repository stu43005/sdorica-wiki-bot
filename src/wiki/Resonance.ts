import { ImperiumData, RowWrapper } from "../imperium-data";
import { rank } from "../localization";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import {
	wikitable,
	WikiTableCeil,
	WikiTableStruct,
} from "../templates/wikitable";
import { item2wiki, Item2WikiOptions, item2wikiWithType } from "../wiki-item";
import { wikiNextLine } from "../wiki-utils";

const RankUpItemRefsTable =
	ImperiumData.fromGamedata().getTable("RankUpItemRefs");
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
				`! rowspan="2" style="background-color: #ffd700; color: #1e1e1e;" | [[庫倫]]`,
				`! colspan="5" | 一般共鳴`,
				`! colspan="5" | 替代共鳴`,
			],
			[
				`! 淚`,
				`! 區域限定道具`,
				`! 共鳴魂能`,
				`! [[魂能結晶]]`,
				`! [[精煉魂能]]`,
				`! style="background-color: #00ffff; color: #1e1e1e;" | [[起源魂石]]`,
				`! style="background-color: #00ffff; color: #1e1e1e;" | [[精煉記憶石]]`,
				`! style="background-color: #00ffff; color: #1e1e1e;" | -`,
				`! style="background-color: #00ffff; color: #1e1e1e;" | -`,
				`! style="background-color: #00ffff; color: #1e1e1e;" | -`,
			],
		],
	};

	const ResonanceItems: Record<string, RowWrapper> = {};
	for (let i = 0; i < RankUpItemRefsTable.length; i++) {
		const row = RankUpItemRefsTable.get(i);
		const category = row.get("category");
		const param1 = row.get("param1");
		if (
			category == "Common" ||
			(category == "HeroID" && param1 == "21") /* 安潔莉亞 */
		) {
			const refId = row.get("refId");
			ResonanceItems[refId] = row;
			// payType,payLinkId,payAmount
		}
	}
	let SubRankUpItemCount: Record<string, number> = {};
	let SubRankUpExtCount: Record<string, number> = {};
	const ResonanceItemOptions: Item2WikiOptions = {
		size: "x80px",
		direction: "vertical",
		text: "",
	};
	for (let i = 0; i < RankUpItemsTable.length; i++) {
		const row = RankUpItemsTable.get(i);
		const category = row.get("category");
		const rank1 = row.get("param1");

		const item1 = ResonanceItems[row.get("item1Ref")];
		const item2 = ResonanceItems[row.get("item2Ref")];
		const item3 = ResonanceItems[row.get("item3Ref")];
		const item4 = ResonanceItems[row.get("item4Ref")];
		const item5 = ResonanceItems[row.get("item5Ref")];
		const ext1 = ResonanceItems[row.get("ext1Ref")];
		const ext2 = ResonanceItems[row.get("ext2Ref")];
		const ext3 = ResonanceItems[row.get("ext3Ref")];
		const ext4 = ResonanceItems[row.get("ext4Ref")];
		const ext5 = ResonanceItems[row.get("ext5Ref")];

		const items: [RowWrapper, number, string][] = [
			[item4, row.get("item4Count"), row.get("item4Ref")],
			[item2, row.get("item2Count"), row.get("item2Ref")],
			[item1, row.get("item1Count"), row.get("item1Ref")],
			[item3, row.get("item3Count"), row.get("item3Ref")],
			[item5, row.get("item5Count"), row.get("item5Ref")],
			[ext1, row.get("ext1Count"), row.get("ext1Ref")],
			[ext2, row.get("ext2Count"), row.get("ext2Ref")],
			[ext3, row.get("ext3Count"), row.get("ext3Ref")],
			[ext4, row.get("ext4Count"), row.get("ext4Ref")],
			[ext5, row.get("ext5Count"), row.get("ext5Ref")],
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
					if (item[2] === key) {
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
				SubRankUpItemCount["1002"] =
					(SubRankUpItemCount["1002"] || 0) + row.get("coin");
				if (item1)
					SubRankUpItemCount[item1.get("payLinkId")] =
						(SubRankUpItemCount[item1.get("payLinkId")] || 0) +
						row.get("item1Count");
				if (item2)
					SubRankUpItemCount[item2.get("payLinkId")] =
						(SubRankUpItemCount[item2.get("payLinkId")] || 0) +
						row.get("item2Count");
				if (item3)
					SubRankUpItemCount[item3.get("payLinkId")] =
						(SubRankUpItemCount[item3.get("payLinkId")] || 0) +
						row.get("item3Count");
				if (item4)
					SubRankUpItemCount[item4.get("payLinkId")] =
						(SubRankUpItemCount[item4.get("payLinkId")] || 0) +
						row.get("item4Count");
				if (item5)
					SubRankUpItemCount[item5.get("payLinkId")] =
						(SubRankUpItemCount[item5.get("payLinkId")] || 0) +
						row.get("item5Count");
				if (ext1)
					SubRankUpExtCount[ext1.get("payLinkId")] =
						(SubRankUpExtCount[ext1.get("payLinkId")] || 0) +
						row.get("ext1Count");
				if (ext2)
					SubRankUpExtCount[ext2.get("payLinkId")] =
						(SubRankUpExtCount[ext2.get("payLinkId")] || 0) +
						row.get("ext2Count");
				if (ext3)
					SubRankUpExtCount[ext3.get("payLinkId")] =
						(SubRankUpExtCount[ext3.get("payLinkId")] || 0) +
						row.get("ext3Count");
				if (ext4)
					SubRankUpExtCount[ext4.get("payLinkId")] =
						(SubRankUpExtCount[ext4.get("payLinkId")] || 0) +
						row.get("ext4Count");
				if (ext5)
					SubRankUpExtCount[ext5.get("payLinkId")] =
						(SubRankUpExtCount[ext5.get("payLinkId")] || 0) +
						row.get("ext5Count");
				break;
			case "Sublimation":
				ceil.push({
					header: true,
					text: `[[轉化系統|轉化]]`,
				});
				items[5] = [ResonanceItems["CommonE"], 1, "CommonE"];
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
				text: item2wiki(
					"1002",
					row.get("coin"),
					false,
					ResonanceItemOptions
				),
			},
			...items.map(
				(item, index): WikiTableCeil => ({
					attributes:
						index >= 5
							? `style="background-color: #00ffff; color: #1e1e1e;"`
							: "",
					text:
						index === 4 && category === "Sublimation"
							? wikiNextLine(`➡️\n➡️\n➡️`)
							: item?.[0]
							? item2wikiWithType(
									item[0].get("payType"),
									item[0].get("payLinkId"),
									item[1],
									ResonanceItemOptions
							  )
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
						text: item2wiki(
							"1002",
							SubRankUpItemCount["1002"],
							false,
							ResonanceItemOptions
						),
					},
					item2wiki(
						ResonanceItems["CommonB"].get("payLinkId"),
						SubRankUpItemCount[
							ResonanceItems["CommonB"].get("payLinkId")
						],
						false,
						ResonanceItemOptions
					),
					item2wiki(
						ResonanceItems["CharItemC"].get("payLinkId"),
						SubRankUpItemCount[
							ResonanceItems["CharItemC"].get("payLinkId")
						],
						false,
						ResonanceItemOptions
					),
					item2wiki(
						ResonanceItems["CharItemF"].get("payLinkId"),
						SubRankUpItemCount[
							ResonanceItems["CharItemF"].get("payLinkId")
						],
						false,
						ResonanceItemOptions
					),
					item2wiki(
						ResonanceItems["CharItemA"].get("payLinkId"),
						SubRankUpItemCount[
							ResonanceItems["CharItemA"].get("payLinkId")
						],
						false,
						ResonanceItemOptions
					),
					item2wiki(
						ResonanceItems["CommonD"].get("payLinkId"),
						SubRankUpItemCount[
							ResonanceItems["CommonD"].get("payLinkId")
						],
						false,
						ResonanceItemOptions
					),
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: item2wiki(
							ResonanceItems["CommonE"].get("payLinkId"),
							SubRankUpExtCount[
								ResonanceItems["CommonE"].get("payLinkId")
							],
							false,
							ResonanceItemOptions
						),
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
						text: item2wiki(
							"1002",
							SubRankUpItemCount["1002"],
							false,
							ResonanceItemOptions
						),
					},
					item2wiki(
						ResonanceItems["CommonB"].get("payLinkId"),
						SubRankUpItemCount[
							ResonanceItems["CommonB"].get("payLinkId")
						],
						false,
						ResonanceItemOptions
					),
					item2wiki(
						ResonanceItems["CharItemC"].get("payLinkId"),
						SubRankUpItemCount[
							ResonanceItems["CharItemC"].get("payLinkId")
						],
						false,
						ResonanceItemOptions
					),
					item2wiki(
						ResonanceItems["CharItemF"].get("payLinkId"),
						SubRankUpItemCount[
							ResonanceItems["CharItemF"].get("payLinkId")
						],
						false,
						ResonanceItemOptions
					),
					item2wiki(
						ResonanceItems["CharItemA"].get("payLinkId"),
						SubRankUpItemCount[
							ResonanceItems["CharItemA"].get("payLinkId")
						],
						false,
						ResonanceItemOptions
					),
					item2wiki(
						ResonanceItems["CommonF"].get("payLinkId"),
						SubRankUpItemCount[
							ResonanceItems["CommonF"].get("payLinkId")
						],
						false,
						ResonanceItemOptions
					),
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: item2wiki(
							ResonanceItems["CommonE"].get("payLinkId"),
							SubRankUpExtCount[
								ResonanceItems["CommonE"].get("payLinkId")
							],
							false,
							ResonanceItemOptions
						),
					},
					{
						attributes: `style="background-color: #00ffff; color: #1e1e1e;"`,
						text: item2wiki(
							ResonanceItems["CommonF"].get("payLinkId"),
							SubRankUpExtCount[
								ResonanceItems["CommonF"].get("payLinkId")
							],
							false,
							ResonanceItemOptions
						),
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
