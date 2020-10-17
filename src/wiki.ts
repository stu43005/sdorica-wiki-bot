import fs from "fs-extra";
import numeral from "numeral";
import path from "path";
import { WIKI_PATH } from "./config";
import { ImperiumData, RowWrapper } from "./imperium-data";
import { call2, currency2Id, gamedataString, gbw, getConstants, localizationCharacterName, localizationCharacterNameByHeroId, localizationHomelandBuildingName, localizationItemName, localizationMonsterSkillName, localizationMonsterSpecialityName, localizationQuestName, localizationString, localizationStringAuto, localizationTavernMissionName, rank } from "./localization";
import { Avatar } from './model/avatar';
import { Chapter } from './model/chapter';
import { ExploreItemPortable } from './model/enums/explore-item-portable.enum';
import { ItemCategory } from './model/enums/item-category.enum';
import { ExploreItem } from './model/explore-item';
import { Hero } from "./model/hero";
import { HeroSkillSet } from './model/hero-skillset';
import { Item } from "./model/item";
import { outCsv, outJson } from "./out";
import { heroSlotIconTemplate } from "./templates/hero-slot-icon";
import { tooltipTemplate } from "./templates/tooltip";
import { arrayGroupBy, arraySum, arrayUnique, objectEach, objectMap, sortByCharacterModelNo } from "./utils";
import { getMWBot } from "./wiki-bot";
import { item2wiki, Item2WikiOptions, item2wikiWithType, itemList, itemlist2wiki, itemListWithType, treasureList } from "./wiki-item";
import { chapterMetadata, getQuestJsonData, questMetadata, questSideStoryLimit } from "./wiki-quest";
import { titleparts, wikiNextLine } from "./wiki-utils";

const AbilityDropTable = ImperiumData.fromGamedata().getTable("AbilityDrop");
const AdvAchievementsTable = ImperiumData.fromGamedata().getTable("AdvAchievements");
const AdventureAchievementsTable = ImperiumData.fromGamedata().getTable("AdventureAchievements");
const AdventureDailyRankTable = ImperiumData.fromGamedata().getTable("AdventureDailyRank");
const AdventureRuleTable = ImperiumData.fromGamedata().getTable("AdventureRule");
const AdventureTierTable = ImperiumData.fromGamedata().getTable("AdventureTier");
const AdventureWeekPointTable = ImperiumData.fromGamedata().getTable("AdventureWeekPoint");
const AdventureWeekRankTable = ImperiumData.fromGamedata().getTable("AdventureWeekRank");
const CharaInfoVoiceTable = ImperiumData.fromGamedata().getTable("CharaInfoVoice");
const CharaSelectVoiceTable = ImperiumData.fromGamedata().getTable("CharaSelectVoice");
const CharaVictoryVoiceTable = ImperiumData.fromGamedata().getTable("CharaVictoryVoice");
const ChaptersTable = ImperiumData.fromGamedata().getTable("Chapters");
const ConstantsTable = ImperiumData.fromGamedata().getTable("Constants");
const DropItemsTable = ImperiumData.fromGamedata().getTable("DropItems");
const ExploreBuildingTable = ImperiumData.fromGamedata().getTable("ExploreBuilding");
const ExploreCompositeTable = ImperiumData.fromGamedata().getTable("ExploreComposite");
const GashaponPacksTable = ImperiumData.fromGamedata().getTable("GashaponPacks");
const GashaponsTable = ImperiumData.fromGamedata().getTable("Gashapons");
const HomelandBuildingTable = ImperiumData.fromGamedata().getTable("HomelandBuilding");
const HomelandMonsterTable = ImperiumData.fromGamedata().getTable("HomelandMonster");
const LevelUpsTable = ImperiumData.fromGamedata().getTable("LevelUps");
const MissionsTable = ImperiumData.fromGamedata().getTable("Missions");
const MonsterSkillTable = ImperiumData.fromGamedata().getTable("MonsterSkill");
const MonsterSpecialityTable = ImperiumData.fromGamedata().getTable("MonsterSpeciality");
const QuestExtraSettingsTable = ImperiumData.fromGamedata().getTable("QuestExtraSettings");
const QuestsTable = ImperiumData.fromGamedata().getTable("Quests");
const RankUpItemRefsTable = ImperiumData.fromGamedata().getTable("RankUpItemRefs");
const RankUpItemsTable = ImperiumData.fromGamedata().getTable("RankUpItems");
const RewardGroupsTable = ImperiumData.fromGamedata().getTable("RewardGroups");
const SignInRewardTable = ImperiumData.fromGamedata().getTable("SignInReward");
const StoreConfigsTable = ImperiumData.fromGamedata().getTable("StoreConfigs");
const StoreItemGroupsTable = ImperiumData.fromGamedata().getTable("StoreItemGroups");
const SublimationTable = ImperiumData.fromGamedata().getTable("sublimation");
const TavernMissionDropTable = ImperiumData.fromGamedata().getTable("TavernMissionDrop");
const TavernMissionRequireTable = ImperiumData.fromGamedata().getTable("TavernMissionRequire");
const TavernMissionTable = ImperiumData.fromGamedata().getTable("TavernMission");
const TeamLimitsTable = ImperiumData.fromGamedata().getTable("TeamLimits");
const VolumeTable = ImperiumData.fromGamedata().getTable("Volume");

let ExploreItemOut: string = `{| class="wikitable table-responsive-autowrap" style="word-break: break-word;"
! width="10%" | id
! width="20%" | 名稱
! 說明
! width="10%" | 分類
! width="10%" | 圖示
! width="8%" | 堆疊
! width="8%" | 攜帶性`;
for (const item of ExploreItem.getAll().filter(item => item.enable)) {
	ExploreItemOut += `
|-
| ${item.id}
| ${item.toWiki()}
| ${wikiNextLine(item.description)}
| ${item.getWikiCategory().join(",<br/>")}
| ${item.iconKey}
| ${item.stackingNum}
| ${item.portable == ExploreItemPortable.Keep ? "探索失敗後不會消失" : item.portable == ExploreItemPortable.Abandon ? "探索結算後會消耗" : ""}`;
}
ExploreItemOut += `\n|}`;
fs.writeFile(path.join(WIKI_PATH, 'ExploreItemsTable.txt'), ExploreItemOut, { encoding: 'utf8' });

const buildings: string[] = [];
const ExploreBuildingOut: string[] = [];
for (let i = 0; i < ExploreBuildingTable.length; i++) {
	const b = ExploreBuildingTable.get(i);
	const type = b.get("type");
	if (buildings.indexOf(type) != -1) continue;
	buildings.push(type);

	let str = `==${type}==\n\n{| class="wikitable"\n`;
	switch (type) {
		case "Warehouse":
			str += `! 倉庫等級 !! 倉庫格數 !! 升級素材\n`;
			break;
		default:
			str += `! 等級 !! 升級素材\n`;
			break;
	}
	const bs = ExploreBuildingTable.filter(c => c.get("type") == type);
	for (let i = 0; i < bs.length; i++) {
		const row = bs[i];
		const items = itemList(row);
		switch (type) {
			case "Warehouse":
				str += `|-
| style="text-align:center" | Lv ${row.get("level")}
| style="text-align:center" | ${row.get("effectValue")}
| ${items.length > 0 ? items.join(" ") : `style="text-align:center" | -`}
`;
				break;
			default:
				str += `|-
| style="text-align:center" | Lv ${row.get("level")}
| ${items.length > 0 ? items.join(" ") : `style="text-align:center" | -`}
`;
				break;
		}
	}
	str += `|}`;
	ExploreBuildingOut.push(str);
}
fs.writeFile(path.join(WIKI_PATH, "ExploreBuilding.txt"), ExploreBuildingOut.join("\n\n"), { encoding: 'utf8' });

const ExploreCompositeOut: string[] = [];
for (let i = 0; i < ExploreBuildingTable.length; i++) {
	const building = ExploreBuildingTable.get(i);
	const composites = ExploreCompositeTable.filter(comp => comp.get("requireBuildingId") == building.get("id") && comp.get("enable"));
	let str = `==${building.get("type")} Lv ${building.get("level")}==

{| class="wikitable"
! 設施等級 !! 道具名稱 !! 合成素材 !! 合成條件
`;
	for (let j = 0; j < composites.length; j++) {
		const row = composites[j];
		const items = itemList(row);
		str += `|-
| style="text-align:center" | Lv ${building.get("level")}
| ${item2wiki(row.get("itemId"), undefined, true)}
| ${items.join(" ")}
| ${row.get("requireFlagId") ? `style="text-align: center" | {{?}}` : `style="text-align: center" | -`}
`;
	}
	str += `|}`;
	if (composites.length) {
		ExploreCompositeOut.push(str);
	}
}
const otherComposites = ExploreCompositeTable.filter(comp => !comp.get("enable"));
if (otherComposites.length > 0) {
	let str = `==其他停用製作項目==

{| class="wikitable"
! 設施 !! 道具名稱 !! 合成素材 !! 合成條件
`;
	for (let j = 0; j < otherComposites.length; j++) {
		const row = otherComposites[j];
		if (Number(row.get("itemId")) >= 1 && Number(row.get("itemId")) <= 11) continue;
		const items = itemList(row);
		const building = ExploreBuildingTable.find(b => b.get("id") == row.get("requireBuildingId"));
		str += `|-
| style="text-align:center" | ${building ? `${building.get("type")} Lv ${building.get("level")}` : row.get("requireBuildingId")}
| ${item2wiki(row.get("itemId"), undefined, true)}
| ${items.join(" ")}
| ${row.get("requireFlagId") ? `style="text-align: center" | {{?}}` : `style="text-align: center" | -`}
`;
	}
	str += `|}`;
	ExploreCompositeOut.push(str);
}
fs.writeFile(path.join(WIKI_PATH, "ExploreComposite.txt"), ExploreCompositeOut.join("\n\n------------------------------\n\n"), { encoding: 'utf8' });

