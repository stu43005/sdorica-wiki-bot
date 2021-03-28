import { ImperiumData } from "../imperium-data";
import { Hero } from "../model/hero";
import { HeroSkillSet } from "../model/hero-skillset";
import { arrayGroupBy } from "../utils";
import { wikiNextLine } from "../wiki-utils";

const CharaInfoVoiceTable = ImperiumData.fromGamedata().getTable("CharaInfoVoice");
const CharaSelectVoiceTable = ImperiumData.fromGamedata().getTable("CharaSelectVoice");
const CharaVictoryVoiceTable = ImperiumData.fromGamedata().getTable("CharaVictoryVoice");
const CharaRankUpVoiceTable = ImperiumData.fromGamedata().getTable("CharaRankUpVoice");

interface VoiceData {
	model: string;
	skillSet: HeroSkillSet;
	hero: Hero;
	info: string[];
	select: string[];
	start: string[];
	victory: string[];
	rankUp: string[];
	groupKey: string;
}

export default function wikiCharVoice() {
	const voiceData: VoiceData[] = [];

	let out: string = `{| class="wikitable" style="word-break: break-all;"
! 角色階級 !! 魂冊語音 !! 選擇角色語音 !! 出戰語音 !! 勝利語音 !! 階級提升語音`;
	for (const infoVoice of CharaInfoVoiceTable) {
		const model = infoVoice.get('prefabId');
		const skillSet = HeroSkillSet.getByModel(model);
		const hero = skillSet?.hero;
		if (skillSet && hero) {
			const selectVoice = CharaSelectVoiceTable.find(row => row.get('prefabId') == model);
			const victoryVoice = CharaVictoryVoiceTable.find(row => row.get('prefabId') == model);
			const rankUpVoice = CharaRankUpVoiceTable.find(row => row.get('prefabId') == model);
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
			const rankUp: string[] = [
				rankUpVoice?.get('sfxRankUp01'),
			].filter(s => s);

			voiceData.push({
				model,
				skillSet,
				hero,
				info,
				select,
				start,
				victory,
				rankUp,
				groupKey: `${info}${select}${start}${victory}${rankUp}`
			});

		}
	}
	const voiceGroupedData = arrayGroupBy(voiceData, v => v.groupKey);
	for (const voices of Object.values(voiceGroupedData)) {
		const groupedHeros = Object.values(arrayGroupBy(voices, v => v.hero.id));
		out += `
|-
| ${wikiNextLine(groupedHeros.map(h => `${h[0].hero.toWikiSmallIcon()} (${h.map(s => s.skillSet.rank).join(', ')})`).join(',\n'))}
| ${wikiNextLine(voices[0].info.join(',\n'))}
| ${wikiNextLine(voices[0].select.join(',\n'))}
| ${wikiNextLine(voices[0].start.join(',\n'))}
| ${wikiNextLine(voices[0].victory.join(',\n'))}
| ${wikiNextLine(voices[0].rankUp.join(',\n'))}`;
	}
	out += `\n|}`;
	return out;
}
