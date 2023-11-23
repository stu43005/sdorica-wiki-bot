import { mulitTargetStringify, singleTargetStringify } from "../../target/TargetStringify";
import { ITransitionResultGroup } from "./group/ITransitionResultGroup";
import { ThisSkillSetResult } from "./group/ThisSkillSetResult";
import { ThisTurnResult } from "./group/ThisTurnResult";
import { ITransitionResultValue } from "./ITransitionResultValue";
import { TotalResultsValueOfCharacter } from "./TotalResultsValueOfCharacter";
import { TotalResultsValueOfCharacterGroup } from "./TotalResultsValueOfCharacterGroup";
import { TransitionCharacterType } from "./TransitionCharacterType";
import { TransitionValueType } from "./TransitionValueType";

export function transitionResultValueStringify(constant: ITransitionResultValue) {
	if (!constant) return "";
	if (constant.$type == "BattleModel.TotalResultsValueOfCharacter") {
		const obj = constant as TotalResultsValueOfCharacter;
		return `在${transitionResultGroupStringify(
			obj.Results
		)}的${TransitionCharacterType.toString(obj.CharType)}中，${singleTargetStringify(
			obj.Character
		)}的${TransitionValueType.toString(obj.ValueType)}`;
	}
	if (constant.$type == "BattleModel.TotalResultsValueOfCharacterGroup") {
		const obj = constant as TotalResultsValueOfCharacterGroup;
		return `在${transitionResultGroupStringify(
			obj.Results
		)}的${TransitionCharacterType.toString(obj.CharType)}中，${mulitTargetStringify(
			obj.Group
		)}的${TransitionValueType.toString(obj.ValueType)}`;
	}
	console.error(`Unknown ITransitionResultValue type: ${constant.$type}`);
	debugger;
	return JSON.stringify(constant);
}

export function transitionResultGroupStringify(constant: ITransitionResultGroup) {
	if (!constant) return "";
	if (constant.$type == "BattleModel.ThisSkillSetResult") {
		const obj = constant as ThisSkillSetResult;
		return "此技能組";
	}
	if (constant.$type == "BattleModel.ThisTurnResult") {
		const obj = constant as ThisTurnResult;
		return "此回合";
	}
	console.error(`Unknown ITransitionResultGroup type: ${constant.$type}`);
	debugger;
	return JSON.stringify(constant);
}