const heroPageOut: string[] = [`{| class="wikitable table-responsive-autowrap" style="word-break: break-word;"
! width="6%" | id
! width="10%" | 模組
! width="6%" | 站位
! 名稱
! 技能書
! width="6%" | 攻擊
! width="6%" | 體力
! width="6%" | 復活
! 角色故事
! 共鳴材料`];
const sortedHeroes = Hero.getAll().sort((a, b) => {
	if (a.empty && !b.empty) return 1;
	if (!a.empty && b.empty) return -1;
	return sortByCharacterModelNo(a.model, b.model);
});
for (const hero of sortedHeroes) {
	let name = hero.enable ? hero.toWikiSmallIcon() : hero.firstname;
	if (hero.firstname != hero.internalName) {
		name = tooltipTemplate(name, hero.internalName);
	}
	const skillbooks = hero.books.map(book => book.getBookItem()?.toWiki(undefined, { text: "" }) ?? '');

	heroPageOut.push(`|-${hero.enable ? "" : hero.empty ? ` style="background-color: #90ee90" title="環境"` : ` style="background-color: #ccc" title="停用"`}
| ${hero.id}
| ${hero.model}
| ${hero.empty ? "環境" : heroSlotIconTemplate(hero.slot)}
| ${name}
| ${skillbooks.join('')}
| ${hero.atk}
| ${hero.hp}
| ${hero.revive || ''}
| ${hero.storyChapter?.title ? `[[${hero.firstname}《${hero.storyChapter.title}》|${hero.storyChapter.title}]]` : ""}
| ${hero.resonanceItem?.toWiki({ text: "", count: undefined }) ?? ""}`);
}
heroPageOut.push(`|}`);
fs.writeFile(path.join(WIKI_PATH, "heroTable.txt"), heroPageOut.join("\n"), { encoding: 'utf8' });

const heroJsonOut = sortedHeroes.filter(hero => hero.enable).map(hero => hero.toJSON());
fs.writeFile(path.join(WIKI_PATH, "Heroes.json"), JSON.stringify(heroJsonOut, undefined, "\t"), { encoding: 'utf8' });

const questJson = getQuestJsonData();
const questsOut: string[] = Object.values(questJson).map((chapter) => {
	let tempOut: string[] = [];
	objectEach(chapter, (fullname, quest) => {
		tempOut.push(`${fullname}\n\n${quest}`);
	});
	return tempOut;
}).reduce((prev: string[], curr: string[]) => prev.concat(curr), []);
fs.writeFile(path.join(WIKI_PATH, "quests.txt"), questsOut.join("\n\n##############################\n\n"), { encoding: 'utf8' });

const SideStoryOut: string[] = [];
const SideStoryChapters = ChaptersTable.filter(ch => ch.get("category") == "SideStory");
for (let i = 0; i < SideStoryChapters.length; i++) {
	const row = SideStoryChapters[i];
	const chID = row.get("id");
	const title = localizationString("RegionName")(row.get("title"));
	const hero = Hero.find(hero => hero.storyChapter == chID);
	if (hero) {
		let chname = `${hero.firstname}《${title}》`;
		if (hero.firstname == "愛麗絲") {
			chname = `Sdorica X DEEMO《${title}》`;
		}

		let str = `==[[${chname}]]==`;
		const quests = QuestsTable.filter(q => q.get("chapter") == chID && q.get("enable"));
		for (let j = 0; j < quests.length; j++) {
			const quest = quests[j];
			const { name: qname } = questMetadata(quest, row);
			str += `\n===[[${chname}/${qname}]]===`;
			const sideStoryLimit = questSideStoryLimit(quest, row);
			if (sideStoryLimit[1]) {
				str += `\n${sideStoryLimit[1]}`;
			}
		}
		SideStoryOut.push(str);
	}
}
fs.writeFile(path.join(WIKI_PATH, "chSideStory.txt"), SideStoryOut.join("\n\n"), { encoding: 'utf8' });

const advOut: string[] = [];
advOut.push(`===計分機制===`);
let advRuleOut = `{| class="wikitable"
! 機制
! 詳細內容`;
function advRuleNumber(v: number) {
	return v < 0 ? `扣${v * -1}` : `獲得${v}`;
}
for (let i = 0; i < AdventureRuleTable.length; i++ ) {
	const row = AdventureRuleTable.get(i);
	let descs: string[] = [];
	if (row.get("finalArmor")) descs.push(`finalArmor: ${row.get("finalArmor")}`);
	if (row.get("finalDeathCount")) descs.push(`finalDeathCount: ${row.get("finalDeathCount")}`);
	if (row.get("finalHp")) descs.push(`finalHp: ${row.get("finalHp")}`);
	if (row.get("finalS1Count")) descs.push(`finalS1Count: ${row.get("finalS1Count")}`);
	if (row.get("finalS2Count")) descs.push(`finalS2Count: ${row.get("finalS2Count")}`);
	if (row.get("finalS4Count")) descs.push(`finalS4Count: ${row.get("finalS4Count")}`);
	if (row.get("levelScore")) descs.push(`levelScore: ${row.get("levelScore")}`);
	if (row.get("totalDamageScore")) descs.push(`totalDamageScore: ${row.get("totalDamageScore")}`);
	if (row.get("turn")) descs.push(`每使用1個回合${advRuleNumber(row.get("turn"))}分`);
	if (row.get("wave")) descs.push(`每完成一個波次${advRuleNumber(row.get("wave"))}分`);
	if (row.get("waveHp")) descs.push(`每完成一個波次時，其所有角色每1%血量獲得${advRuleNumber(row.get("waveHp"))}分`);
	if (row.get("waveArmor")) descs.push(`每完成一個波次時，其所有角色每1%盾量${advRuleNumber(row.get("waveArmor"))}分`);
	if (row.get("waveDeathCount")) descs.push(`每完成一個波次時，其所有角色每死亡一次${advRuleNumber(row.get("waveDeathCount"))}分`);
	if (row.get("waveS1Count")) descs.push(`waveS1Count: ${row.get("waveS1Count")}`);
	if (row.get("waveS2Count")) descs.push(`waveS2Count: ${row.get("waveS2Count")}`);
	if (row.get("waveS4Count")) descs.push(`waveS4Count: ${row.get("waveS4Count")}`);
	advRuleOut += `
|-
! <h5 class="norm">${localizationString("ScoreMessage", (s) => s + "_title")(row.get("id"))}</h5>
| ${localizationString("ScoreMessage", (s) => s + "_text")(row.get("id")).replace(/\n/g, "<br/>")}`;
}
advRuleOut += `\n|}`;
advOut.push(advRuleOut);
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
			str += `\n{{旅途|${questSubtitle(quest.get("subtitle"))}|${quest.get("recommendLevel")}|||${qname}}}\n| style="padding-left: 10px;" | [[#${localizationStringAuto()(quest.get("displayDropText"))}]]`;
		}
		str += `\n|}`;
		advOut.push(str);
	}
}
fs.writeFile(path.join(WIKI_PATH, "chAdventure.txt"), advOut.join("\n\n"), { encoding: 'utf8' });

const chapterGroupOut: Record<string, string[]> = {};
for (let i = 0; i < ChaptersTable.length; i++) {
	const row = ChaptersTable.get(i);
	const chID = row.get("id");
	const quests = QuestsTable.filter(q => q.get("chapter") == chID && q.get("enable"));
	const { name, title, imageName, group } = chapterMetadata(row);
	let str = `===${name}：${title}===
* 章節可見條件：${stateCondition(row.get("visibleCondition"), row.get("param1"))}
* 章節解鎖條件：${stateCondition(row.get("unlockCondition"), row.get("param2"))}${row.get("countDisplay") ? `
* 每日可通關次數：${row.get("dailyCount")}
* 增加可完成次數消耗：${!row.get("extraCountCurrency") ? item2wiki(row.get("extraCountItem"), row.get("extraCountItemCount")) : item2wikiWithType(row.get("extraCountCurrency"), "", row.get("extraCountPrice"))}` : ''}
* 章節完成獎勵：${treasureList(row.get('dropGroupID'), '*')}
{{旅途表格|${imageName}}}`;
	for (let j = 0; j < quests.length; j++) {
		const quest = quests[j];
		const { prefix, ch, ch2, name: questName, wikilink } = questMetadata(quest, row);
		const wikilinkLastPart = titleparts(wikilink, 0, -1);
		str += `\n{{旅途|${questSubtitle(quest.get("subtitle"))}|${quest.get("recommendLevel")}|${prefix}|${ch}${ch2 ? "-" + ch2 : ""}|${wikilink}${wikilinkLastPart != questName ? `|${questName}` : ""}}}`;
	}
	str += `\n{{旅途表格結束}}`;
	if (!row.get("enable")) {
		str = `<!--\n${str}\n-->`;
	}
	if (!chapterGroupOut[group]) chapterGroupOut[group] = [];
	chapterGroupOut[group].push(str);
}
let chapterOut: string[] = [];
objectEach(chapterGroupOut, (group, outs) => {
	chapterOut.push(`==${group}==`);
	const volume = VolumeTable.find(row => group.includes(row.get("title")) || (group.includes("Sdorica") && row.get("volume") == 'Main'));
	if (volume) {
		const name = localizationString("Metagame")(volume.get("name"));
		chapterOut.push(`* ${name}可見條件：${stateCondition(volume.get("visibleCondition"), volume.get("param1"))}
* ${name}解鎖條件：${stateCondition(volume.get("unlockCondition"), volume.get("param2"))}`);
	}
	chapterOut = chapterOut.concat(outs);
});
fs.writeFile(path.join(WIKI_PATH, "chapter.txt"), chapterOut.join("\n\n"), { encoding: 'utf8' });

function questSubtitle(subTitle: string): string {
	switch (subTitle) {
		case "Story": return "故事";
		case "Battle": return "戰鬥";
		case "Challenge": return "挑戰";
		case "Activity": return "活動";
	}
	console.log(`unknown quest subtitle: ${subTitle}`);
	debugger;
	return subTitle;
}

function stateCondition(cond: string, param1: string): string {
	switch (cond) {
		case "PlayerLevel":
			return `諦視者等級 ${param1}`;
		case "QuestComplete":
			return `通過關卡 ${localizationQuestName()(param1)}`;
		case "FlagCondition":
			return `Flag: ${param1}`;
	}
	console.log(`unknown state condition: ${cond}:${param1}`);
	debugger;
	return `${cond}:${param1}`;
}

