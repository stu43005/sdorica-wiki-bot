const KEYS = ["id", "Key", "Chinese", "ChineseSimplified", "English", "Japanese", "Korean"];

const TABLE_KEYS: Record<string, string[]> = {
	AbilityDrop: ["groupId", "abilityId", "type", "weight"],
	AdventureDailyRank: ["id", "groupId", "image", "maxPercentage", "minPercentage",
		"item1Id", "reward1Count", "item2Id", "reward2Count", "item3Id", "reward3Count", "item4Id", "reward4Count"],
	AdventureWeekPoint: ["id", "groupId", "points", "item1Id", "reward1Count", "item2Id", "reward2Count", "item3Id", "reward3Count", "item4Id", "reward4Count"],
	AdventureWeekRank: ["id", "groupId", "image", "maxRanking", "minRanking", "showRanking",
		"item1Id", "reward1Count", "item2Id", "reward2Count", "item3Id", "reward3Count", "item4Id", "reward4Count"],
	AdventureTier: [
		"id",
		"groupId", "rankName", "image",
		"rank", "nextRank",
		"displayBar",
		"maxPercentage", "minPercentage",
		"giveType1", "giveLinkId1", "giveAmount1",
		"giveType2", "giveLinkId2", "giveAmount2",
		"giveType3", "giveLinkId3", "giveAmount3",
		"giveType4", "giveLinkId4", "giveAmount4",
	],
	AvgFlagUI: ["id", "flagId", "type", "effectValue", "titleKey", "localizationKey", "iconKey", "order", "fractionAnimation"],
	BattlefieldDropItems: [
		"groupId", "questLv", "bossLv",
		"chance1", "giveType1", "giveLinkId1", "giveAmount1",
		"chance2", "giveType2", "giveLinkId2", "giveAmount2",
		"chance3", "giveType3", "giveLinkId3", "giveAmount3",
		"chance4", "giveType4", "giveLinkId4", "giveAmount4",
	],
	BattlefieldRanks: [
		"id",
		"groupId", "rankIcon", "rankListIcon",
		"minRanking", "maxRanking",
		"giveType1", "giveLinkId1", "giveAmount1",
		"giveType2", "giveLinkId2", "giveAmount2",
		"giveType3", "giveLinkId3", "giveAmount3",
	],
	BuildInAssetBundle: ["type", "effectValue"],
	ChapterCount: ["id", "name", "dynamicRate", "initial", "max", "regainType", "regainValue", "itemIcon", "payType", "linkId", "amount"],
	Chapters: [
		"id", "enable", "isLock",
		"category", "group", "volume", /* 分類 */
		"order", "mainImage",
		"name", "title", "titleIsHide", "titleViewType", /* 標題 */
		"visibleCondition", "param1", /* 顯示條件 */
		"unlockCondition", "param2", "unlockText", /* 解鎖條件&文字 */
		"countDisplay", "dailyCount", /* 可完成次數 */
		"extraCountCurrency", "extraCountPrice", "extraCountItem", "extraCountItemCount", /* 增加可完成次數消耗 */
		"progress", "region",
		"rewardGroupType", "rewardGroupId",
		"timeDisplay", "weekday",
	],
	DiligentGroups: ["id", "chapterId", "diligentId", "diligentAmount", "levelGroup"],
	Diligents: [
		"id",
		"levelGroup",
		"diligentI2Key", "diligentType",
		"giveType", "giveLinkId", "giveAmount", // dropExtraItem
		"abilityIncrease", // hpIncrease, atkIncrease
		"buffId", "buffLevel", // buffIncrease
	],
	DropItems: ["groupId", "subgroupId", "category", "chest", "dropTime", "giveType", "giveLinkId", "giveAmount", "value", "flagOpId"],
	Evaluates: [
		"id", "groupId",
		"evaluateRankIcon", "evaluatePoint",
		"giveType1", "giveLinkId1", "giveAmount1",
		"giveType2", "giveLinkId2", "giveAmount2",
	],
	ExtraProducts: ["id", "category", "enable", "param1", "param2", "param3", "payType", "linkId", "amount"],
	ExploreBuilding: ["id", "type", "level", "localizationKeyDescription", "effectValue", "iconKey", "item1Id", "item1Count", "item2Id", "item2Count", "item3Id", "item3Count", "item4Id", "item4Count"],
	ExploreComposite: ["id", "enable", "groupId", "requireBuildingId", "requireFlagId", "itemId", "localizationKeyDescription", "itemType", "item1Id", "item1Count", "item2Id", "item2Count", "item3Id", "item3Count", "item4Id", "item4Count", "initialViewable", "maxCount", "resetDay"],
	ExploreFlagOperation: ["id", "flagId", "operate", "effectValue", "target"],
	GashaponPacks: [
		"id", "type", "enable",
		"name", "description", "background", "banner",
		"isLock", "minPlayerLevel", "sfxMethodId", "order", "maxLimit",
		"currency", "price",
		"payType", "payLinkId", "payAmount", "pay10Amount",
		"ticketItemId",
		"giveType", "linkId", "amount",
		"itemId", "itemCount",
		"storeTag",
	],
	Gashapons: ["packId", "category", "itemId", "itemCount", "weight"],
	GemStoreProducts: ["order", "id", "iconKey", "fallbackGem", "freeGemFirst", "freeGem", "paidGem", "gem", "price", "dmmPrice", "reopenTime", "type"],
	Heroes: ["id", "characterId", "model", "name", "enable", "initRank", "atk", "hp", "storyChapter", "empty", "white", "black", "gold"],
	HeroRanks: [
		"heroId", "avatarId", "rank", "subrank", "attrModifier", "revive", "coin",
		"tipsP1", "tipsS1", "tipsS2", "tipsS3",
		"item1Id", "item1Count",
		"item2Id", "item2Count",
		"item3Id", "item3Count",
		"item4Id", "item4Count",
		"item5Id", "item5Count",
		"ext1Type", "ext1LinkId", "ext1Amount",
		"ext2Type", "ext2LinkId", "ext2Amount",
		"ext3Type", "ext3LinkId", "ext3Amount",
		"ext4Type", "ext4LinkId", "ext4Amount",
		"ext5Type", "ext5LinkId", "ext5Amount",
	],
	HomelandBuilding: [
		"id", "enable",
		"buildingId", "location", "buildingLv", "maxLv",
		"nameKey", "assets",
		"requireBuild", "requireBuildLv",
		"spaceNum", "type",
		"param1", "param2", "param3",
		"homeexp",
		"payType1", "linkId1", "amount1",
		"payType2", "linkId2", "amount2",
		"payType3", "linkId3", "amount3",
	],
	HomelandMonster: [
		"id", "enable",
		"monsterId", "rank",
		"keyName", "monsterDescKey", "monsterType", "monsterSd", "monsterSet",
		"recovery", "recoveryAdd",
		"stamina", "staminaAdd",
		"releaseValue",
		"skill1", "skill2",
		"speciality1", "speciality2", "speciality3",
		"payType1", "linkId1", "amount1",
		"payType2", "linkId2", "amount2",
		"payType3", "linkId3", "amount3",
		"requireMob1Id", "requireMob1Rank",
		"requireMob2Id", "requireMob2Rank",
		"requireMob3Id", "requireMob3Rank",
		"requireMob4Id", "requireMob4Rank",
		"requireMob5Id", "requireMob5Rank",
	],
	Items: ["id", "category", "effectValue", "iconKey", "localizationKeyDescription", "localizationKeyName", "name", "order", "param1", "rank", "sellType", "sellLinkId", "sellAmount", "stackable", "viewable"],
	LevelUps: ["level", "exp", "heroexp", "homeexp", "monsterexp"],
	Missions: ["id", "tab", "category", "order", "enable", "minLv", "maxLv", "name", "param1", "param2", "param3", "requireId",
		"giveType", "giveLinkId", "giveAmount",
		"timeLimit", "type", "weight"
	],
	Quests: [
		"id", "requireQuestId", "enable", "chapter", "levelId", "subtitle", "name", "questLocation", "sceneId",
		"dynamicLevel", "recommendLevel", "requireLevel", "heroLimitId", "extraSettingId",
		"dropRule", /* 掉落規則 */
		"displayDropTextFirst", "displayDropText", /* 掉落欄位訊息 */
		"dropGroupIdFirst", "dropGroupId", /* 實際掉落物列表ID */
		"displayDropItemFirst", "displayDropItem", /* 顯示掉落物 */
		"ringFirst", "ring", /* 魂晶碎片 */
		"expPlayerFirst", "expPlayer", /* 諦視者經驗 */
		"expHeroFirst", "expHero", /* 角色魂能 */
		"coinFirst", "coin", /* 庫倫 */
		"expTimePieceFirst", "expTimePiece", /* 魂能 */
	],
	QuestAchievements: [
		"id", "groupId",
		"achievementGroupId",
		"descriptionKey",
		"giveType", "giveLinkId", "giveAmount",
	],
	MonsterSkill: ["id", "skillId", "skillLv", "skillrank", "skillKeyName", "skillKeyDescription", "iconKey"],
	MonsterSpeciality: [
		"id", "category",
		"specialityKeyName", "specialityKeyDescription",
		"iconKey",
		"param1", "param2", "param3", "param4",
		"gemConversion", "maxGem",
		"releaseValueConversion", "maxreleaseValue",
		"chance1", "chance2", "chance3", "chance4", "chance5", "chance6", "chance7", "chance8", "chance9", "chance10", "chance11", "chance12",
	],
	RankUpItemRefs: ["id", "category", "param1", "refId", "payType", "payLinkId", "payAmount"],
	RankUpItems: [
		"id", "category", "rank", "coin",
		"item1Ref", "item1Count", "item2Ref", "item2Count", "item3Ref", "item3Count", "item4Ref", "item4Count", "item5Ref", "item5Count",
		"ext1Ref", "ext1Count", "ext2Ref", "ext2Count", "ext3Ref", "ext3Count", "ext4Ref", "ext4Count", "ext5Ref", "ext5Count",
	],
	RewardGroups: ["rewardGroupId", "note", "note2", "order", "targetItemId", "targetCount", "giveType", "giveLinkId", "giveAmount"],
	SkillLabel: [
		"skillSet",
		"skillType",
	],
	SkillLevel: [
		"id", "note",
		"rootSkill", "requiredSubrank",
		"skillLv", "targetSkillSet", "ceilingSkill",
		"S1", "S2", "S3",
		"tipsP1", "tipsA1", "tipsS1", "tipsS2", "tipsS3",
		"pay1Type", "pay1LinkId", "pay1Amount",
		"pay2Type", "pay2LinkId", "pay2Amount",
		"pay3Type", "pay3LinkId", "pay3Amount",
		"pay4Type", "pay4LinkId", "pay4Amount",
	],
	StoreConfigs: ["store", "slot", "order", "enable", "condition", "param1", "param2", "param3", "itemGroup"],
	StoreItemGroups: ["id", "group", "enable", "name", "giveType", "giveLinkId", "giveAmount", "itemCount", "payType", "linkId", "amount", "weight"],
	sublimation: ["heroId", "rank", "subrank", "ItemID", "ItemCount", "item1Id", "item1Count", "item2Id", "item2Count", "item3Id", "item3Count", "coin"],
	TavernMission: [
		"id", "enable", "tab", "category", "questKeyName", "questKeyDescription", "iconKey",
		"questRank", "time", "stamina", "baseSuccessRate", "spaceNum",
		"heroid", "heroLv", "heroRank",
		"gold", "black", "white",
		"environment",
		"dropItem", "extraDropItem",
		"displayDropItem", "displayExtraDropItem",
		"homeExp", "monsterExp",
		"monsterLv", "monsterLvPenaltyRatio", "monsterLvPenaltyMax",
		"expressConversion", "expressCurrency",
	],
	TavernMissionDrop: ["groupId", "choiceNum", "missionId", "type", "param1", "param2", "param3", "weight"],
	TeamLimits: ["id", "maxLevelBy",
		"idW", "typeW", "rankW", "subrankW", "skillW", "skillLevelW", "lvW",
		"idB", "typeB", "rankB", "subrankB", "skillB", "skillLevelB", "lvB",
		"idG", "typeG", "rankG", "subrankG", "skillG", "skillLevelG", "lvG",
		"idSP1", "typeSP1", "rankSP1", "subrankSP1", "skillSP1", "skillLevelSP1", "lvSP1",
		"idSP2", "typeSP2", "rankSP2", "subrankSP2", "skillSP2", "skillLevelSP2", "lvSP2",
	],
	SignInReward: ["id", "category", "groupId", "param1", "param2", "giveType", "giveLinkId", "giveAmount"],
	Volume: ["order", "volume", "enable", "name", "title",
		"visibleCondition", "param1",
		"unlockCondition", "param2", "unlockText", "unlockNoteText"
	],
	VoucherGifts: ["id", "groupId", "giveType", "giveLinkId", "giveAmount"],
};

