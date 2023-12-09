import * as _ from "lodash-es";
import { AssetbundleLookupTable } from "../assetbundle-lookup-table.js";
import { ImperiumData } from "../imperium-data.js";
import { LookupTableCategory } from "../model/enums/custom/lookup-table-category.enum.js";
import { Hero } from "../model/hero.js";
import { HeroSkillSet } from "../model/hero-skillset.js";
import { IHeroSkillSet } from "../model/hero-skillset.interface.js";
import { wikiH1 } from "../templates/wikiheader.js";
import { wikitable, WikiTableStruct } from "../templates/wikitable.js";
import { wikiNextLine } from "../wiki-utils.js";

const CharaInfoVoiceTable = ImperiumData.fromGamedata().getTable("CharaInfoVoice");
const CharaSelectVoiceTable = ImperiumData.fromGamedata().getTable("CharaSelectVoice");
const CharaVictoryVoiceTable = ImperiumData.fromGamedata().getTable("CharaVictoryVoice");
const CharaRankUpVoiceTable = ImperiumData.fromGamedata().getTable("CharaRankUpVoice");

interface VoiceData {
	model: string;
	skillSet: IHeroSkillSet | string;
	hero: Hero | string;
	info: string[];
	select: string[];
	start: string[];
	victory: string[];
	rankUp: string[];
	groupKey: string;
}

export default function wikiCharVoice() {
	const voiceData: VoiceData[] = [];
	for (const infoVoice of CharaInfoVoiceTable) {
		const model: string = infoVoice.get("prefabId");
		const skillSet = HeroSkillSet.getByModel(model);
		const hero = skillSet?.hero;
		const selectVoice = CharaSelectVoiceTable.find((row) => row.get("prefabId") == model);
		const victoryVoice = CharaVictoryVoiceTable.find((row) => row.get("prefabId") == model);
		const rankUpVoice = CharaRankUpVoiceTable.find((row) => row.get("prefabId") == model);
		const info: string[] = [
			infoVoice.get("sfxCharaInfo01"),
			infoVoice.get("sfxCharaInfo02"),
			infoVoice.get("sfxCharaInfo03"),
			infoVoice.get("sfxCharaInfo04"),
			infoVoice.get("sfxCharaInfo05"),
		].filter(Boolean);
		const select: string[] = [
			selectVoice?.get("sfxCharaSelect01"),
			selectVoice?.get("sfxCharaSelect02"),
			selectVoice?.get("sfxCharaSelect03"),
		].filter(Boolean);
		const start: string[] = [
			selectVoice?.get("sfxStart01"),
			selectVoice?.get("sfxStart02"),
		].filter(Boolean);
		const victory: string[] = [
			victoryVoice?.get("sfxVictory01"),
			victoryVoice?.get("sfxVictory02"),
			victoryVoice?.get("sfxVictory03"),
			victoryVoice?.get("sfxVictory04"),
			victoryVoice?.get("sfxVictory05"),
		].filter(Boolean);
		const rankUp: string[] = [rankUpVoice?.get("sfxRankUp01")].filter(Boolean);

		voiceData.push({
			model,
			skillSet: skillSet ?? model,
			hero: hero ?? model,
			info,
			select,
			start,
			victory,
			rankUp,
			groupKey: `${info};${select};${start};${victory};${rankUp}`,
		});
	}

	let out = wikiH1("角色語音");
	const table: WikiTableStruct = {
		attributes: `class="wikitable" style="word-break: break-all;"`,
		rows: [
			[
				`! 角色階級`,
				`! 魂冊語音`,
				`! 選擇角色語音`,
				`! 出戰語音`,
				`! 勝利語音`,
				`! 階級提升語音`,
			],
		],
	};

	const voiceGroups = _.groupBy(voiceData, (v) => v.groupKey);
	for (const [, group] of Object.entries(voiceGroups)) {
		const heroGroups = _.groupBy(group, (v) =>
			typeof v.hero === "string" ? v.hero : v.hero.id,
		);
		const heroList = Object.values(heroGroups).map((vs) =>
			vs
				.map((s) => (typeof s.skillSet === "string" ? s.skillSet : s.skillSet.toWiki()))
				.join("\n"),
		);

		table.rows.push([
			wikiNextLine(heroList.join("\n")),
			formatVoiceList(group[0].info),
			formatVoiceList(group[0].select),
			formatVoiceList(group[0].start),
			formatVoiceList(group[0].victory),
			formatVoiceList(group[0].rankUp),
		]);
	}
	out += `\n\n${wikitable(table)}`;

	return out;
}

function formatVoiceList(voices: string[]) {
	return wikiNextLine(
		voices
			.map((voice) => {
				const url = AssetbundleLookupTable.getInstance().getAssetUrl(
					LookupTableCategory.Audio_SFX,
					`${voice}_jp`,
				);
				return `<a href="${url}">${voice}</a>`;
			})
			.join(",\n"),
	);
}