const storeGroup = objectMap(arrayGroupBy(StoreConfigsTable.filter(r => r.get("enable")).map(row => ({
	condition: String(row.get("condition")),
	param1: String(row.get("param1")),
	param2: String(row.get("param2")),
	param3: String(row.get("param3")),
	itemGroup: String(row.get("itemGroup")),
	store: String(row.get("store")),
	slot: Number(row.get("slot")),
	order: Number(row.get("order")),
})), r => r.store), (key, value) => arrayGroupBy(value, r => r.slot, true));

const storeOut: string[] = [];
for (const store in storeGroup) {
	if (storeGroup.hasOwnProperty(store)) {
		const name = localizationString("Metagame")(`store_eventStore_${store}`);
		let str = `== ${store}${name ? ` ${name}` : ""} ==`;
		const sortedGroup = storeGroup[store].sort((a, b) => a[0].order - b[0].order);
		for (let slot = 0; slot < sortedGroup.length; slot++) {
			if (!sortedGroup[slot]) continue;
			str += `
=== 第 ${slot + 1} 格 ===`;
			const indent = sortedGroup[slot].length > 1 ? "**" : "*";
			for (let i = 0; i < sortedGroup[slot].length; i++) {
				const config = sortedGroup[slot][i];
				if (indent == "**") {
					str += `
* ${config.condition}: ${config.param1} ~ ${config.param2}`;
				}

				const itemGroup = StoreItemGroupsTable.filter(g => g.get("group") == config.itemGroup && g.get("enable"));
				let weightCount = 0;
				itemGroup.forEach(ig => {
					weightCount += Number(ig.get("weight"));
				});
				for (let j = 0; j < itemGroup.length; j++) {
					const item = itemGroup[j];
					str += `\n${indent} ${item2wikiWithType(item.get("giveType"), item.get("giveLinkId"), item.get("itemCount"))}：${item2wikiWithType(item.get("payType"), item.get("linkId"), item.get("amount"))}`;
					if (itemGroup.length > 1) {
						str += ` (${Math.floor(Number(item.get("weight")) / weightCount * 10000) / 100}%)`;
					}
				}
			}
		}
		storeOut.push(str);
	}
}
fs.writeFile(path.join(WIKI_PATH, "store.txt"), storeOut.join("\n\n"), { encoding: 'utf8' });

const IntroTip = localizationString("IntroTip");
const Tip_num = Number(IntroTip("Tip_num"));
const TipsOut: string[] = [];
TipsOut.push(`{{#switch:{{#expr:({{#time:y}} * {{#time:n}} * {{#time:j}} + {{{offset|0}}}) mod ${Tip_num - 1}}}`);
for (let i = 1; i < Tip_num; i++) {
	const key = `Tip_${i}`;
	const tip = IntroTip(key).replace(/\n/g, "");
	TipsOut.push(`|${i - 1} = ${tip}`);
}
TipsOut.push(`}}<noinclude>{{Documentation}}</noinclude>`);
fs.writeFile(path.join(WIKI_PATH, "tips.txt"), TipsOut.join("\n"), { encoding: 'utf8' });

const AdventureRankOut: string[] = [];
const dailyRankGroups = arrayUnique(AdventureDailyRankTable.rows.map(r => r.get("groupId")));
const dailyRankImage: Record<string, string> = {
	"rank_daily_01": "幻境試煉_日排名_01_Icon.png",
	"rank_daily_02": "幻境試煉_日排名_02_Icon.png",
	"rank_daily_03": "幻境試煉_日排名_03_Icon.png",
	"rank_daily_04": "幻境試煉_日排名_04_Icon.png",
	"rank_daily_05": "幻境試煉_日排名_05_Icon.png",
};
AdventureRankOut.push(`==本日總積分、評價與獎勵==`);
for (let i = 0; i < dailyRankGroups.length; i++) {
	const groupId = dailyRankGroups[i];
	let str = `===group ${groupId}===
{| class="wikitable mw-collapsible"
|-
! 評價
! colspan="4" | 獎勵`;
	const entries = AdventureDailyRankTable.filter(r => r.get("groupId") == groupId && r.get("image") != "rank_daily_no");
	for (let j = 0; j < entries.length; j++) {
		const entry = entries[j];
		str += `\n|-
| [[File:${dailyRankImage[entry.get("image")]}|64px]] (${entry.get("maxPercentage")}% ~ ${entry.get("minPercentage")}%)
| ${item2wiki(entry.get("item1Id"), entry.get("reward1Count"))}
| ${item2wiki(entry.get("item2Id"), entry.get("reward2Count"))}
| ${item2wiki(entry.get("item3Id"), entry.get("reward3Count"))}
| ${item2wiki(entry.get("item4Id"), entry.get("reward4Count"))}`;
	}
	str += `\n|}`;
	AdventureRankOut.push(str);
}
const weekRankGroups = arrayUnique(AdventureWeekRankTable.rows.map(r => r.get("groupId")));
const weekRankImage: Record<string, string> = {
	"rank_week_01": "幻境試煉_週排名_01_Icon.png",
	"rank_week_02": "幻境試煉_週排名_02_Icon.png",
	"rank_week_03": "幻境試煉_週排名_03_Icon.png",
	"rank_week_04": "幻境試煉_週排名_04_Icon.png",
	"rank_week_05": "幻境試煉_週排名_05_Icon.png",
};
AdventureRankOut.push(`==本週總積分、排名與獎勵==`);
for (let i = 0; i < weekRankGroups.length; i++) {
	const groupId = weekRankGroups[i];
	let str = `===group ${groupId}===
{| class="wikitable mw-collapsible"
|-
! colspan="2" | 排名
! colspan="4" | 獎勵`;
	const entries = AdventureWeekRankTable.filter(r => r.get("groupId") == groupId && r.get("image") != "rank_week_no");
	for (let j = 0; j < entries.length; j++) {
		const entry = entries[j];
		str += `\n|-
| style="text-align: center;" | [[File:${weekRankImage[entry.get("image")]}|64px]]
| style="text-align: center;" | No.${entry.get("maxRanking")}<br>｜<br>${entry.get("minRanking") == -1 ? "∞" : `No.${entry.get("minRanking")}`}
| ${item2wiki(entry.get("item1Id"), entry.get("reward1Count"))}
| ${item2wiki(entry.get("item2Id"), entry.get("reward2Count"))}
| ${item2wiki(entry.get("item3Id"), entry.get("reward3Count"))}
| ${item2wiki(entry.get("item4Id"), entry.get("reward4Count"))}`;
	}
	str += `\n|}`;
	AdventureRankOut.push(str);
}
const advTierGroups = arrayUnique(AdventureTierTable.rows.map(r => r.get("groupId")));
AdventureRankOut.push(`==階級排名獎勵==`);
for (let i = 0; i < advTierGroups.length; i++) {
	const groupId = advTierGroups[i];
	let str = `===group ${groupId}===
{| class="wikitable mw-collapsible"
|-
! 階級
! 評價
! colspan="4" | 獎勵
! 下週階級變化`;
	const groupEntries = AdventureTierTable.filter(r => r.get("groupId") == groupId && r.get("maxPercentage") != -1);
	const ranks = arrayUnique(groupEntries.map(r => r.get("rankName")));
	for (let j = 0; j < ranks.length; j++) {
		const rankName = ranks[j];
		const entries = groupEntries.filter(r => r.get("rankName") == rankName);
		const rankNameCh = localizationString("Adventure")(rankName);
		str += `\n|-
! rowspan="${entries.length}" | [[檔案:幻境${rankNameCh}_Icon.png|30px]]<br>${rankNameCh}`;
		for (let j = 0; j < entries.length; j++) {
			const entry = entries[j];
			if (j > 0) {
				str += `\n|-`;
			}
			str += `
| style="text-align: center;" | ${entry.get("maxPercentage")}% ~ ${entry.get("minPercentage")}%
| ${item2wikiWithType(entry.get("giveType1"), entry.get("giveLinkId1"), entry.get("giveAmount1"))}
| ${item2wikiWithType(entry.get("giveType2"), entry.get("giveLinkId2"), entry.get("giveAmount2"))}
| ${item2wikiWithType(entry.get("giveType3"), entry.get("giveLinkId3"), entry.get("giveAmount3"))}
| ${item2wikiWithType(entry.get("giveType4"), entry.get("giveLinkId4"), entry.get("giveAmount4"))}
| ${localizationString("Adventure", "tier_rank")(entry.get("nextRank"))}`;
		}
	}
	str += `\n|}`;
	AdventureRankOut.push(str);
}
const weekPointGroups = arrayUnique(AdventureWeekPointTable.rows.map(r => r.get("groupId")));
AdventureRankOut.push(`==積分獎勵==`);
for (let i = 0; i < weekPointGroups.length; i++) {
	const groupId = weekPointGroups[i];
	let str = `===group ${groupId}===
{| class="wikitable mw-collapsible"
|-
! 積分
! colspan="4" | 獎勵`;
	const entries = AdventureWeekPointTable.filter(r => r.get("groupId") == groupId).sort((a, b) => a.get("points") - b.get("points"));
	for (let j = 0; j < entries.length; j++) {
		const entry = entries[j];
		str += `\n|-
| ${numeral(Number(entry.get("points"))).format("0,0")}分
| ${item2wiki(entry.get("item1Id"), entry.get("reward1Count"))}
| ${item2wiki(entry.get("item2Id"), entry.get("reward2Count"))}
| ${item2wiki(entry.get("item3Id"), entry.get("reward3Count"))}
| ${item2wiki(entry.get("item4Id"), entry.get("reward4Count"))}`;
	}
	str += `\n|}`;
	AdventureRankOut.push(str);
}
fs.writeFile(path.join(WIKI_PATH, "AdventureRank.txt"), AdventureRankOut.join("\n\n"), { encoding: 'utf8' });

