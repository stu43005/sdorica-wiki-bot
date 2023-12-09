import { IGroupedInteger } from "../constant/grouped/IGroupedInteger.js";
import { ISingleInteger } from "../constant/ISingleInteger.js";
import { SkillUnit } from "../SkillUnit.js";
import { IGroupedCharacter } from "../target/IGroupedCharacter.js";
import { ISingleCharacter } from "../target/ISingleCharacter.js";
import { IBaseOperation } from "./IBaseOperation.js";
import { ITriggerOperation } from "./ITriggerOperation.js";

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
