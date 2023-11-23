import { Battlefield } from "../model/battlefield";
import { wikiH1, wikiH2 } from "../templates/wikiheader";
import { wikiPageLink } from "../templates/wikilink";
import { wikiul } from "../templates/wikilist";

export default function wikiBattlefields() {
	let out = wikiH1("戰場");

	for (const battlefield of Battlefield.getAllGenerator()) {
		const ul = [
			`最大回合數：${battlefield.endTurnCount}`,
			`通關獎勵：${wikiPageLink("BattlefieldDropItems", "", battlefield.questLvDropId)}`,
			...(battlefield.rankGroupId
				? [
						`排名獎勵：${wikiPageLink(
							"BattlefieldRanks",
							"",
							battlefield.rankGroupId
						)}`,
						`排名蒐集品：${battlefield.targetItem?.toWiki() ?? ""}`,
				  ]
				: []),
			...(battlefield.evaluateGroupId
				? [
						`戰鬥評價：${wikiPageLink("Evaluates", "", battlefield.evaluateGroupId)}`,
						`評價成就：${wikiPageLink(
							"EvaluateAchievements",
							"",
							battlefield.evaluateAchievementGroupId
						)}`,
				  ]
				: []),
			...(battlefield.pointGroupId
				? [
						`積分獎勵：${wikiPageLink(
							"AdventureRank",
							"",
							`積分獎勵 ${battlefield.pointGroupId}`
						)}`,
				  ]
				: []),
			`章節：${wikiul(
				battlefield.chapters.map((chapter) =>
					wikiPageLink("Chapter", chapter.getWikiFullName(), chapter.id)
				)
			)}`,
		];

		out += `\n\n${wikiH2(battlefield.id)}\n${wikiul(ul)}`;
	}

	return out;
}