const AdvAchievementsOut: string[] = [];
AdvAchievementsOut.push("==舊版幻境成就==");
const AdvAchievementsTabs = [...new Set(AdvAchievementsTable.rows.map(r => r.get("tab")))];
for (let i = 0; i < AdvAchievementsTabs.length; i++) {
	const tab = AdvAchievementsTabs[i];
	const achs = AdvAchievementsTable.filter(a => a.get("tab") == tab);
	let str = `===${localizationString("Adventure")(tab).replace(/\n/g, "")}===
{| class="wikitable mw-collapsible"
|-
! 成就內容 !! 成就獎勵`;
	for (let j = 0; j < achs.length; j++) {
		const ach = achs[j];
		const title = localizationString("Adventure", "achi_title_")(ach.get("id"));
		const content = localizationString("Adventure", "achi_")(ach.get("id"));
		const reward = ach.get("rewardItemId");
		const rewardCount = ach.get("rewardCount");
		str += `\n|-\n| ${content} || ${item2wiki(reward, rewardCount == 1 ? undefined : rewardCount)}`;
	}
	str += `\n|}`;
	AdvAchievementsOut.push(str);
}
AdvAchievementsOut.push("==新版幻境成就==");
const AdventureAchievementsTabs = [...new Set(AdventureAchievementsTable.rows.map(r => r.get("tab")))];
for (let i = 0; i < AdventureAchievementsTabs.length; i++) {
	const tab = AdventureAchievementsTabs[i];
	const achs = AdventureAchievementsTable.filter(a => a.get("tab") == tab);
	let str = `===${localizationString("Adventure")(tab).replace(/\n/g, "")}===
{| class="wikitable mw-collapsible"
|-
! 成就內容 !! 成就獎勵`;
	for (let j = 0; j < achs.length; j++) {
		const ach = achs[j];
		const title = localizationString("Adventure", "achi_title_")(ach.get("id"));
		const content = localizationString("Adventure", "achi_")(ach.get("id"));
		const giveType = ach.get("giveType");
		const giveLinkId = ach.get("giveLinkId");
		const giveAmount = ach.get("giveAmount");
		str += `\n|-\n| ${content} || ${item2wikiWithType(giveType, giveLinkId, giveAmount == 1 ? undefined : giveAmount)}`;
	}
	str += `\n|}`;
	AdvAchievementsOut.push(str);
}
fs.writeFile(path.join(WIKI_PATH, "AdvAchievements.txt"), AdvAchievementsOut.join("\n\n"), { encoding: 'utf8' });

const MissionsOut: string[] = [];
const MissionsTabs = [...new Set(MissionsTable.rows.map(r => r.get("tab")))];
for (let i = 0; i < MissionsTabs.length; i++) {
	const tab = MissionsTabs[i];
	MissionsOut.push(`==${tab}==`);
	const categorys = [...new Set(MissionsTable.filter(r => r.get("tab") == tab).sort((a, b) => Number(a.get("order")) - Number(b.get("order"))).map(r => r.get("category")))].sort((a, b) => a.localeCompare(b));
	for (let j = 0; j < categorys.length; j++) {
		const category = categorys[j];
		let str = `===${category}===
{| class="wikitable mw-collapsible"
|-
! 諦視者等級 !! 任務內容 !! 任務獎勵`;
		const missions = MissionsTable.filter(r => r.get("tab") == tab && r.get("category") == category);
		for (let k = 0; k < missions.length; k++) {
			const mission = missions[k];
			if (mission.get("enable") && mission.get("weight") != 0) {
				str += `\n|-`;
			}
			else {
				str += `\n|- style="background-color: #ccc" title="停用"`;
			}
			str += `\n| ${mission.get("minLv") == -1 ? `style="text-align: center;" | -` : mission.get("maxLv") == 99 ? `${mission.get("minLv")} ↑` : `${mission.get("minLv")} ~ ${mission.get("maxLv")}`}\n| ${missionName(mission)}\n| ${item2wikiWithType(mission.get("giveType"), mission.get("giveLinkId"), mission.get("giveAmount"))}`;
		}
		str += `\n|}`;
		MissionsOut.push(str);
	}
}
fs.writeFile(path.join(WIKI_PATH, "Missions.txt"), MissionsOut.join("\n\n"), { encoding: 'utf8' });

function missionName(mission: RowWrapper) {
	if (mission.get("type") != "Quest") {
		return localizationString("Mission", "mission_")(mission.get("id")) || mission.get("name");
	}

	let prefix = "";
	if (mission.get("tab") == "guild") {
		const lv = mission.get("category").replace(/guild/g, "");
		prefix = localizationString("Mission")("prefix_level").replace(/{\[level\]}/g, lv);
	}
	else if (mission.get("category") == "limit7" || mission.get("category") == "treasure") {
		prefix = localizationString("Mission")("prefix_treasure");
	}
	else if (mission.get("category") == "limit6" || mission.get("category") == "gemCard") {
		prefix = localizationString("Mission")("prefix_gem");
	}

	const limitations = (mission.get("param3") as string).split(";").map(limit => {
		if (limit.startsWith("LimitTurn")) {
			const turn = limit.replace(/LimitTurn_/g, "");
			return localizationString("Mission")("limit_turn").replace(/{\[turn\]}/g, turn);
		}
		if (limit.startsWith("LimitDead")) {
			const count = limit.replace(/LimitDead_/g, "");
			if (Number(count) == 0) {
				return localizationString("Mission")("limit_no_casualties");
			}
			return localizationString("Mission")("limit_casualties_count").replace(/{\[casualty\]}/g, count);
		}
		if (limit.startsWith("Use")) {
			const id = limit.replace(/Use_/g, "");
			return localizationString("Mission")("use_heroId").replace(/{\[characterName\]}/g, localizationCharacterNameByHeroId()(id));
		}
		if (limit.startsWith("NoUse")) {
			const id = limit.replace(/NoUse_/g, "");
			return localizationString("Mission")("not_use_heroId").replace(/{\[characterName\]}/g, localizationCharacterNameByHeroId()(id));
		}
		if (limit.startsWith("NoAssistant")) {
			return localizationString("Mission")("no_assistant");
		}
		if (limit.startsWith("NoGuild")) {
			return localizationString("Mission")("no_guild_assistant");
		}
		if (limit.startsWith("CastMore")) {
			let match = limit.match(/^CastMore_S(\d+)_(\d+)$/);
			if (match) {
				return localizationString("Mission")("castmore_Skill").replace(/{\[block\]}/g, match[1]).replace(/{\[skillCount\]}/g, match[2]);
			}
			match = limit.match(/^CastMore_(\w+)_(\d+)$/);
			if (match) {
				return localizationString("Mission")(`castmore_${match[1]}`).replace(/{\[skillCount\]}/g, match[2]);
			}
			debugger;
			return limit;
		}
		if (limit.startsWith("CastLess")) {
			let match = limit.match(/^CastLess_S(\d+)_(\d+)$/);
			if (match) {
				if (Number(match[2]) == 0) {
					return localizationString("Mission")("cast_no_erase_Skill").replace(/{\[block\]}/g, match[1]);
				}
				return localizationString("Mission")("castless_Skill").replace(/{\[block\]}/g, match[1]).replace(/{\[skillCount\]}/g, match[2]);
			}
			match = limit.match(/^CastLess_(\w+)_(\d+)$/);
			if (match) {
				if (Number(match[2]) == 0) {
					return localizationString("Mission")(`cast_no_${match[1]}`);
				}
				return localizationString("Mission")(`castless_${match[1]}`).replace(/{\[skillCount\]}/g, match[2]);
			}
			debugger;
			return limit;
		}
		if (limit.startsWith("limitS")) {
			const match = limit.match(/^limitS(\d+)$/);
			if (match) {
				return localizationString("Mission")("cast_no_erase_Skill").replace(/{\[block\]}/g, match[1]);
			}
			debugger;
			return limit;
		}
	});

	let clear = mission.get("param1");
	const quest = QuestsTable.find(q => q.get("id") == mission.get("param1"));
	if (quest) {
		const chapterId = quest.get("chapter");
		const chapter = ChaptersTable.find(c => c.get("id") == chapterId);
		if (chapter) {
			const qq = questMetadata(quest, chapter);
			const questname = `${qq.prefix}${qq.ch}-${qq.ch2} [[${qq.name}]]`;
			switch (chapter.get("group")) {
				case "Region":
					clear = localizationString("Mission")("clear_region").replace(/{\[questname\]}/g, questname);
					break;
				case "Challenge":
					clear = localizationString("Mission")("clear_challenge").replace(/{\[questname\]}/g, questname);
					break;
			}
		}
	}
	return `${prefix} ${limitations.join(` ${localizationString("Mission")("and_description")} `)} ${clear}`;
}

const LevelUpKeys = ["exp", "heroexp", "homeexp", "monsterexp"];
let LevelUpsOut: string[] = [];
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
	LevelUpsOut.push(str);
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
	LevelUpsOut.push(str);
}
fs.writeFile(path.join(WIKI_PATH, "LevelUps.txt"), LevelUpsOut.join("\n\n"), { encoding: 'utf8' });

