import { IGroupedInteger } from "../constant/grouped/IGroupedInteger";
import { ISingleInteger } from "../constant/ISingleInteger";
import { SkillUnit } from "../SkillUnit";
import { IGroupedCharacter } from "../target/IGroupedCharacter";
import { ISingleCharacter } from "../target/ISingleCharacter";
import { IBaseOperation } from "./IBaseOperation";
import { ITriggerOperation } from "./ITriggerOperation";

export type AssignParameterSkillEffect = UseAssignValueSkillEffect | UseAssignParameterSkillEffect;

export interface UseAssignValueSkillEffect extends ITriggerOperation, IBaseOperation {
	WillTriggerBuff: boolean;
	AssignValue: ISingleInteger;
	UseAssignParameter?: false;
	SkillUnit: SkillUnit;
}

export interface UseAssignParameterSkillEffect extends ITriggerOperation, IBaseOperation {
	WillTriggerBuff: boolean;
	AssignParameter: AssignParameter;
	UseAssignParameter: true;
	SkillUnit: SkillUnit;
}

export interface AssignParameter {
	AssignCharacter: ISingleCharacter;
	AssignCharacterGroup: IGroupedCharacter;
	AssignInteger: ISingleInteger;
	AssignIntegerGroup: IGroupedInteger;
}
