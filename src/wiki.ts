import MWBot from "mwbot";
import fs from "node:fs/promises";
import path from "node:path";
import { AssetbundleLookupTable } from "./assetbundle/assetbundle-lookup-table.js";
import { WIKI_PATH } from "./config.js";
import { getConstants } from "./localization.js";
import { Logger } from "./logger.js";
import { Hero } from "./model/hero.js";
import { outJson, outText } from "./out.js";
import { __dirname } from "./utilities/node.js";
import { objectEach } from "./utils.js";
import { getMWBot } from "./wiki-bot.js";
import { getHeroJsonData } from "./wiki-hero.js";
import { getItemJsonData } from "./wiki-item.js";
import { getQuestJsonData } from "./wiki-quest.js";
import wikiAdvAchievements from "./wiki/AdvAchievements.js";
import wikiAdventure from "./wiki/Adventure.js";
import wikiAdventureRank from "./wiki/AdventureRank.js";
import wikiAvatars from "./wiki/Avatars.js";
import wikiBattlefieldDropItems from "./wiki/BattlefieldDropItems.js";
import wikiBattlefieldRanks from "./wiki/BattlefieldRanks.js";
import wikiBattlefields from "./wiki/Battlefields.js";
import wikiBlessEffects from "./wiki/BlessEffects.js";
import wikiBuffs from "./wiki/Buffs.js";
import wikiChapter from "./wiki/Chapter.js";
import wikiCharVoice from "./wiki/CharVoice.js";
import wikiConstantsJson from "./wiki/Constants.js";
import wikiDiligents from "./wiki/Diligents.js";
import wikiEvaluateAchievements from "./wiki/EvaluateAchievements.js";
import wikiEvaluates from "./wiki/Evaluates.js";
import wikiExploreBuilding from "./wiki/ExploreBuilding.js";
import wikiExploreComposite from "./wiki/ExploreComposite.js";
import wikiExploreItems from "./wiki/ExploreItems.js";
import wikiFreeHeroes from "./wiki/FreeHeroes.js";
import wikiHeroes, { wikiHeroesJson } from "./wiki/Heroes.js";
import wikiHomelandBuilding from "./wiki/HomelandBuilding.js";
import wikiHomelandMonster from "./wiki/HomelandMonster.js";
import wikiLevelUps, { wikiLevelUpsJson } from "./wiki/LevelUps.js";
import wikiMissions from "./wiki/Missions.js";
import { wikiMonsterTrapJson } from "./wiki/MonsterTrap.js";
import wikiQuestAchievements from "./wiki/QuestAchievements.js";
import wikiResonance from "./wiki/Resonance.js";
import wikiRewardGroups from "./wiki/RewardGroups.js";
import wikiSignInReward from "./wiki/SignInReward.js";
import wikiTavernMission from "./wiki/TavernMission.js";
import wikiTavernMissionCompact from "./wiki/TavernMissionCompact.js";
import wikiTavernMissionDrop from "./wiki/TavernMissionDrop.js";
import { wikiTips } from "./wiki/Tips.js";
import wikiTreasureItems from "./wiki/TreasureItems.js";
import { wikiHeroBot } from "./wiki/auto/hero.js";
import wikiIndex from "./wiki/index.js";

const logger = new Logger("wiki");

function wikiQuestsData() {
	const questJson = getQuestJsonData();
	const questsOut: string[] = Object.values(questJson)
		.map((chapter) => {
			const tempOut: string[] = [];
			objectEach(chapter, (fullname, quest) => {
				tempOut.push(`${fullname}\n\n${quest}`);
			});
			return tempOut;
		})
		.reduce((prev: string[], curr: string[]) => prev.concat(curr), []);
	return questsOut.join("\n\n##############################\n\n");
}

function wikiHeroesData() {
	const heroJson = getHeroJsonData();
	const heroOut: string[] = [];
	objectEach(heroJson, (name, hero) => {
		let str = name;
		str += `\n\n${hero.hero}\n\n${hero.base}`;
		str += Object.values(hero.ranks)
			.map((r) => `\n\n******************************\n\n${r}`)
			.join("");
		heroOut.push(str);
	});
	return heroOut.join("\n\n##############################\n\n");
}

function wikiItemsData() {
	const itemJson = getItemJsonData();
	return Object.values(itemJson)
		.map((v) => Object.values(v).join("\n\n"))
		.join("\n\n##############################\n\n");
}

function wrapHiddenDiv(content: string) {
	return `<div class="accountcreator-show">\n${content}\n</div>`;
}

async function applyHtmlTemplate(title: string, body: string) {
	const template = await fs.readFile(
		path.join(__dirname(import.meta), "../assets/wiki-template.html"),
		{
			encoding: "utf8",
		},
	);
	return template.replace(/<%title%>/g, title).replace(/<%body%>/g, body);
}

async function outWiki(bot: MWBot | undefined, title: string, out: string) {
	const ext = out.startsWith("#") ? "md" : out.startsWith("<") ? "html" : "txt";
	if (ext === "html") {
		out = await applyHtmlTemplate(title, out);
	}
	await outText(path.join(WIKI_PATH, `${title.replace(/:/, "_")}.${ext}`), out);
	if (bot && ext === "txt") {
		if (title.startsWith("模板:")) {
			await bot.editOnDifference(title, out);
		} else {
			await bot.editOnDifference(`使用者:小飄飄/wiki/${title}`, wrapHiddenDiv(out));
		}
	}
}