const GashaponsOut: string[] = [];
const GashaponsGroup = arrayGroupBy(GashaponsTable.rows, r => r.get("packId"));
const GashaponPositionKeys = ["金", "黑", "白"];
for (const packId in GashaponsGroup) {
	if (GashaponsGroup.hasOwnProperty(packId)) {
		const entries = GashaponsGroup[packId];
		let str = `== ${call2(gamedataString("GashaponPacks", "id", "name"), localizationStringAuto())(packId)} ==
<blockquote>${call2(gamedataString("GashaponPacks", "id", "description"), localizationStringAuto())(packId).replace(/\n/g, "<br/>")}</blockquote>
{| class="wikitable" width=100%
|-
! width=20% | 階級
! width=60% colspan=2 | 角色
! width=20% | 個別機率
|-`;
		const tierGroup = arrayGroupBy(entries, r => r.get("itemCount"));
		const tierKeys = Object.keys(tierGroup).map(s => Number(s)).sort((a, b) => b - a);
		for (const tier of tierKeys) {
			const probabilityGroup = objectMap(arrayGroupBy(tierGroup[tier], r => String(r.get("weight"))), (key, value) => arrayGroupBy(value.map(r => {
				const itemId: string = r.get("itemId");
				const heroId = Item.get(itemId)?.effectValue;
				if (heroId) {
					return Hero.get(heroId.toString());
				}
			}).filter(r => !!r) as Hero[], r => r.slot));
			str += `\n| align="center" rowspan=${arraySum(Object.values(probabilityGroup).map(v => Object.values(v).length), v => v) + 1} | {{階級圖標|${GashaponItemCount2Rank(tier)}|100px}}<br>${GashaponItemCount2Rank(tier)}`;
			let weightSum = 0;
			const weightKeys = Object.keys(probabilityGroup).map(s => Number(s)).sort((a, b) => b - a);
			for (const weight of weightKeys) {
				if (probabilityGroup.hasOwnProperty(weight)) {
					const positions = Object.keys(probabilityGroup[weight]).sort((a, b) => GashaponPositionKeys.indexOf(a) - GashaponPositionKeys.indexOf(b));
					for (const position of positions) {
						if (probabilityGroup[weight].hasOwnProperty(position)) {
							const heroes = probabilityGroup[weight][position].sort((a, b) => Number(a.id) - Number(b.id));
							weightSum += heroes.length * Number(weight);
							str += `
| align="center" width=8% | [[檔案:${position}位 Icons.png|30px]]
| width=52% | ${heroes.map(hero => localizationCharacterName()(hero.model)).map(str => `[[${str}]]`).join("、")}
| align="center" | {{Color|#0000ff|${numeral(Number(weight) / 10000).format("0.000")}%}}
|-`;
						}
					}
				}
			}
			str += `\n! colspan=3 | ${GashaponItemCount2Rank(tier)}總機率：{{Color|#0000ff|${numeral(Number(weightSum) / 10000).format("0.0")}%}}\n|-`;
		}
		str += `\n|}`;
		GashaponsOut.push(str);
	}
}
fs.writeFile(path.join(WIKI_PATH, "Gashapons.txt"), GashaponsOut.join("\n\n"), { encoding: 'utf8' });

