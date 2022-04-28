import { HeroSkillSet } from './model/hero-skillset';
import { ImperiumData } from "./imperium-data";
import { black, call2, colonFirst, Func1, gamedataString, gold, ifor, localizationBuffName, localizationChapterName, localizationCharacterName, localizationCharacterNameByHeroId, localizationCharacterNameWithDefault, localizationExploreBuildingName, localizationHomelandBuildingName, localizationItemName, localizationItemNameWithType, localizationMonsterName, localizationMonsterSkillName, localizationMonsterSpecialityName, localizationQuestName, localizationString, localizationStringAuto, localizationTavernMissionName, localizationUnlockCondition, rank, semicolon, weekday, white } from "./localization";
import { Logger } from "./logger";
import { ItemCategory } from './model/enums/item-category.enum';
import { Item } from './model/item';
import { exploreLabelName } from "./wiki-item";
import { cloneDeep } from 'lodash';

const logger = new Logger('gamedata-translate');

export interface GamedataRef {
	table: string;
	column: string;
	func: Func1;
}

export const gamedataTeanslateSettings: GamedataRef[] = [
	{
		table: "AdvAchievements",
		column: "id",
		func: localizationString("Adventure", "achi_title_"),
	},
	{
		table: "AdvAchievements",
		column: "tab",
		func: localizationString("Adventure"),
	},
	{
		table: "AdvAchievements",
		column: "rewardItemId",
		func: localizationItemName(),
	},
	{
		table: "AdventureAchievements",
		column: "giveLinkId:giveType",
		func: localizationItemNameWithType(),
	},
	{
		table: "AdventureAchievements",
		column: "tab",
		func: localizationString("Adventure"),
	},
	{
		table: "AdventureTier",
		column: "giveLinkId1:giveType1,giveLinkId2:giveType2,giveLinkId3:giveType3,giveLinkId4:giveType4",
		func: localizationItemNameWithType(),
	},
	{
		table: "AdventureTier",
		column: "rankName",
		func: localizationString("Adventure"),
	},
	{
		table: "AdventureTier",
		column: "rank,nextRank",
		func: localizationString("Adventure", "tier_rank"),
	},
	{
		table: "AdventureDailyRank",
		column: "item1Id,item2Id,item3Id,item4Id",
		func: localizationItemName(),
	},
	{
		table: "AdventureWeekPoint",
		column: "item1Id,item2Id,item3Id,item4Id",
		func: localizationItemName(),
	},
	{
		table: "AdventureWeekRank",
		column: "item1Id,item2Id,item3Id,item4Id",
		func: localizationItemName(),
	},
	{
		table: "AdventureRule",
		column: "id",
		func: localizationString("ScoreMessage", (s) => s + "_title"),
	},
	{
		table: "ScoreRules",
		column: "id",
		func: localizationString("ScoreMessage", (s) => s + "_title"),
	},
	{
		table: "Avatars",
		column: "id",
		func: localizationString("Avatars"),
	},
	{
		table: "FreeHeroes",
		column: "skillSetIds",
		func: semicolon(localizationString("HeroSkills", "skill_set_")),
	},
	{
		table: "FreeHeroes",
		column: "rank",
		func: rank(),
	},
	{
		table: "FreeHeroes",
		column: "heroId",
		func: gamedataString("Heroes", "id", "name"),
	},
	{
		table: "FreeHeroes",
		column: "chapterIds",
		func: semicolon(call2(gamedataString("Chapters", "id", "title"), localizationString("RegionName"))),
	},
	{
		table: "Heroes",
		column: "storyChapter",
		func: call2(gamedataString("Chapters", "id", "title"), localizationString("RegionName")),
	},
	{
		table: "Heroes",
		column: "white",
		func: white(),
	},
	{
		table: "Heroes",
		column: "black",
		func: black(),
	},
	{
		table: "Heroes",
		column: "gold",
		func: gold(),
	},
	{
		table: "Chapters",
		column: "requireQuestId",
		func: localizationQuestName(),
	},
	{
		table: "Chapters",
		column: "param1:visibleCondition,param2:unlockCondition",
		func: localizationUnlockCondition(),
	},
	{
		table: "CharaInfoVoice",
		column: "prefabId",
		func: localizationCharacterName(),
	},
	{
		table: "CharaSelectVoice",
		column: "prefabId",
		func: localizationCharacterName(),
	},
	{
		table: "CharaVictoryVoice",
		column: "prefabId",
		func: localizationCharacterName(),
	},
	{
		table: "CharaRankUpVoice",
		column: "prefabId",
		func: localizationCharacterName(),
	},
	{
		table: "Quests",
		column: "requireQuestId",
		func: localizationQuestName(),
	},
	{
		table: "Quests",
		column: "chapter",
		func: call2(gamedataString("Chapters", "id", "title"), localizationString("RegionName")),
	},
	{
		table: "Quests",
		column: "levelId",
		func: localizationString("QuestName"),
	},
	{
		table: "Quests",
		column: "questLocation",
		func: localizationString("POIName"),
	},
	{
		table: "Quests",
		column: "extraSettingId",
		func: gamedataString("QuestExtraSettings", "id", "name"),
	},
	{
		table: "Quests",
		column: "displayDropTextFirst,displayDropText",
		func: localizationStringAuto(),
	},
	{
		table: "Quests",
		column: "displayDropItemFirst,displayDropItem",
		func: semicolon(colonFirst(localizationItemName())),
	},
	{
		table: "Chapters",
		column: "name,title",
		func: localizationString("RegionName"),
	},
	{
		table: "Chapters",
		column: "weekday",
		func: weekday(),
	},
	{
		table: "Chapters",
		column: "extraCountItem",
		func: localizationItemName(),
	},
	{
		table: "DropItems",
		column: "giveLinkId:giveType",
		func: localizationItemNameWithType(),
	},
	{
		table: "DropItems",
		column: "groupId",
		func: (str) => {
			const ItemsTable = ImperiumData.fromGamedata().getTable("Items");
			const item = ItemsTable.find(r => r.get("category") == "Treasure" && r.get("effectValue") == str);
			if (item) {
				return "Item: " + localizationItemName()(item.get("id"));
			}

			const ExploreItemsTable = ImperiumData.fromGamedata().getTable("ExploreItems");
			const expitem = ExploreItemsTable.find(r => r.get("category") == "Treasure" && r.get("effectValue") == str);
			if (expitem) {
				return "ExploreItem: " + localizationItemName(true)(expitem.get("id"));
			}

			const TavernMissionTable = ImperiumData.fromGamedata().getTable("TavernMission");
			const mission = TavernMissionTable.find(r => r.get("dropItem") == str || r.get("extraDropItem") == str);
			if (mission) {
				return "TavernMission: " + localizationTavernMissionName()(mission.get("id"));
			}
			return "";
		},
	},
	{
		table: "Gashapons",
		column: "itemId",
		func: localizationItemName(),
	},
	{
		table: "Gashapons",
		column: "packId",
		func: call2(gamedataString("GashaponPacks", "id", "name"), localizationStringAuto()),
	},
	{
		table: "GashaponPacks",
		column: "description,name",
		func: localizationStringAuto(),
	},
	{
		table: "GashaponPacks",
		column: "itemId,ticketItemId",
		func: localizationItemName(),
	},
	{
		table: "GashaponPacks",
		column: "linkId:giveType",
		func: localizationItemNameWithType(),
	},
	{
		table: "GuildBuilding",
		column: "descriptionKey,nameKey",
		func: localizationStringAuto(),
	},
	{
		table: "GuildBuilding",
		column: "productionItem",
		func: localizationItemName(),
	},
	{
		table: "HeroRanks",
		column: "heroId",
		func: gamedataString("Heroes", "id", "name"),
	},
	{
		table: "HeroRanks",
		column: "rank",
		func: rank(),
	},
	{
		table: "HeroRanks",
		column: "item1Id,item2Id,item3Id,item4Id,item5Id",
		func: localizationItemName(),
	},
	{
		table: "HeroRanks",
		column: "ext1LinkId:ext1Type,ext2LinkId:ext2Type,ext3LinkId:ext3Type,ext4LinkId:ext4Type,ext5LinkId:ext5Type",
		func: localizationItemNameWithType(),
	},
	{
		table: "HeroSkills",
		column: "heroId",
		func: gamedataString("Heroes", "id", "name"),
	},
	{
		table: "HeroSkills",
		column: "rank",
		func: rank(),
	},
	{
		table: "HeroSkills",
		column: "id",
		func: localizationString("HeroSkills", "skill_set_"),
	},
	{
		table: "Invitation",
		column: "rewardItemId",
		func: localizationItemName(),
	},
	{
		table: "Items",
		column: "localizationKeyDescription,localizationKeyName",
		func: localizationString("Item"),
	},
	{
		table: "Items",
		column: "sellLinkId:sellType",
		func: localizationItemNameWithType(),
	},
	{
		table: "Missions",
		column: "itemId",
		func: localizationItemName(),
	},
	{
		table: "Missions",
		column: "giveLinkId:giveType",
		func: localizationItemNameWithType(),
	},
	{
		table: "Missions",
		column: "requireId",
		func: gamedataString("Missions", "id", "name"),
	},
	{
		table: "QuestExtraSettings",
		column: "displayBonus2ppl,displayBonus3ppl",
		func: semicolon(colonFirst(localizationItemName())),
	},
	{
		table: "RewardGroups",
		column: "rewardItemId,targetItemId",
		func: localizationItemName(),
	},
	{
		table: "RewardGroups",
		column: "giveLinkId:giveType",
		func: localizationItemNameWithType(),
	},
	{
		table: "ServerList",
		column: "localizationKeyName",
		func: localizationString("ServerList"),
	},
	{
		table: "StoreItemGroups",
		column: "giveLinkId:giveType,linkId:payType",
		func: localizationItemNameWithType(),
	},
	{
		table: "TeamLimits",
		column: "idW,idB,idG,idSP1,idSP2",
		func: gamedataString("Heroes", "id", "name"),
	},
	{
		table: "TeamLimits",
		column: "rankW,rankB,rankG,rankSP1,rankSP2",
		func: rank(),
	},
	{
		table: "TeamLimits",
		column: "skillW,skillB,skillG,skillSP1,skillSP2",
		func: localizationString("HeroSkills", "skill_set_"),
	},
	{
		table: "ExtraProducts",
		column: "param1,param3",
		func: localizationItemName(),
	},
	{
		table: "ExtraProducts",
		column: "linkId:payType",
		func: localizationItemNameWithType(),
	},
	{
		table: "ExploreBuilding",
		column: "item1Id,item2Id,item3Id,item4Id",
		func: localizationItemName(true),
	},
	{
		table: "ExploreBuilding",
		column: "localizationKeyDescription",
		func: localizationString("ExploreBuilding"),
	},
	{
		table: "ExploreBuilding",
		column: "type",
		func: localizationExploreBuildingName(),
	},
	{
		table: "ExploreComposite",
		column: "item1Id,item2Id,item3Id,item4Id,itemId",
		func: localizationItemName(true),
	},
	{
		table: "ExploreComposite",
		column: "requireBuildingId",
		func: gamedataString("ExploreBuilding", "id", "type:level"),
	},
	// TODO:
	// {
	// 	table: "ExploreComposite",
	// 	column: "localizationKeyDescription",
	// 	func: localizationString("ExploreComposite"),
	// },
	{
		table: "ExploreItems",
		column: "localizationKeyDescription,localizationKeyName",
		func: localizationString("ExpItem"),
	},
	{
		table: "ExploreItems",
		column: "owner",
		func: localizationCharacterNameByHeroId(),
	},
	{
		table: "ExploreItems",
		column: "label",
		func: semicolon((str) => {
			return exploreLabelName[str] && exploreLabelName[str][0] || str;
		}),
	},
	{
		table: "sublimation",
		column: "item1Id,item2Id,item3Id,ItemID",
		func: localizationItemName(),
	},
	{
		table: "sublimation",
		column: "rank",
		func: rank(),
	},
	{
		table: "sublimation",
		column: "heroId",
		func: gamedataString("Heroes", "id", "name"),
	},
	{
		table: "TutorialDialog",
		column: "param",
		func: localizationString("Tutorial"),
	},
	{
		table: "HomelandBuilding",
		column: "linkId1:payType1,linkId2:payType2,linkId3:payType3",
		func: localizationItemNameWithType(),
	},
	{
		table: "HomelandBuilding",
		column: "nameKey",
		func: localizationString("Homeland"),
	},
	{
		table: "HomelandMonster",
		column: "keyName",
		func: localizationCharacterName(),
	},
	{
		table: "HomelandMonster",
		column: "monsterDescKey",
		func: localizationString("MonsterInfo"),
	},
	// TODO:
	// {
	// 	table: "HomelandMonster",
	// 	column: "skill1,skill2",
	// 	func: ,
	// },
	// {
	// 	table: "HomelandMonster",
	// 	column: "speciality1,speciality2,speciality3",
	// 	func: ,
	// },
	{
		table: "HomelandMonster",
		column: "linkId1:payType1,linkId2:payType2,linkId3:payType3",
		func: localizationItemNameWithType(),
	},
	{
		table: "HomelandMonster",
		column: "requireMob1Id,requireMob2Id,requireMob3Id,requireMob4Id,requireMob5Id",
		func: localizationMonsterName(),
	},
	{
		table: "MonsterSkill",
		column: "skillKeyName,skillKeyDescription",
		func: localizationString("MonsterSkill"),
	},
	{
		table: "MonsterSpeciality",
		column: "specialityKeyName,specialityKeyDescription",
		func: localizationString("MonsterSkill"),
	},
	{
		table: "TavernMission",
		column: "questKeyName,questKeyDescription",
		func: localizationString("TavernMission"),
	},
	{
		table: "TavernMission",
		column: "heroid",
		func: gamedataString("Heroes", "id", "name"),
	},
	{
		table: "TavernMission",
		column: "heroRank",
		func: rank(),
	},
	{
		table: "TavernMission",
		column: "white",
		func: white(),
	},
	{
		table: "TavernMission",
		column: "black",
		func: black(),
	},
	{
		table: "TavernMission",
		column: "gold",
		func: gold(),
	},
	{
		table: "TavernMission",
		column: "displayDropItem,displayExtraDropItem",
		func: semicolon(colonFirst(localizationItemName())),
	},
	{
		table: "TavernMissionDrop",
		column: "missionId",
		func: localizationTavernMissionName(),
	},
	{
		table: "TavernMissionDrop",
		column: "param1:type",
		func: (str) => {
			const strings = str.split(":");
			switch (strings[1]) {
				case "Building":
					return localizationHomelandBuildingName()(strings[0]);
			}
			return "";
		},
	},
	{
		table: "TavernMissionRequire",
		column: "missionId",
		func: localizationTavernMissionName(),
	},
	{
		table: "TavernMissionRequire",
		column: "skillId",
		func: localizationMonsterSkillName(),
	},
	{
		table: "AbilityDrop",
		column: "groupId",
		func: call2(ifor(gamedataString("HomelandMonster", "skill1", "keyName"), gamedataString("HomelandMonster", "skill2", "keyName"), gamedataString("HomelandMonster", "speciality1", "keyName"), gamedataString("HomelandMonster", "speciality2", "keyName"), gamedataString("HomelandMonster", "speciality3", "keyName")), localizationCharacterNameWithDefault()),
	},
	{
		table: "AbilityDrop",
		column: "abilityId:type",
		func: (str) => {
			const strings = str.split(":");
			switch (strings[1]) {
				case "Skill":
					return localizationMonsterSkillName()(strings[0]);
				case "Speciality":
					return localizationMonsterSpecialityName()(strings[0]);
			}
			return "";
		},
	},
	{
		table: "QuestMode",
		column: "modeI2",
		func: localizationStringAuto(),
	},
	{
		table: "SignInReward",
		column: "giveLinkId:giveType",
		func: localizationItemNameWithType(),
	},
	{
		table: "Volume",
		column: "name",
		func: localizationString("Metagame"),
	},
	{
		table: "Volume",
		column: "param1:visibleCondition,param2:unlockCondition",
		func: localizationUnlockCondition(),
	},
	{
		table: "BuildInAssetBundle",
		column: "effectValue:type",
		func: (str) => {
			const strings = str.split(":");
			switch (strings[1]) {
				case "Chapter":
					return localizationChapterName()(strings[0]);
				case "Hero":
					return localizationCharacterNameByHeroId()(strings[0]);
			}
			return "";
		},
	},
	{
		table: "RankUpItemRefs",
		column: "param1:category",
		func: (str) => {
			const strings = str.split(":");
			switch (strings[1]) {
				case "HeroID":
					return localizationCharacterNameByHeroId()(strings[0]);
			}
			return "";
		},
	},
	{
		table: "RankUpItemRefs",
		column: "payLinkId:payType",
		func: localizationItemNameWithType(),
	},
	{
		table: "SkillLevel",
		column: "pay1LinkId:pay1Type,pay2LinkId:pay2Type,pay3LinkId:pay3Type,pay4LinkId:pay4Type",
		func: localizationItemNameWithType(),
	},
	{
		table: "SkillLevel",
		column: "rootSkill",
		func: localizationString("HeroSkills", "skill_set_"),
	},
	{
		table: "SkillLevel",
		column: "ceilingSkill",
		func: localizationString("HeroSkills", "skill_set_"),
	},
	{
		table: "PaddingAssistants",
		column: "heroId",
		func: localizationCharacterNameByHeroId(),
	},
	{
		table: "PaddingAssistants",
		column: "rank",
		func: rank(),
	},
	{
		table: "PaddingAssistants",
		column: "skillIds",
		func: semicolon(localizationString("HeroSkills", "skill_set_")),
	},
	{
		table: "VoucherGifts",
		column: "giveLinkId:giveType",
		func: localizationItemNameWithType(),
	},
	{
		table: "VoucherGifts",
		column: "groupId",
		func: (str) => {
			const item = Item.find(item => item.category == ItemCategory.Voucher && item.effectValue == +str);
			return item?.name ?? '';
		},
	},
	{
		table: "AvgFlagUI",
		column: "titleKey,localizationKey",
		func: localizationString("FlagUI"),
	},
	{
		table: "ChapterCount",
		column: "name",
		func: localizationString("ChapterCount"),
	},
	{
		table: "ChapterCount",
		column: "linkId:payType,linkId2:payType2",
		func: localizationItemNameWithType(),
	},
	{
		table: "BattlefieldDropItems",
		column: "giveLinkId1:giveType1,giveLinkId2:giveType2,giveLinkId3:giveType3,giveLinkId4:giveType4",
		func: localizationItemNameWithType(),
	},
	{
		table: "LevelTriggerChapters",
		column: "titleKey,localizationKey",
		func: localizationString("LevelTriggerChapters"),
	},
	{
		table: "LevelTriggerChapters",
		column: "chapterId",
		func: localizationChapterName(),
	},
	{
		table: "DiligentGroups",
		column: "chapterId",
		func: localizationChapterName(),
	},
	{
		table: "DiligentGroups",
		column: "diligentId",
		func: localizationItemName(),
	},
	{
		table: "DiligentGroups",
		column: "diligentDescription",
		func: localizationString("Item"),
	},
	{
		table: "Diligents",
		column: "diligentI2Key",
		func: localizationString("Diligents"),
	},
	{
		table: "Diligents",
		column: "buffId",
		func: localizationBuffName(),
	},
	{
		table: "Diligents",
		column: "giveLinkId:giveType",
		func: localizationItemNameWithType(),
	},
	{
		table: "AdventureDailyRank",
		column: "giveLinkId1:giveType1,giveLinkId2:giveType2,giveLinkId3:giveType3,giveLinkId4:giveType4",
		func: localizationItemNameWithType(),
	},
	{
		table: "AdventureWeekPoint",
		column: "giveLinkId1:giveType1,giveLinkId2:giveType2,giveLinkId3:giveType3,giveLinkId4:giveType4",
		func: localizationItemNameWithType(),
	},
	{
		table: "AdventureWeekRank",
		column: "giveLinkId1:giveType1,giveLinkId2:giveType2,giveLinkId3:giveType3,giveLinkId4:giveType4",
		func: localizationItemNameWithType(),
	},
	{
		table: "BattlefieldRanks",
		column: "giveLinkId1:giveType1,giveLinkId2:giveType2,giveLinkId3:giveType3,giveLinkId4:giveType4",
		func: localizationItemNameWithType(),
	},
	{
		table: "RaidChapterSetting",
		column: "targetItemId",
		func: localizationItemName(),
	},
	{
		table: "RaidChapterSettings",
		column: "targetItemId",
		func: localizationItemName(),
	},
	{
		table: "Raids",
		column: "targetItemId",
		func: localizationItemName(),
	},
	{
		table: "SkillLabel",
		column: "skillSet",
		func: (str) => {
			const skillset = HeroSkillSet.getByModel(str);
			if (skillset) {
				return `${skillset.hero?.firstname} ${skillset.rankPlus} ${skillset.name}`
			}
			return "";
		},
	},
	{
		table: "SkillLabel",
		column: "casterBuff,enemyAssignBuff,enemyMultiBuff,enemySingleBuff,friendAssignBuff,friendMultiBuff,friendSingleBuff,stoneBuff",
		func: (str) => {
			const arr = str.split(",");
			return arr.map(localizationString("BaseBuff")).join(",");
		},
	},
	{
		table: "Evaluates",
		column: "giveLinkId1:giveType1,giveLinkId2:giveType2",
		func: localizationItemNameWithType(),
	},
	{
		table: "QuestAchievements",
		column: "giveLinkId1:giveType1",
		func: localizationItemNameWithType(),
	},
	{
		table: "RaidRanks",
		column: "giveLinkId1:giveType1,giveLinkId2:giveType2,giveLinkId3:giveType3",
		func: localizationItemNameWithType(),
	},
];

export function doGamedataTranslation() {
	const clonedGamedata = new ImperiumData("gamedata");
	clonedGamedata.setRawData(cloneDeep(ImperiumData.fromGamedata().getRawData()));

	gamedataTeanslateSettings.forEach((ref) => {
		const table = ImperiumData.fromGamedata().getTable(ref.table);
		const clonedTable = clonedGamedata.getTable(ref.table);
		if (!table || !clonedTable) {
			logger.debug(ref);
			debugger;
			return;
		}
		for (let i = 0; i < table.length; i++) {
			const row = table.get(i);
			const clonedRow = clonedTable.get(i);
			const columns = ref.column.split(",");
			columns.forEach(col => {
				const subcols = col.split(":");
				const data = subcols.map(c => row.get(c)).join(":");
				const result = ref.func.call(row, data);
				if (result) {
					clonedRow.set(subcols[0], `${row.get(subcols[0])} (${result})`);
				}
			});
		}
	});

	return clonedGamedata;
}
