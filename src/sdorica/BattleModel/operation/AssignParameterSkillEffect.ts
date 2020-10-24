import { ISingleInteger } from "../constant/ISingleInteger";
import { SkillUnit } from "../SkillUnit";
import { IBaseOperation } from "./IBaseOperation";
import { ITriggerOperation } from "./ITriggerOperation";

export interface AssignParameterSkillEffect extends ITriggerOperation, IBaseOperation {
	WillTriggerBuff: boolean;
	AssignValue: ISingleInteger;
	SkillUnit: SkillUnit;
}