const itemKeys: string[] = [];
for (let i = 1; i < 10; i++) {
	itemKeys.push(`item${i}Id`);
	itemKeys.push(`item${i}Count`);
	itemKeys.push(`reward${i}Count`);
}
const giveKeys: string[] = ["giveType", "giveLinkId", "giveAmount"];
for (let i = 1; i < 10; i++) {
	giveKeys.push(`giveType${i}`);
	giveKeys.push(`giveLinkId${i}`);
	giveKeys.push(`giveAmount${i}`);
}
const payKeys: string[] = ["payType", "linkId", "amount"];
for (let i = 1; i < 10; i++) {
	payKeys.push(`payType${i}`);
	payKeys.push(`linkId${i}`);
	payKeys.push(`amount${i}`);
}

export function sortKeyByTable(tablename?: string) {
	let keys = KEYS;
	if (tablename && tablename in TABLE_KEYS) {
		keys = TABLE_KEYS[tablename];
	}

	return (a: any[], b: any[]): number => {
		const av = '' + a[a.length - 1];
		const ai = keys.indexOf(av);
		const bv = '' + b[b.length - 1];
		const bi = keys.indexOf(bv);
		if (ai == -1 && bi == -1) {
			if (tablename && tablename in TABLE_KEYS) {
				return sortKeyByTable()(a, b);
			}
			const aki = itemKeys.indexOf(av);
			const bki = itemKeys.indexOf(bv);
			if (aki != -1 && bki != -1) {
				return aki - bki;
			}
			const agi = giveKeys.indexOf(av);
			const bgi = giveKeys.indexOf(bv);
			if (agi != -1 && bgi != -1) {
				return agi - bgi;
			}
			const api = payKeys.indexOf(av);
			const bpi = payKeys.indexOf(bv);
			if (api != -1 && bpi != -1) {
				return api - bpi;
			}
			return av.localeCompare(bv);
		}
		if (ai == -1) {
			return 1;
		}
		if (bi == -1) {
			return -1;
		}
		return ai - bi;
	};
}

