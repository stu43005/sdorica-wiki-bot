import { localizationCharacterName } from "../../../localization";
import { ISummonSingleCharacter } from "./ISummonSingleCharacter";
import { SummonCharacter } from "./SummonCharacter";
import { SummonCharacterArg } from "./SummonCharacterArg";
import { SummonCharacterInPreset } from "./SummonCharacterInPreset";

export function summonStringify(summonSingleCharacter: ISummonSingleCharacter): string {
	if (!summonSingleCharacter) return "";
	if (summonSingleCharacter.$type == "BattleModel.SummonCharacter") {
		const obj = summonSingleCharacter as SummonCharacter;
		return characterArgStringify(obj.CharacterArg);
	}
	if (summonSingleCharacter.$type == "BattleModel.SummonCharacterInPreset") {
		const obj = summonSingleCharacter as SummonCharacterInPreset;
		const sum = obj.WeightedCharacterArgs.reduce<number>((prev, cur) => prev + cur.Weight, 0);
		return `\n${obj.WeightedCharacterArgs.map(
			(warg) =>
				`\t* ${characterArgStringify(warg.CharacterArg)} : ${(warg.Weight / sum) * 100}%`
		).join("\n")}\n`;
	}
	console.error(`Unknown skill effect type: ${summonSingleCharacter.$type}`);
	debugger;
	return JSON.stringify(summonSingleCharacter);
}

function characterArgStringify(arg: SummonCharacterArg) {
	const localCharName = localizationCharacterName()(arg.AssetName);
	return `${arg.AssetName};${localCharName};等級變化:${arg.State.LevelAdjustment};初始體力:${
		arg.State.InitBloodRatio * 100
	}%;初始疊盾:${arg.State.InitArmorRatio}%;初始CD:${arg.State.InitCd}${
		arg.State.DisapearAfterDead ? ";死後消失" : ""
	}`;
}
