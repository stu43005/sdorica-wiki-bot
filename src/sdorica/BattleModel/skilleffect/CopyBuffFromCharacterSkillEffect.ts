import { IConditionOfBuff } from '../condition/IConditionOfBuff';
import { ISingleCharacter } from '../target/ISingleCharacter';
import { BaseSkillEffect } from "./BaseSkillEffect";

export interface CopyBuffFromCharacterSkillEffect extends BaseSkillEffect {
	SingleCharacter: ISingleCharacter;
	CopyAllBuff: boolean;
	FilterCondition: IConditionOfBuff;
	RandomSelectBuff: boolean;
	RandomCopyCount: number;
	NotRepeatSameBuffId: boolean;
}
