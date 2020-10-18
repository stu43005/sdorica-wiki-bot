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
! 共鳴階級
! style="background-color: #ffd700;" | [[庫倫]]
! 淚 !! 區域限定道具 !! 共鳴魂能 !! [[魂能結晶]] !! [[精煉魂能]]
! style="background-color: #00ffff;" | [[起源魂石]]`;
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
		}
		out += `
| style="background-color: #ffd700;" | ${item2wiki('1002', row.get('coin'), false, ResonanceItemOptions)}
| ${item4 && row.get('item4Ref') != 'CommonD' ? item2wikiWithType(item4.get('payType'), item4.get('payLinkId'), row.get('item4Count'), ResonanceItemOptions) : '-'}
| ${item2 ? item2wikiWithType(item2.get('payType'), item2.get('payLinkId'), row.get('item2Count'), ResonanceItemOptions) : '-'}
| ${item1 ? item2wikiWithType(item1.get('payType'), item1.get('payLinkId'), row.get('item1Count'), ResonanceItemOptions) : '-'}
| ${item3 ? item2wikiWithType(item3.get('payType'), item3.get('payLinkId'), row.get('item3Count'), ResonanceItemOptions) : '-'}
| ${item4 && row.get('item4Ref') == 'CommonD' ? item2wikiWithType(item4.get('payType'), item4.get('payLinkId'), row.get('item4Count'), ResonanceItemOptions) : item5 && row.get('item5Ref') == 'CommonD' ? item2wikiWithType(item5.get('payType'), item5.get('payLinkId'), row.get('item5Count'), ResonanceItemOptions) : '-'}
| style="background-color: #00ffff;" | ${ext1 ? item2wikiWithType(ext1.get('payType'), ext1.get('payLinkId'), row.get('ext1Count'), ResonanceItemOptions) : '-'}`;
	}
	out += `
|-
! +1 ~ +15<br/>合計
! style="background-color: #ffd700;" | ${item2wiki('1002', SubRankUpItemCount['1002'], false, ResonanceItemOptions)}
! ${item2wiki(ResonanceItems['CommonB'].get('payLinkId'), SubRankUpItemCount[ResonanceItems['CommonB'].get('payLinkId')], false, ResonanceItemOptions)}
! ${item2wiki(ResonanceItems['CharItemC'].get('payLinkId'), SubRankUpItemCount[ResonanceItems['CharItemC'].get('payLinkId')], false, ResonanceItemOptions)}
! ${item2wiki(ResonanceItems['CharItemF'].get('payLinkId'), SubRankUpItemCount[ResonanceItems['CharItemF'].get('payLinkId')], false, ResonanceItemOptions)}
! ${item2wiki(ResonanceItems['CharItemA'].get('payLinkId'), SubRankUpItemCount[ResonanceItems['CharItemA'].get('payLinkId')], false, ResonanceItemOptions)}
! ${item2wiki(ResonanceItems['CommonD'].get('payLinkId'), SubRankUpItemCount[ResonanceItems['CommonD'].get('payLinkId')], false, ResonanceItemOptions)}
! style="background-color: #00ffff;" | ${item2wiki(ResonanceItems['CommonE'].get('payLinkId'), SubRankUpItemCount[ResonanceItems['CommonE'].get('payLinkId')], false, ResonanceItemOptions)}`;
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
| style="background-color: #00ffff;" | ${item2wiki(SublimationAngelia.get('ItemID'), SublimationAngelia.get('ItemCount'), false, ResonanceItemOptions)}`;
	}
	out += `\n|}

''註：本表以[[安潔莉亞]]共鳴道具為例，不同角色可能需要不同的道具。''`;
	return out;
}