const TABLE_KEYS_BLACKLIST: Record<string, string[]> = {
	AbilityDrop: ["id"],
	AdventureDailyRank: ["item1Id", "reward1Count", "item2Id", "reward2Count", "item3Id", "reward3Count", "item4Id", "reward4Count"],
	AdventureWeekPoint: ["item1Id", "reward1Count", "item2Id", "reward2Count", "item3Id", "reward3Count", "item4Id", "reward4Count"],
	AdventureWeekRank: ["item1Id", "reward1Count", "item2Id", "reward2Count", "item3Id", "reward3Count", "item4Id", "reward4Count"],
	Chapters: ["requireQuestId"],
	CharaInfoVoice: ["id"],
	CharaSelectVoice: ["id"],
	CharaVictoryVoice: ["id"],
	CharaRankUpVoice: ["id"],
	ChinaBlacklist: ["id"],
	DisableWords: ["id"],
	DropItems: ["id", "itemId", "itemCount"],
	ExtraProducts: ["id"],
	Gashapons: ["id"],
	GlobalBlacklist: ["id"],
	Items: ["price", "sellCurrency"],
	Missions: ["reward", "itemId", "rewardCount"],
	RankUpItemRefs: ["id"],
	RewardGroups: ["rewardType", "rewardItemId", "rewardCount"],
	TavernMissionDrop: ["id"],
};

export function filterKeyByTable(tablename: string) {
	if (tablename in TABLE_KEYS_BLACKLIST) {
		return (value: any[], index: number, array: any[][]): boolean => {
			const key = '' + value[value.length - 1];
			if (TABLE_KEYS_BLACKLIST[tablename].indexOf(key) != -1) {
				return false;
			}
			return true;
		};
	}
	return () => true;
}
