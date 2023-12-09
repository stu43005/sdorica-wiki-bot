import { IConditionOfBuff } from "../condition/IConditionOfBuff.js";
import { ISingleCharacter } from "../target/ISingleCharacter.js";
import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface CopyBuffFromCharacterSkillEffect extends BaseSkillEffect {
	SingleCharacter: ISingleCharacter;
	CopyAllBuff: boolean;
	FilterCondition: IConditionOfBuff;
	RandomSelectBuff: boolean;
	RandomCopyCount: number;
	NotRepeatSameBuffId: boolean;
}
