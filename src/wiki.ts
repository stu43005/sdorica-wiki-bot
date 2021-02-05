import MWBot from "mwbot";
import path from "path";
import { WIKI_PATH } from "./config";
import { outJson, outText } from "./out";
import { isDevMode, objectEach } from "./utils";
import { getMWBot } from "./wiki-bot";
import { getHeroJsonData } from "./wiki-hero";
import { getItemJsonData } from "./wiki-item";
import { getQuestJsonData } from "./wiki-quest";
import wikiAdvAchievements from "./wiki/AdvAchievements";
import wikiAdventure from "./wiki/Adventure";
import wikiAdventureRank from "./wiki/AdventureRank";
import { wikiHeroBot } from "./wiki/auto/hero";
import wikiAvatars from "./wiki/Avatars";
import wikiChapter from "./wiki/Chapter";
import wikiCharVoice from "./wiki/CharVoice";
import wikiExploreBuilding from "./wiki/ExploreBuilding";
import wikiExploreComposite from "./wiki/ExploreComposite";
import wikiExploreItems from "./wiki/ExploreItems";
import wikiGashapons, { wikiGashaponsJson } from "./wiki/Gashapons";
import wikiHeroes, { wikiHeroesJson } from "./wiki/Heroes";
import wikiHomelandBuilding from "./wiki/HomelandBuilding";
import wikiHomelandMonster from "./wiki/HomelandMonster";
import wikiLevelUps from "./wiki/LevelUps";
import wikiMissions from "./wiki/Missions";
import { wikiMonsterTrapJson } from "./wiki/MonsterTrap";
import wikiResonance from "./wiki/Resonance";
import wikiRewardGroups from "./wiki/RewardGroups";
import wikiSideStory from "./wiki/SideStory";
import wikiSignInReward from "./wiki/SignInReward";
import wikiStore from "./wiki/Store";
import wikiTavernMission from "./wiki/TavernMission";
import wikiTavernMissionCompact from "./wiki/TavernMissionCompact";
import wikiTavernMissionDrop from "./wiki/TavernMissionDrop";
import wikiTips from "./wiki/Tips";
import wikiTreasureItems from "./wiki/TreasureItems";

function wikiQuestsData() {
	const questJson = getQuestJsonData();
	const questsOut: string[] = Object.values(questJson).map((chapter) => {
		let tempOut: string[] = [];
		objectEach(chapter, (fullname, quest) => {
			tempOut.push(`${fullname}\n\n${quest}`);
		});
		return tempOut;
	}).reduce((prev: string[], curr: string[]) => prev.concat(curr), []);
	return questsOut.join("\n\n##############################\n\n");
}

function wikiHeroesData() {
	const heroJson = getHeroJsonData();
	const heroOut: string[] = [];
	objectEach(heroJson, (name, hero) => {
		let str = name;
		str += `\n\n${hero.hero}\n\n${hero.base}`;
		str += Object.values(hero.ranks).map((r) => `\n\n******************************\n\n${r}`).join("");
		heroOut.push(str);
	});
	return heroOut.join("\n\n##############################\n\n");
}

function wikiItemsData() {
	const itemJson = getItemJsonData();
	return Object.values(itemJson).map(v => Object.values(v).join("\n\n")).join("\n\n##############################\n\n");
}


function wrapHiddenDiv(content: string) {
	return `<div class="accountcreator-show">\n${content}\n</div>`;
}

async function outWiki(bot: MWBot, title: string, out: string) {
	await outText(path.join(WIKI_PATH, `${title.replace(/:/, '_')}.txt`), out);
	if (!isDevMode()) {
		if (title.startsWith('模板:')) {
			await bot.editOnDifference(title, out);
		} else {
			await bot.editOnDifference(`使用者:小飄飄/wiki/${title}`, wrapHiddenDiv(out));
		}
	}
}

async function outWikiJson(bot: MWBot, title: string, data: any) {
	await outJson(path.join(WIKI_PATH, `${title}.json`), data);
	if (!isDevMode()) {
		await bot.editOnDifference(`使用者:小飄飄/bot/${title}.json`, JSON.stringify(data, null, 4));
	}
}

async function outWikiConstant(bot: MWBot, title: string, value: string) {
	if (value && !isDevMode()) {
		await bot.editOnDifference(`模板:Constant/${title}`, `${value}<noinclude>{{Documentation}}</noinclude>`);
	}
}

export async function wikiMain() {
	const bot = await getMWBot();

	await outWiki(bot, 'AdvAchievements', wikiAdvAchievements());
	await outWiki(bot, 'Adventure', wikiAdventure());
	await outWiki(bot, 'AdventureRank', wikiAdventureRank());
	await outWiki(bot, 'Avatars', wikiAvatars());
	await outWiki(bot, 'Chapter', wikiChapter());
	await outWiki(bot, 'CharVoice', wikiCharVoice());
	await outWiki(bot, 'ExploreBuilding', wikiExploreBuilding());
	await outWiki(bot, 'ExploreComposite', wikiExploreComposite());
	await outWiki(bot, 'ExploreItems', wikiExploreItems());
	// await outWiki(bot, 'Gashapons', wikiGashapons());
	// await outWikiJson(bot, 'Gashapons', wikiGashaponsJson());
	await outWiki(bot, 'Heroes', wikiHeroes());
	await outWikiJson(bot, 'Heroes', wikiHeroesJson());
	await outWiki(bot, 'HomelandBuilding', wikiHomelandBuilding());
	await outWiki(bot, 'HomelandMonster', wikiHomelandMonster());
	await outWiki(bot, 'LevelUps', wikiLevelUps());
	await outWiki(bot, 'Missions', wikiMissions());
	await outWikiJson(bot, 'MonsterTrap', wikiMonsterTrapJson());
	await outWiki(bot, 'Resonance', wikiResonance());
	await outWiki(bot, 'RewardGroups', wikiRewardGroups());
	await outWiki(bot, 'SideStory', wikiSideStory());
	await outWiki(bot, 'SignInReward', wikiSignInReward());
	await outWiki(bot, 'Store', wikiStore());
	await outWiki(bot, 'TavernMission', wikiTavernMission());
	await outWiki(bot, 'TavernMissionCompact', wikiTavernMissionCompact());
	await outWiki(bot, 'TavernMissionDrop', wikiTavernMissionDrop());
	await outWiki(bot, 'TreasureItems', wikiTreasureItems());

	await outWiki(bot, '模板:Tips', wikiTips());

	// await outWikiConstant(bot, 'MaxLevel', getConstants()('playerMaxLv'));
	// await outWikiConstant(bot, 'MaxResonanceLevel', getConstants()('subrankMax'));

	await outText(path.join(WIKI_PATH, "raw/quests.txt"), wikiQuestsData());
	await outText(path.join(WIKI_PATH, "raw/heroes.txt"), wikiHeroesData());
	await outText(path.join(WIKI_PATH, "raw/items.txt"), wikiItemsData());

	if (!isDevMode()) {
		await wikiHeroBot(bot);
		// await wikiMonsterBot(bot);
		// await wikiRuneRedirectBot(bot);
		// await wikiScRedirectBot(bot);
		// await wikiUpdateExploreItemBot(bot);
		// await wikiItemImageBot(bot);
	}
}
