import _ from "lodash";
import { Chapter } from '../model/chapter';
import { RewardGroupType } from "../model/enums/reward-group-type.enum";
import { wikiH1, wikiH2, wikiH3 } from "../templates/wikiheader";
import { wikiimage } from "../templates/wikiimage";
import { wikiPageLink } from "../templates/wikilink";
import { wikiul } from "../templates/wikilist";
import { wikitable, WikiTableStruct } from "../templates/wikitable";

export default function wikiChapter() {
	let out = wikiH1("章節");

	const chapterGroups = _.groupBy(Chapter.getAll(), (c) => c.getWikiGroup());
	for (const [groupId, group] of Object.entries(chapterGroups)) {
		const volume = group[0].volume;
		const volumeHints = [
			`${volume.name}可見條件：${volume.visibleConditionText}`,
			`${volume.name}解鎖條件：${volume.unlockConditionText}`,
		];
		out += `\n\n${wikiH2(groupId)}\n${wikiul(volumeHints)}\n`;

		for (const chapter of group) {
			const chapterHints = [
				...(chapter.enable ? [] : [
					`⛔停用`,
				]),
				`章節可見條件：${chapter.visibleConditionText}`,
				`章節解鎖條件：${chapter.unlockConditionText}`,
				...(chapter.chapterCount ? [
					`累積最大關卡次數：${chapter.chapterCount.max}`,
					`自動恢復關卡次數：${chapter.chapterCount.regainString}`,
					`增加可完成次數消耗：${chapter.chapterCount.payItem.toWiki()}${chapter.chapterCount.payItem2.toWiki()}`
				] : []),
				...(chapter.dropGroup ? [
					`章節完成獎勵：${chapter.dropGroup.toWiki()}`,
				] : []),
				...(chapter.rewardGroupId ? [
					`${chapter.rewardGroupType === RewardGroupType.AchievementReward ? "成就獎勵" : "累積道具獎勵"}：${wikiPageLink("RewardGroups", "", chapter.rewardGroupId)}`,
				] : []),
				...(chapter.isDiligentEnable ? [
					`有閱歷值：${wikiPageLink("Diligents", "", chapter.getWikiFullName())}`,
				] : []),
				...(chapter.battlefield ? [
					`戰場設定：${wikiPageLink("Battlefields", "", chapter.battlefield.id)}`,
				] : []),
			];
			const table: WikiTableStruct = [];
			for (const quest of chapter.quests.filter(q => q.enable)) {
				// const { prefix, ch, ch2, name: questName, wikilink } = questMetadata(quest, row);
				// const wikilinkLastPart = titleparts(wikilink, 0, -1);
				// str += `\n{{旅途|${localizationQuestSubtitle()(quest.get("subtitle"))}|${quest.get("recommendLevel")}|${prefix}|${ch}${ch2 ? "-" + ch2 : ""}|${wikilink}${wikilinkLastPart != questName ? `|${questName}` : ""}}}`;
				const questHints: string[] = [
					...(quest.extraSetting ? [
						...(quest.extraSetting.achievementId ? [
							`戰鬥成就獎勵：${wikiPageLink("QuestAchievements", "", quest.extraSetting.achievementId)}`,
						] : []),
						...(quest.extraSetting.isExploreQuest ? [
							`這是探索關卡`,
						] : []),
						...(quest.extraSetting.scoreRule ? [
							`計分規則：${wikiPageLink("Adventure", quest.drop.displayDropText, quest.extraSetting.scoreRule)}`,
						] : []),
						...(quest.extraSetting.lockMessage ? [
							`關卡解鎖條件：${quest.extraSetting.lockMessage}`,
						] : []),
						...(quest.extraSetting.sweepUnlockText ? [
							`掃蕩解鎖條件：${quest.extraSetting.sweepUnlockText}`,
						] : []),
					] : []),
				];
				table.push([
					quest.subtitle,
					`Lv.${quest.recommendLevel}`,
					quest.title,
					questHints.length ? wikiul(questHints) : "",
				]);
			}
			out += `\n
${wikiH3(chapter.getWikiFullName(), chapter.id)}
${wikiul(chapterHints)}

${wikiimage(chapter.getWikiImageName(), { width: 400 })}
${wikitable(table)}`;
		}
	}

	return out;
}