function GashaponItemCount2Rank(count: number) {
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

const EnabledGashaponIds = arrayUnique(GashaponsTable.rows.map(r => r.get("packId")));
const GashaponsJson: Record<string, { weight: number, id: string }[]> = {};
for (let i = 0; i < EnabledGashaponIds.length; i++) {
	const gashaponId = EnabledGashaponIds[i];
	let gashaponName = call2(gamedataString("GashaponPacks", "id", "name"), localizationStringAuto())(gashaponId);
	gashaponName = String(gashaponName).replace(/\s/g, "");
	const dropTable = GashaponsTable.filter(r => r.get("packId") == gashaponId);
	GashaponsJson[gashaponName] = dropTable.map(r => {
		const itemId: string = r.get("itemId");
		let name = localizationItemName()(itemId);
		const heroId = Item.get(itemId)?.effectValue;
		if (heroId) {
			name = Hero.get(heroId.toString())?.firstname ?? name;
		}
		return {
			weight: r.get("weight"),
			id: `${name}:${GashaponItemCount2Rank(r.get("itemCount"))}`
		};
	});
}
outJson(path.join(WIKI_PATH, "Gashapons.json"), GashaponsJson);

let AvatarsOut = `{| class="wikitable"
|-
! 頭像 !! 獲得途徑 !! Icon`;
for (const avatar of Avatar.getAll().sort((a, b) => a.order - b.order)) {
	if (avatar.item) {
		AvatarsOut += `\n|- style="background-color: #ddd"`;
		AvatarsOut += `\n| ${avatar.item.toWiki()}`;
	}
	else {
		AvatarsOut += `\n|-`;
		AvatarsOut += `\n| ${avatar.hero?.toWikiSmallIcon() ?? ''}`;
	}
	AvatarsOut += ` || ${avatar.description} || ${avatar.asset}`;
}
AvatarsOut += `\n|}`;
fs.writeFile(path.join(WIKI_PATH, "Avatars.txt"), AvatarsOut, { encoding: 'utf8' });

const homelandBuildingIds = arrayUnique(HomelandBuildingTable.rows.map(r => r.get("buildingId")));
const HomelandBuildingOut: string[] = [];
homelandBuildingIds.forEach(id => {
	const buildings = HomelandBuildingTable.filter(r => r.get("buildingId") == id);
	let str = `==${localizationString("Homeland")(buildings[0].get("nameKey")) || buildings[0].get("nameKey")}==
{| class="wikitable"
! 等級<!--buildingLv-->
! 空間<!--spaceNum-->
! 升級素材
! 升級獲得營地精驗`;
	for (let i = 0; i < buildings.length; i++) {
		const building = buildings[i];
		const itemlist = itemListWithType(building, 3, (i) => `payType${i}`, (i) => `linkId${i}`, (i) => `amount${i}`).join(" ");
		str += `
|-${building.get("enable") ? "" : ` style="background-color: #ccc" title="停用"`}
| ${building.get("buildingLv")}
| ${building.get("spaceNum") >= 0 ? building.get("spaceNum") : ""}
| ${building.get("buildingLv") == 1 ? "" : itemlist}
| ${building.get("buildingLv") == 1 ? "" : building.get("homeexp")}`;
	}
	str += `\n|}`;
	HomelandBuildingOut.push(str);
});
fs.writeFile(path.join(WIKI_PATH, "HomelandBuilding.txt"), HomelandBuildingOut.join("\n\n"), { encoding: 'utf8' });

const TavernMissionOut: string[] = [];
const TavernMissionTabs = arrayUnique(TavernMissionTable.rows.map(r => r.get("tab")));
TavernMissionOut.push(`[[檔案:2.1_版本前瞻_篝火.png|link=【2019.7.31】世界變動記錄/版本前瞻與回顧]]`);
for (let i = 0; i < TavernMissionTabs.length; i++) {
	const tab = TavernMissionTabs[i];
	TavernMissionOut.push(`==${tab}==`);
	const categorys = [...new Set(TavernMissionTable.filter(r => r.get("tab") == tab).map(r => r.get("category")))].sort((a, b) => a.localeCompare(b));
	for (let j = 0; j < categorys.length; j++) {
		const category = categorys[j];
		let str = `===${category}===
{| class="wikitable mw-collapsible"
|-
! 階級 !! 羈絆等級 !! 任務名稱 !! 需要角色 !! 所需時間 !! 消耗體力 !! 所需技能 !! 出場野獸數量 !! 基礎獎勵 !! 額外獎勵 !! 快速跳過`;
		const missions = TavernMissionTable.filter(r => r.get("tab") == tab && r.get("category") == category);
		for (let k = 0; k < missions.length; k++) {
			const mission = missions[k];
			const reqSkill = TavernMissionRequireTable.filter(r => r.get("missionId") == mission.get("id"));
			const reqHero: string[] = [];
			if (mission.get("heroid")) {
				reqHero.push(`{{角色小圖示|${localizationCharacterNameByHeroId()(mission.get("heroid"))}}}`);
			}
			if (mission.get("heroLv")) {
				reqHero.push(`Lv ${mission.get("heroLv")}`);
			}
			if (mission.get("heroRank") > 2) {
				reqHero.push(`${rank()(mission.get("heroRank"))}`);
			}
			if (!mission.get("gold") || !mission.get("black") || !mission.get("white")) {
				if (mission.get("gold")) reqHero.push(`金位`);
				if (mission.get("black")) reqHero.push(`黑位`);
				if (mission.get("white")) reqHero.push(`白位`);
			}
			let express = "";
			if (mission.get("expressCurrency") && mission.get("expressCurrency") != "-1") {
				express = `${item2wiki(currency2Id()(mission.get("expressCurrency")), mission.get("expressConversion"), false, { text: "" })}`;
			}
			if (mission.get("enable")) {
				str += `\n|-`;
			}
			else {
				str += `\n|- style="background-color: #ccc" title="停用"`;
			}
			str += `
| ${mission.get("questRank")} ★
| ${mission.get("monsterLv")}
| ${localizationString("TavernMission")(mission.get("questKeyName")) || mission.get("questKeyDescription")}
| ${reqHero.join(",<br/>")}
| ${tavernTime(Number(mission.get("time")))}
| x${mission.get("stamina")}
| ${reqSkill.length > 0 ? reqSkill.map(r => `{{狀態圖示|${localizationMonsterSkillName()(r.get("skillId"))}|24px|層數=${r.get("skillLv")}}}${tavernReqSkillIcon(r.get("category"))}${r.get("successRate")/100}%`).join("<br/>") : ""}
| ${mission.get("spaceNum")}
| ${itemlist2wiki(mission.get("displayDropItem"), false, { text: "" })}
| ${itemlist2wiki(mission.get("displayExtraDropItem"), false, { text: "" })}
| ${express}`;
		}
		str += `\n|}`;
		TavernMissionOut.push(str);
	}
}
fs.writeFile(path.join(WIKI_PATH, "TavernMission.txt"), TavernMissionOut.join("\n\n"), { encoding: 'utf8' });

function tavernTime(time: number) {
	let str = ``;
	if (time >= 60) {
		str += `${Math.floor(time / 60)}小時`;
		time %= 60;
	}
	if (time > 0) {
		str += `${time}分鐘`;
	}
	return str;
}
function tavernReqSkillIcon(category: string) {
	switch (category) {
		case "ReturnToZero":
			return "{{系統圖標|任務骷顱頭|24px}}";
		case "ReduceTime":
			return "{{系統圖標|任務時鐘|24px}}";
		case "Normal":
			return "";
	}
	return "";
}

const HomelandMonsterOut: string[] = [];
HomelandMonsterOut.push(`{| class="wikitable"
|-
! 站位
! 名稱
! style="width: 20%" | 說明
! 技能1
! 技能2<br/><small>5星解鎖</small>
! 特長1<br/><small>3星解鎖</small>
! 特長2<br/><small>7星解鎖</small>`);
const monsterIds = arrayUnique(HomelandMonsterTable.rows.map(r => r.get("monsterId")));
for (let i = 0; i < monsterIds.length; i++) {
	const monsterId = monsterIds[i];
	const monsters = HomelandMonsterTable.filter(r => r.get("monsterId") == monsterId);
	const monsterFirst = monsters[0];
	const name = localizationCharacterName()(monsterFirst.get("keyName")) || monsterFirst.get("keyName");

	const speciality1s = arrayUnique(monsters.map(r => r.get("speciality1"))).map(n => `rank ${monsters.filter(r => r.get("speciality1") == n).map(r => r.get("rank")).join(", ")}:<br/>${abilityDrop(n)}`).join(`\n----\n`);
	const speciality2s = arrayUnique(monsters.map(r => r.get("speciality2"))).map(n => `rank ${monsters.filter(r => r.get("speciality2") == n).map(r => r.get("rank")).join(", ")}:<br/>${abilityDrop(n)}`).join(`\n----\n`);

	const str = `|-
| {{站位圖標|${gbw()(monsterFirst.get("monsterType"))}位}}
| style="text-align: center; width: 70px;" | [[檔案:${name}_Mob.png|70px]]<br/>[[${name}]]
| ${localizationString("MonsterInfo")(monsterFirst.get("monsterDescKey"))}
| ${abilityDrop(monsterFirst.get("skill1"))}
| ${abilityDrop(monsterFirst.get("skill2"))}
| ${speciality1s}
| ${speciality2s}`;
	HomelandMonsterOut.push(str);
}
HomelandMonsterOut.push(`|}`);
fs.writeFile(path.join(WIKI_PATH, "HomelandMonster.txt"), HomelandMonsterOut.join("\n"), { encoding: 'utf8' });

function abilityDrop(groupId: string) {
	const entries = AbilityDropTable.filter(r => r.get("groupId") == groupId);
	const weightCount = entries.reduce((prev, cur) => prev + Number(cur.get("weight")), 0);
	return entries.map(r => {
		let str = "";
		switch (r.get("type")) {
			case "Skill":
				str = localizationMonsterSkillName()(r.get("abilityId"));
				break;
			case "Speciality":
				str = localizationMonsterSpecialityName()(r.get("abilityId"));
				break;
		}
		str = `[[檔案:${str}_Icon.png|24px]] ${str}`;
		if (weightCount && r.get("weight") != weightCount) {
			str += `：${Math.floor(r.get("weight") / weightCount * 10000) / 100}%`;
		}
		return str;
	}).join("<br/>");
}

const TavernMissionDropOut: string[] = [];
const TavernMissionDropEnabled = TavernMissionDropTable.filter(r => gamedataString("TavernMission", "id", "enable")(r.get("missionId")) == "true");
const TavernMissionDropTypes = arrayUnique(TavernMissionDropEnabled.map(r => `${r.get("type")},${r.get("param1")},${r.get("param2")}`));
for (let i = 0; i < TavernMissionDropTypes.length; i++) {
	const type = TavernMissionDropTypes[i].split(",");
	let str = ``;
	switch (type[0]) {
		case "HomeLevel":
			str += `==冒險營地 Lv.${type[1]}==`;
			break;
		case "Building":
			str += `==${localizationHomelandBuildingName()(type[1])} Lv.${type[2]}==`;
			break;
		case "PlayerLevel":
			str += `==諦視者 Lv.${type[1]}==`;
			break;
		case "Normal":
			str += `==一般==`;
			break;
		case "Novice":
			str += `==新手==`;
			break;
	}
	str += `
{| class="wikitable"
! group !! 選擇數量 !! 任務 !! 出現機率`;
	const TavernMissionDropTyped = TavernMissionDropEnabled.filter(r => r.get("type") == type[0] && r.get("param1") == type[1] && r.get("param2") == type[2]);
	const groupIds = arrayUnique(TavernMissionDropTyped.map(r => r.get("groupId")));
	for (let j = 0; j < groupIds.length; j++) {
		const groupId = groupIds[j];
		const TavernMissionDropTypedGroupd = TavernMissionDropTyped.filter(r => r.get("groupId") == groupId);
		const choiceNumRow = TavernMissionDropTable.find(r => r.get("groupId") == groupId && r.get("choiceNum") != -1);
		const choiceNum = choiceNumRow ? Number(choiceNumRow.get("choiceNum")) : 1;
		const weightCount = TavernMissionDropTypedGroupd.reduce((prev, cur) => prev + Number(cur.get("weight")), 0) / choiceNum;
		for (let k = 0; k < TavernMissionDropTypedGroupd.length; k++) {
			const row = TavernMissionDropTypedGroupd[k];
			if (k == 0) {
				str += `
|-
| rowspan="${TavernMissionDropTypedGroupd.length}" | ${row.get("groupId")}
| rowspan="${TavernMissionDropTypedGroupd.length}" | ${choiceNum}`;
			}
			else {
				str += `\n|-`;
			}
			str += `
| ${localizationTavernMissionName(true)(row.get("missionId"))}
| ${Math.floor(row.get("weight") / weightCount * 10000) / 100}%`;
		}
	}
	str += `\n|}`;
	TavernMissionDropOut.push(str);
}
fs.writeFile(path.join(WIKI_PATH, "TavernMissionDrop.txt"), TavernMissionDropOut.join("\n\n"), { encoding: 'utf8' });

const TavernMissionCompactOut: string[] = [];
const TavernMissionDaily = TavernMissionTable.filter(r => r.get("tab") == "daily" && r.get("category") == "daily");
const TavernMissionDailyIds = TavernMissionDaily.map(r => r.get("id"));
const TavernMissionDropDaily = TavernMissionDropEnabled.filter(r => TavernMissionDailyIds.indexOf(r.get("missionId")) != -1 && r.get("type") == "Building" && r.get("param1") == 2 && gamedataString("TavernMission", "id", "questRank")(r.get("missionId")) == r.get("param2"));
const TavernMissionDropDailyTypes = arrayUnique(TavernMissionDropDaily.map(r => `${r.get("type")},${r.get("param1")},${r.get("param2")}`));
TavernMissionCompactOut.push(`==[[File:冒險任務_每日任務_Icon.png|45px]] 每日任務==`);
for (let i = 0; i < TavernMissionDropDailyTypes.length; i++) {
	const type = TavernMissionDropDailyTypes[i].split(",");
	let isPrintHeader = false;
	let str = "";
	const TavernMissionDropTyped = TavernMissionDropDaily.filter(r => r.get("type") == type[0] && r.get("param1") == type[1] && r.get("param2") == type[2]);
	const maxReqSkillCount = Math.max(1, ...TavernMissionDropTyped.map(r1 => {
		const reqSkill = TavernMissionRequireTable.filter(r2 => r2.get("missionId") == r1.get("missionId"));
		return reqSkill.length;
	}));
	const groupIds = arrayUnique(TavernMissionDropTyped.map(r => r.get("groupId")));
	for (let j = 0; j < groupIds.length; j++) {
		const groupId = groupIds[j];
		const TavernMissionDropTypedGroupd = TavernMissionDropTyped.filter(r => r.get("groupId") == groupId);
		for (let k = 0; k < TavernMissionDropTypedGroupd.length; k++) {
			const row = TavernMissionDropTypedGroupd[k];
			const missionId = row.get("missionId");
			const mission = TavernMissionTable.find(r => r.get("id") == missionId);
			if (mission) {
				const missionName = localizationTavernMissionName()(missionId);
				const reqSkill = TavernMissionRequireTable.filter(r => r.get("missionId") == mission.get("id"));
				let reqHeroPosition = "";
				if (!mission.get("gold") || !mission.get("black") || !mission.get("white")) {
					if (mission.get("gold")) reqHeroPosition = `金`;
					else if (mission.get("black")) reqHeroPosition = `黑`;
					else if (mission.get("white")) reqHeroPosition = `白`;
				}
				const sameDropItem = !TavernMissionDropTypedGroupd.find(r1 => {
					const m1 = TavernMissionTable.find(r2 => r2.get("id") == r1.get("missionId"));
					if (m1) {
						return m1.get("displayDropItem") != mission.get("displayDropItem");
					}
					return true;
				});
				const sameExtraDropItem = !TavernMissionDropTypedGroupd.find(r1 => {
					const m1 = TavernMissionTable.find(r2 => r2.get("id") == r1.get("missionId"));
					if (m1) {
						return m1.get("displayExtraDropItem") != mission.get("displayExtraDropItem");
					}
					return true;
				});

				if (!isPrintHeader) {
					isPrintHeader = true;
					str += `===${localizationHomelandBuildingName()(type[1])} ${type[2]} 級【${type[2]} ★】===
{| class="wikitable table-responsive-autowrap"
! 類型 !! 任務
! colspan="${maxReqSkillCount}" | 所需技能
! 基礎獎勵 !! 額外獎勵`;
				}

				str += `\n|-`;

				if (k == 0) {
					str += `\n| rowspan="${TavernMissionDropTypedGroupd.length}" style="text-align: center;" | [[檔案:冒險任務_${tavernCategoryName(missionName)}_Icon.png|40px]]<br/>${tavernCategoryName(missionName)}`;
				}

				str += `
| ${reqHeroPosition ? `{{站位圖標|${reqHeroPosition}|size=24px}} ` : ""}${localizationTavernMissionName()(row.get("missionId"))}
| ${reqSkill.length > 0 ? reqSkill.map(r => `{{狀態圖示|${localizationMonsterSkillName()(r.get("skillId"))}|24px|層數=${r.get("skillLv")}}}${tavernReqSkillIcon(r.get("category"))}`).join(" || ") : ""}${Array(maxReqSkillCount - reqSkill.length + 1).join(" || ")}`;

				if (sameDropItem) {
					if (k == 0) {
						str += `\n| rowspan="${TavernMissionDropTypedGroupd.length}" | ${itemlist2wiki(mission.get("displayDropItem"), false, { text: "" })}`;
					}
				}
				else {
					str += `\n| ${itemlist2wiki(mission.get("displayDropItem"), false, { text: "" })}`;
				}

				if (sameExtraDropItem) {
					if (k == 0) {
						str += `\n| rowspan="${TavernMissionDropTypedGroupd.length}" | ${itemlist2wiki(mission.get("displayExtraDropItem"), false, { text: "" })}`;
					}
				}
				else {
					str += `\n| ${itemlist2wiki(mission.get("displayExtraDropItem"), false, { text: "" })}`;
				}
			}
		}
	}
	str += `\n|}`;
	TavernMissionCompactOut.push(str);
}
const TavernMissionAchievement = TavernMissionTable.filter(r => r.get("tab") == "achievement" && r.get("category") == "achievement");
const TavernMissionAchievementIds = TavernMissionAchievement.map(r => r.get("id"));
const TavernMissionDropAchievement = TavernMissionDropEnabled.filter(r => TavernMissionAchievementIds.indexOf(r.get("missionId")) != -1);
const TavernMissionDropAchievementTypes = arrayUnique(TavernMissionDropAchievement.map(r => r.get("type") == "Building" ? `${r.get("type")},${r.get("param1")}` : r.get("type")));
TavernMissionCompactOut.push(`==[[File:冒險任務_成長任務_Icon.png|45px]] 成長任務==`);
for (let i = 0; i < TavernMissionDropAchievementTypes.length; i++) {
	const type = TavernMissionDropAchievementTypes[i].split(",");
	const TavernMissionDropTyped = TavernMissionDropAchievement.filter(r => r.get("type") == type[0] && (type.length < 2 || r.get("param1") == type[1]));
	const maxReqSkillCount = Math.max(1, ...TavernMissionDropTyped.map(r1 => {
		const reqSkill = TavernMissionRequireTable.filter(r2 => r2.get("missionId") == r1.get("missionId"));
		return reqSkill.length;
	}));
	let typeName = "";
	switch (type[0]) {
		case "HomeLevel":
			typeName = "冒險營地";
			break;
		case "Building":
			typeName = localizationHomelandBuildingName()(type[1]);
			break;
		case "PlayerLevel":
			typeName = `諦視者`;
			break;
	}
	let str = `===${typeName}===
{| class="wikitable table-responsive-autowrap"
! 類型 !! ${typeName} !! 星級 !! 任務
! colspan="${maxReqSkillCount}" | 所需技能
! 基礎獎勵 !! 額外獎勵`;
	for (let k = 0; k < TavernMissionDropTyped.length; k++) {
		const row = TavernMissionDropTyped[k];
		const missionId = row.get("missionId");
		const mission = TavernMissionTable.find(r => r.get("id") == missionId);
		if (mission) {
			const missionName = localizationTavernMissionName()(missionId);
			const reqSkill = TavernMissionRequireTable.filter(r => r.get("missionId") == mission.get("id"));
			let reqHeroPosition = "";
			if (!mission.get("gold") || !mission.get("black") || !mission.get("white")) {
				if (mission.get("gold")) reqHeroPosition = `金`;
				else if (mission.get("black")) reqHeroPosition = `黑`;
				else if (mission.get("white")) reqHeroPosition = `白`;
			}

			if (k == 0) {
				str += `
|-
| rowspan="${TavernMissionDropTyped.length}" style="text-align: center;" | [[檔案:冒險任務_${tavernCategoryName(missionName)}_Icon.png|40px]]<br/>${tavernCategoryName(missionName)}`;
			}
			else {
				str += `\n|-`;
			}
			str += `
| Lv ${row.get("param2") == -1 ? row.get("param1") : row.get("param2")} || ${mission.get("questRank")} ★
| ${reqHeroPosition ? `{{站位圖標|${reqHeroPosition}|size=24px}} ` : ""}${localizationTavernMissionName()(row.get("missionId"))}
| ${reqSkill.length > 0 ? reqSkill.map(r => `{{狀態圖示|${localizationMonsterSkillName()(r.get("skillId"))}|24px|層數=${r.get("skillLv")}}}${tavernReqSkillIcon(r.get("category"))}`).join(" || ") : ""}${Array(maxReqSkillCount - reqSkill.length + 1).join(" || ")}
| ${itemlist2wiki(mission.get("displayDropItem"), false, { text: "" })}
| ${itemlist2wiki(mission.get("displayExtraDropItem"), false, { text: "" })}`;
		}
	}
	str += `\n|}`;
	TavernMissionCompactOut.push(str);
}
fs.writeFile(path.join(WIKI_PATH, "TavernMissionCompact.txt"), TavernMissionCompactOut.join("\n\n"), { encoding: 'utf8' });

function tavernCategoryName(missionName: string) {
	if (missionName.indexOf("田野調查") != -1) {
		return "田野調查";
	}
	if (missionName.indexOf("營地巡邏") != -1) {
		return "營地巡邏";
	}
	if (missionName.indexOf("材料收集") != -1) {
		return "材料收集";
	}
	if (missionName.indexOf("戰鬥訓練") != -1) {
		return "戰鬥訓練";
	}
	if (missionName.indexOf("糧食儲備") != -1) {
		return "糧食儲備";
	}
	if (missionName.indexOf("秘境") != -1) {
		return "秘境";
	}
	if (missionName.indexOf("區域探勘") != -1) {
		return "區域探勘";
	}
	if (missionName.indexOf("擴建計畫") != -1) {
		return "發展";
	}
	if (missionName.indexOf("精進計畫") != -1) {
		return "發展";
	}
}

const MonsterTrapDropItemsTable = DropItemsTable.filter(r => r.get("giveType") == "Monster");
const MonsterTrapGroupIds = arrayUnique(MonsterTrapDropItemsTable.map(r => r.get("groupId")));
const MonsterTrapOut: {
	items: Record<string, { weight: number, id: string }[]>,
	monsters: Record<string, Record<string, [string, string, string, string]>>,
	ability: Record<string, { weight: number, id: string }[]>,
} = {
	items: {},
	monsters: {},
	ability: {},
};
for (let i = 0; i < MonsterTrapGroupIds.length; i++) {
	const groupId = MonsterTrapGroupIds[i];
	const itemId = gamedataString("ExploreItems", "effectValue", "id")(groupId);
	const itemName = localizationItemName(true)(itemId);
	if (itemName) {
		const group = MonsterTrapDropItemsTable.filter(r => r.get("groupId") == groupId);
		MonsterTrapOut.items[itemName] = group.map(r => {
			const monster = HomelandMonsterTable.find(mr => mr.get("id") == r.get("giveLinkId"));
			let id = r.get("giveLinkId");
			if (monster) {
				const monsterName = localizationCharacterName()(monster.get("keyName"));
				const rank = monster.get("rank");
				id = `${monsterName}:${rank}`;
				if (!MonsterTrapOut.monsters[monsterName]) {
					MonsterTrapOut.monsters[monsterName] = {};
				}
				MonsterTrapOut.monsters[monsterName][rank] = [monster.get("skill1"), monster.get("skill2"), monster.get("speciality1"), monster.get("speciality2")];
				for (let j = 0; j < MonsterTrapOut.monsters[monsterName][rank].length; j++) {
					const k = MonsterTrapOut.monsters[monsterName][rank][j];
					MonsterTrapOut.ability[k] = [];
				}
			}
			return {
				weight: r.get("value"),
				id: id,
			};
		});
	}
}
const AbilityGroupIds = Object.keys(MonsterTrapOut.ability);
for (let i = 0; i < AbilityGroupIds.length; i++) {
	const groupId = AbilityGroupIds[i];
	const group = AbilityDropTable.filter(r => r.get("groupId") == groupId);
	MonsterTrapOut.ability[groupId] = group.map(r => ({
		weight: r.get("weight"),
		id: r.get("type") == "Skill" ? localizationMonsterSkillName()(r.get("abilityId")) : localizationMonsterSpecialityName()(r.get("abilityId")),
	}));
}
outJson(path.join(WIKI_PATH, "MonsterTrap.json"), MonsterTrapOut);

let TreasureItemsOut = `{| class="wikitable" style="width: 100%;"
! id !! 名稱
! style="width: 30%;" | 說明 !! 圖示
! style="width: 35%;" | 寶箱內容`;
for (const item of Item.getAll().filter(item => item.category == ItemCategory.Treasure)) {
	TreasureItemsOut += `
|-
| ${item.id}
| ${item.toWiki()}
| ${wikiNextLine(item.description)}
| ${item.iconKey}
| ${item.getWikiTreasureList('')}`;
}
TreasureItemsOut += "\n|}";
fs.writeFile(path.join(WIKI_PATH, "TreasureItems.txt"), TreasureItemsOut, { encoding: 'utf8' });

const rewardGroupIds = arrayUnique(RewardGroupsTable.rows.map(r => r.get("rewardGroupId")));
const RewardGroupsOut: string[] = [];
for (let i = 0; i < rewardGroupIds.length; i++) {
	const rewardGroupId = rewardGroupIds[i];
	const items = RewardGroupsTable.filter(r => r.get("rewardGroupId") == rewardGroupId);
	const targetItems = arrayUnique(items.map(r => r.get("targetItemId")));

	const chapters = Chapter.getAll().filter(ch => ch.rewardGroupId == rewardGroupId);
	const note = items.map(r => r.get("note")).filter(note => !!note).join(", ");
	const title = (chapters.length == 1 ? `${chapters[0].getWikiTitle()} (${note})` : note) || rewardGroupId;
	let str = `== ${title} ==
${chapters.map(chapter => `\n* [[${chapter.getWikiTitle()}]]`).join('')}`;

	for (let j = 0; j < targetItems.length; j++) {
		const targetItem = targetItems[j];
		const rewardItems = items.filter(r => r.get("targetItemId") == targetItem);
		str += `\n{| class="wikitable mw-collapsible mw-collapsed"
! colspan=2 | ${item2wiki(targetItem)}
|-
! 累計數量 !! 獎勵`;
		for (let k = 0; k < rewardItems.length; k++) {
			const reward = rewardItems[k];
			const targetCount = reward.get("targetCount");
			const rewardType = reward.get("giveType");
			const rewardItemId = reward.get("giveLinkId");
			const rewardCount = reward.get("giveAmount");
			str += `\n|-
| style="text-align: center" | ${targetCount}
| ${item2wikiWithType(rewardType, rewardItemId, rewardCount)}`;
		}
		str += `\n|}`;
	}
	RewardGroupsOut.push(str);
}
fs.writeFile(path.join(WIKI_PATH, "RewardGroups.txt"), RewardGroupsOut.join("\n\n"), { encoding: 'utf8' });

const SignInRewardGroupIds = arrayUnique(SignInRewardTable.rows.map(r => r.get("groupId")));
const SignInRewardOut: string[] = [
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
	SignInRewardOut.push(str);
}
fs.writeFile(path.join(WIKI_PATH, "SignInReward.txt"), SignInRewardOut.join("\n\n"), { encoding: 'utf8' });

const playerMaxLv = getConstants()('playerMaxLv');
const subrankMax = getConstants()('subrankMax');

let ResonanceOut = `==共鳴所需道具數量==

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
		ResonanceOut += `\n|-\n! ${privRankName}<br/>➡️<br/>${currRankName}`;
	} else {
		ResonanceOut += `\n|-\n! +${rank1}`;
		SubRankUpItemCount['1002'] = (SubRankUpItemCount['1002'] || 0) + row.get('coin');
		if (item1) SubRankUpItemCount[item1.get('payLinkId')] = (SubRankUpItemCount[item1.get('payLinkId')] || 0) + row.get('item1Count');
		if (item2) SubRankUpItemCount[item2.get('payLinkId')] = (SubRankUpItemCount[item2.get('payLinkId')] || 0) + row.get('item2Count');
		if (item3) SubRankUpItemCount[item3.get('payLinkId')] = (SubRankUpItemCount[item3.get('payLinkId')] || 0) + row.get('item3Count');
		if (item4) SubRankUpItemCount[item4.get('payLinkId')] = (SubRankUpItemCount[item4.get('payLinkId')] || 0) + row.get('item4Count');
		if (item5) SubRankUpItemCount[item5.get('payLinkId')] = (SubRankUpItemCount[item5.get('payLinkId')] || 0) + row.get('item5Count');
		if (ext1) SubRankUpItemCount[ext1.get('payLinkId')] = (SubRankUpItemCount[ext1.get('payLinkId')] || 0) + row.get('ext1Count');
	}
	ResonanceOut += `
| style="background-color: #ffd700;" | ${item2wiki('1002', row.get('coin'), false, ResonanceItemOptions)}
| ${item4 && row.get('item4Ref') != 'CommonD' ? item2wikiWithType(item4.get('payType'), item4.get('payLinkId'), row.get('item4Count'), ResonanceItemOptions) : '-'}
| ${item2 ? item2wikiWithType(item2.get('payType'), item2.get('payLinkId'), row.get('item2Count'), ResonanceItemOptions) : '-'}
| ${item1 ? item2wikiWithType(item1.get('payType'), item1.get('payLinkId'), row.get('item1Count'), ResonanceItemOptions) : '-'}
| ${item3 ? item2wikiWithType(item3.get('payType'), item3.get('payLinkId'), row.get('item3Count'), ResonanceItemOptions) : '-'}
| ${item4 && row.get('item4Ref') == 'CommonD' ? item2wikiWithType(item4.get('payType'), item4.get('payLinkId'), row.get('item4Count'), ResonanceItemOptions) : item5 && row.get('item5Ref') == 'CommonD' ? item2wikiWithType(item5.get('payType'), item5.get('payLinkId'), row.get('item5Count'), ResonanceItemOptions) : '-'}
| style="background-color: #00ffff;" | ${ext1 ? item2wikiWithType(ext1.get('payType'), ext1.get('payLinkId'), row.get('ext1Count'), ResonanceItemOptions) : '-'}`;
}
ResonanceOut += `
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
	ResonanceOut += `
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
ResonanceOut += `\n|}

