import { ImperiumData, RowWrapper } from "../imperium-data";
import { rank } from "../localization";
import { item2wiki, Item2WikiOptions, item2wikiWithType } from "../wiki-item";

const RankUpItemRefsTable = ImperiumData.fromGamedata().getTable("RankUpItemRefs");
const RankUpItemsTable = ImperiumData.fromGamedata().getTable("RankUpItems");
const SublimationTable = ImperiumData.fromGamedata().getTable("sublimation");

export default function wikiResonance() {
	let out = `==共鳴所需道具數量==

角色提升至共鳴階級或突破所需消耗的道具數量如下表：

{| class="wikitable" style="text-align:center;"
|-
! rowspan="2" | 共鳴階級
! rowspan="2" style="background-color: #ffd700;" | [[庫倫]]
! colspan="5" | 一般共鳴
! colspan="5" | 替代共鳴
|-
! 淚 !! 區域限定道具 !! 共鳴魂能 !! [[魂能結晶]] !! [[精煉魂能]]
! style="background-color: #00ffff;" | [[起源魂石]]
! style="background-color: #00ffff;" | [[精煉記憶石]]
! style="background-color: #00ffff;" |
! style="background-color: #00ffff;" |
! style="background-color: #00ffff;" |`;
	const ResonanceItems: Record<string, RowWrapper> = {};
	for (let i = 0; i < RankUpItemRefsTable.length; i++) {
		const row = RankUpItemRefsTable.get(i);
		const category = row.get('category');
		const param1 = row.get('param1');
		if (category == 'Common' || (category == 'HeroID' && param1 == '21'/* 安潔莉亞 */)) {
			const refId = row.get('refId');
			ResonanceItems[refId] = row;
			// payType,payLinkId,payAmount
		}
	}
	const SubRankUpItemCount: Record<string, number> = {};
	const ResonanceItemOptions: Item2WikiOptions = {
		size: 'x80px',
		direction: 'vertical',
		text: '',
	};
	for (let i = 0; i < RankUpItemsTable.length; i++) {
		const row = RankUpItemsTable.get(i);
		const category = row.get('category');
		const rank1 = row.get('rank');
		const item1 = ResonanceItems[row.get('item1Ref')];
		const item2 = ResonanceItems[row.get('item2Ref')];
		const item3 = ResonanceItems[row.get('item3Ref')];
		const item4 = ResonanceItems[row.get('item4Ref')];
		const item5 = ResonanceItems[row.get('item5Ref')];
		const ext1 = ResonanceItems[row.get('ext1Ref')];
		const ext2 = ResonanceItems[row.get('ext2Ref')];
		const ext3 = ResonanceItems[row.get('ext3Ref')];
		const ext4 = ResonanceItems[row.get('ext4Ref')];
		const ext5 = ResonanceItems[row.get('ext5Ref')];
		if (category == 'Rank') {
			const currRankName = rank()(rank1);
			const privRankName = rank()(String(rank1 - 1));
			if (!currRankName || !privRankName) {
				continue;
			}
			out += `\n|-\n! ${privRankName}<br/>➡️<br/>${currRankName}`;
		} else {
			out += `\n|-\n! +${rank1}`;
			SubRankUpItemCount['1002'] = (SubRankUpItemCount['1002'] || 0) + row.get('coin');
			if (item1) SubRankUpItemCount[item1.get('payLinkId')] = (SubRankUpItemCount[item1.get('payLinkId')] || 0) + row.get('item1Count');
			if (item2) SubRankUpItemCount[item2.get('payLinkId')] = (SubRankUpItemCount[item2.get('payLinkId')] || 0) + row.get('item2Count');
			if (item3) SubRankUpItemCount[item3.get('payLinkId')] = (SubRankUpItemCount[item3.get('payLinkId')] || 0) + row.get('item3Count');
			if (item4) SubRankUpItemCount[item4.get('payLinkId')] = (SubRankUpItemCount[item4.get('payLinkId')] || 0) + row.get('item4Count');
			if (item5) SubRankUpItemCount[item5.get('payLinkId')] = (SubRankUpItemCount[item5.get('payLinkId')] || 0) + row.get('item5Count');
			if (ext1) SubRankUpItemCount[ext1.get('payLinkId')] = (SubRankUpItemCount[ext1.get('payLinkId')] || 0) + row.get('ext1Count');
			if (ext2) SubRankUpItemCount[ext2.get('payLinkId')] = (SubRankUpItemCount[ext2.get('payLinkId')] || 0) + row.get('ext2Count');
			if (ext3) SubRankUpItemCount[ext3.get('payLinkId')] = (SubRankUpItemCount[ext3.get('payLinkId')] || 0) + row.get('ext3Count');
			if (ext4) SubRankUpItemCount[ext4.get('payLinkId')] = (SubRankUpItemCount[ext4.get('payLinkId')] || 0) + row.get('ext4Count');
			if (ext5) SubRankUpItemCount[ext5.get('payLinkId')] = (SubRankUpItemCount[ext5.get('payLinkId')] || 0) + row.get('ext5Count');
		}
		const items: [RowWrapper, number][] = [
			[item4, row.get('item4Count')],
			[item2, row.get('item2Count')],
			[item1, row.get('item1Count')],
			[item3, row.get('item3Count')],
			[item5, row.get('item5Count')],
			[ext1, row.get('ext1Count')],
			[ext2, row.get('ext2Count')],
			[ext3, row.get('ext3Count')],
			[ext4, row.get('ext4Count')],
			[ext5, row.get('ext5Count')],
		];
		if (row.get('item4Ref') === 'CommonD') {
			const temp = items[0];
			items[0] = items[4];
			items[4] = temp;
		}
		out += `
| style="background-color: #ffd700;" | ${item2wiki('1002', row.get('coin'), false, ResonanceItemOptions)}
${items.map((item, index) => `${index >= 5 ? `| style="background-color: #00ffff;" ` : ""}| ${item[0] ? item2wikiWithType(item[0].get('payType'), item[0].get('payLinkId'), item[1], ResonanceItemOptions) : '-'}`).join("\n")}`;
		if (category == 'SubRank' && rank1 == 15) {
			out += `
|-
! +1 ~ +15<br/>合計
! style="background-color: #ffd700;" | ${item2wiki('1002', SubRankUpItemCount['1002'], false, ResonanceItemOptions)}
! ${item2wiki(ResonanceItems['CommonB'].get('payLinkId'), SubRankUpItemCount[ResonanceItems['CommonB'].get('payLinkId')], false, ResonanceItemOptions)}
! ${item2wiki(ResonanceItems['CharItemC'].get('payLinkId'), SubRankUpItemCount[ResonanceItems['CharItemC'].get('payLinkId')], false, ResonanceItemOptions)}
! ${item2wiki(ResonanceItems['CharItemF'].get('payLinkId'), SubRankUpItemCount[ResonanceItems['CharItemF'].get('payLinkId')], false, ResonanceItemOptions)}
! ${item2wiki(ResonanceItems['CharItemA'].get('payLinkId'), SubRankUpItemCount[ResonanceItems['CharItemA'].get('payLinkId')], false, ResonanceItemOptions)}
! ${item2wiki(ResonanceItems['CommonD'].get('payLinkId'), SubRankUpItemCount[ResonanceItems['CommonD'].get('payLinkId')], false, ResonanceItemOptions)}
! style="background-color: #00ffff;" | ${item2wiki(ResonanceItems['CommonE'].get('payLinkId'), SubRankUpItemCount[ResonanceItems['CommonE'].get('payLinkId')], false, ResonanceItemOptions)}
! style="background-color: #00ffff;" | -
! style="background-color: #00ffff;" | -
! style="background-color: #00ffff;" | -
! style="background-color: #00ffff;" | -`;
		}
	}
	const SublimationAngelia = SublimationTable.find(row => row.get('heroId') == '21'/* 安潔莉亞 */);
	if (SublimationAngelia) {
		out += `
|-
! [[轉化系統|轉化]]
| style="background-color: #ffd700;" | ${item2wiki('1002', SublimationAngelia.get('coin'), false, ResonanceItemOptions)}
| ${item2wiki(SublimationAngelia.get('item1Id'), SublimationAngelia.get('item1Count'), false, ResonanceItemOptions)}
| -
| -
| ${item2wiki(SublimationAngelia.get('item2Id'), SublimationAngelia.get('item2Count'), false, ResonanceItemOptions)}
| ➡️<br/>➡️<br/>➡️
| style="background-color: #00ffff;" | ${item2wiki(SublimationAngelia.get('ItemID'), SublimationAngelia.get('ItemCount'), false, ResonanceItemOptions)}
! style="background-color: #00ffff;" | -
! style="background-color: #00ffff;" | -
! style="background-color: #00ffff;" | -
! style="background-color: #00ffff;" | -`;
	}
	out += `\n|}

''註：本表以[[安潔莉亞]]共鳴道具為例，不同角色可能需要不同的道具。''`;
	return out;
}