async function outWikiJson(bot: MWBot | undefined, title: string, data: any) {
	await outJson(path.join(WIKI_PATH, `${title}.json`), data);
	if (bot) {
		await bot.editOnDifference(
			`使用者:小飄飄/bot/${title}.json`,
			JSON.stringify(data, null, 4),
		);
	}
}

async function outWikiConstant(bot: MWBot | undefined, title: string, value: string) {
	if (value && bot) {
		await bot.editOnDifference(
			`模板:Constant/${title}`,
			`${value}<noinclude>{{Documentation}}</noinclude>`,
		);
	}
}

export async function wikiMain(updateWiki?: boolean) {
	let bot: MWBot | undefined;
	try {
		if (updateWiki) {
			bot = await getMWBot();
		}
	} catch (error) {
		logger.log(`[MWBOT] Login failed: ${error}`);
	}

	try {
		await AssetbundleLookupTable.getInstance().updateLookupTable();
	} catch (error) {}

	await outWiki(bot, "AdvAchievements", wikiAdvAchievements());
	await outWiki(bot, "Adventure", wikiAdventure());
	await outWiki(bot, "AdventureRank", wikiAdventureRank());
	await outWiki(bot, "Avatars", wikiAvatars());
	await outWiki(bot, "Battlefields", wikiBattlefields());
	await outWiki(bot, "BattlefieldDropItems", wikiBattlefieldDropItems());
	await outWiki(bot, "BattlefieldRanks", wikiBattlefieldRanks());
	await outWiki(bot, "BlessEffects", wikiBlessEffects());
	await outWiki(bot, "Buffs", wikiBuffs());
	await outWiki(bot, "Chapter", wikiChapter());
	await outWiki(bot, "CharVoice", wikiCharVoice());
	await outWiki(bot, "Diligents", wikiDiligents());
	await outWiki(bot, "EvaluateAchievements", wikiEvaluateAchievements());
	await outWiki(bot, "Evaluates", wikiEvaluates());
	await outWiki(bot, "ExploreBuilding", wikiExploreBuilding());
	await outWiki(bot, "ExploreComposite", wikiExploreComposite());
	await outWiki(bot, "ExploreItems", wikiExploreItems());
	await outWiki(bot, "FreeHeroes", wikiFreeHeroes());
	// await outWiki(bot, 'Gashapons', wikiGashapons());
	// await outWikiJson(bot, 'Gashapons', wikiGashaponsJson());
	await outWiki(bot, "Heroes", wikiHeroes());
	await outWikiJson(bot, "Heroes", wikiHeroesJson());
	await outWiki(bot, "HomelandBuilding", wikiHomelandBuilding());
	await outWiki(bot, "HomelandMonster", wikiHomelandMonster());
	await outWiki(bot, "LevelUps", wikiLevelUps());
	await outWikiJson(bot, "LevelUps", wikiLevelUpsJson());
	await outWiki(bot, "Missions", wikiMissions());
	await outWikiJson(bot, "MonsterTrap", wikiMonsterTrapJson());
	await outWiki(bot, "QuestAchievements", wikiQuestAchievements());
	await outWiki(bot, "Resonance", wikiResonance());
	await outWiki(bot, "RewardGroups", wikiRewardGroups());
	await outWiki(bot, "SignInReward", wikiSignInReward());
	// await outWiki(bot, 'Store', wikiStore());
	await outWiki(bot, "TavernMission", wikiTavernMission());
	await outWiki(bot, "TavernMissionCompact", wikiTavernMissionCompact());
	await outWiki(bot, "TavernMissionDrop", wikiTavernMissionDrop());
	await outWiki(bot, "TreasureItems", wikiTreasureItems());

	await outWiki(bot, "Tips", wikiTips());
	// await outWiki(bot, '模板:Tips', wikiTipsTemplate());

	await outWikiConstant(bot, "MaxLevel", getConstants()("playerMaxLv"));
	await outWikiConstant(bot, "MaxResonanceLevel", getConstants()("subrankMax"));
	await outWikiJson(bot, "Constants", wikiConstantsJson());

	for (const hero of Hero.getAll().filter((hero) => hero.enable)) {
		for (const skillset of hero.skillSetWithLevels) {
			await outWikiJson(bot, path.join("Heroes", skillset.model), skillset.toJSON());
		}
	}

	await outText(path.join(WIKI_PATH, "raw/quests.txt"), wikiQuestsData());
	await outText(path.join(WIKI_PATH, "raw/heroes.txt"), wikiHeroesData());
	await outText(path.join(WIKI_PATH, "raw/items.txt"), wikiItemsData());

	await outWiki(bot, "index", await wikiIndex());

	if (bot) {
		await wikiHeroBot(bot);
		// await wikiMonsterBot(bot);
		// await wikiRuneRedirectBot(bot);
		// await wikiScRedirectBot(bot);
		// await wikiUpdateExploreItemBot(bot);
		// await wikiItemImageBot(bot);
	}
}