''註：本表以[[安潔莉亞]]共鳴道具為例，不同角色可能需要不同的道具。''`;
fs.writeFile(path.join(WIKI_PATH, "Resonance.txt"), ResonanceOut, { encoding: 'utf8' });

const voiceData: {
	model: string;
	skillSet: HeroSkillSet;
	hero: Hero;
	info: string[];
	select: string[];
	start: string[];
	victory: string[];
	groupKey: string;
}[] = [];
let CharVoiceOut: string = `{| class="wikitable" style="word-break: break-all;"
! 角色階級 !! 魂冊語音 !! 選擇角色語音 !! 出戰語音 !! 勝利語音`;
for (const infoVoice of CharaInfoVoiceTable) {
	const model = infoVoice.get('prefabId');
	const skillSet = HeroSkillSet.getByModel(model);
	const hero = skillSet?.hero;
	if (skillSet && hero) {
		const selectVoice = CharaSelectVoiceTable.find(row => row.get('prefabId') == model);
		const victoryVoice = CharaVictoryVoiceTable.find(row => row.get('prefabId') == model);
		const info: string[] = [
			infoVoice.get('sfxCharaInfo01'),
			infoVoice.get('sfxCharaInfo02'),
			infoVoice.get('sfxCharaInfo03'),
			infoVoice.get('sfxCharaInfo04'),
			infoVoice.get('sfxCharaInfo05'),
		].filter(s => s);
		const select: string[] = [
			selectVoice?.get('sfxCharaSelect01'),
			selectVoice?.get('sfxCharaSelect02'),
			selectVoice?.get('sfxCharaSelect03'),
		].filter(s => s);
		const start: string[] = [
			selectVoice?.get('sfxStart01'),
			selectVoice?.get('sfxStart02'),
		].filter(s => s);
		const victory: string[] = [
			victoryVoice?.get('sfxVictory01'),
			victoryVoice?.get('sfxVictory02'),
			victoryVoice?.get('sfxVictory03'),
			victoryVoice?.get('sfxVictory04'),
			victoryVoice?.get('sfxVictory05'),
		].filter(s => s);

		voiceData.push({
			model,
			skillSet,
			hero,
			info,
			select,
			start,
			victory,
			groupKey: `${info}${select}${start}${victory}`
		});

	}
}
const voiceGroupedData = arrayGroupBy(voiceData, v => v.groupKey);
for (const voices of Object.values(voiceGroupedData)) {
	const groupedHeros = Object.values(arrayGroupBy(voices, v => v.hero.id));
	CharVoiceOut += `
|-
| ${wikiNextLine(groupedHeros.map(h => `${h[0].hero.toWikiSmallIcon()} (${h.map(s => s.skillSet.rank).join(', ')})`).join(',\n'))}
| ${wikiNextLine(voices[0].info.join(',\n'))}
| ${wikiNextLine(voices[0].select.join(',\n'))}
| ${wikiNextLine(voices[0].start.join(',\n'))}
| ${wikiNextLine(voices[0].victory.join(',\n'))}`;
}
CharVoiceOut += `\n|}`;
fs.writeFile(path.join(WIKI_PATH, "CharVoice.txt"), CharVoiceOut, { encoding: 'utf8' });

function wrapHiddenDiv(content: string) {
	return `<div class="accountcreator-show">\n${content}\n</div>`;
}

getMWBot().then(async (bot) => {
	await bot.editOnDifference('使用者:小飄飄/wiki/AdvAchievements', wrapHiddenDiv(AdvAchievementsOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/Adventure', wrapHiddenDiv(advOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/AdventureRank', wrapHiddenDiv(AdventureRankOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/Avatars', wrapHiddenDiv(AvatarsOut));
	await bot.editOnDifference('使用者:小飄飄/wiki/Chapter', wrapHiddenDiv(chapterOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/CharVoice', wrapHiddenDiv(CharVoiceOut));
	await bot.editOnDifference('使用者:小飄飄/wiki/ExploreBuilding', wrapHiddenDiv(ExploreBuildingOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/ExploreComposite', wrapHiddenDiv(ExploreCompositeOut.join("\n\n------------------------------\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/ExploreItems', wrapHiddenDiv(ExploreItemOut));
	await bot.editOnDifference('使用者:小飄飄/wiki/Gashapons', wrapHiddenDiv(GashaponsOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/Heroes', wrapHiddenDiv(heroPageOut.join("\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/HomelandBuilding', wrapHiddenDiv(HomelandBuildingOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/HomelandMonster', wrapHiddenDiv(HomelandMonsterOut.join("\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/LevelUps', wrapHiddenDiv(LevelUpsOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/Missions', wrapHiddenDiv(MissionsOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/Resonance', wrapHiddenDiv(ResonanceOut));
	await bot.editOnDifference('使用者:小飄飄/wiki/RewardGroups', wrapHiddenDiv(RewardGroupsOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/SideStory', wrapHiddenDiv(SideStoryOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/SignInReward', wrapHiddenDiv(SignInRewardOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/Store', wrapHiddenDiv(storeOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/TavernMission', wrapHiddenDiv(TavernMissionOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/TavernMissionCompact', wrapHiddenDiv(TavernMissionCompactOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/TavernMissionDrop', wrapHiddenDiv(TavernMissionDropOut.join("\n\n")));
	await bot.editOnDifference('使用者:小飄飄/wiki/TreasureItems', wrapHiddenDiv(TreasureItemsOut));

	await bot.editOnDifference('模板:Tips', TipsOut.join("\n"));

	if (playerMaxLv) {
		// await bot.editOnDifference('模板:Constant/MaxLevel', `${playerMaxLv}<noinclude>{{Documentation}}</noinclude>`);
	}
	if (subrankMax) {
		// await bot.editOnDifference('模板:Constant/MaxResonanceLevel', `${subrankMax}<noinclude>{{Documentation}}</noinclude>`);
	}

	await bot.editOnDifference('使用者:小飄飄/bot/MonsterTrap.json', JSON.stringify(MonsterTrapOut, undefined, '    '));
	await bot.editOnDifference('使用者:小飄飄/bot/Gashapons.json', JSON.stringify(GashaponsJson, undefined, '    '));
	await bot.editOnDifference('使用者:小飄飄/bot/Heroes.json', JSON.stringify(heroJsonOut, undefined, '    '));
}).catch((err) => {
	console.error(err);
	debugger;
});
