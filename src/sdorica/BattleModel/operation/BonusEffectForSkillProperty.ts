import { ISingleInteger } from "../constant/ISingleInteger";
import { SkillProperty } from "../SkillProperty";
import { IBaseOperation } from "./IBaseOperation";
import { ISkillEffectOperation } from "./ISkillEffectOperation";

export interface BonusEffectForSkillProperty extends ISkillEffectOperation, IBaseOperation {
	property: SkillProperty;
	value: ISingleInteger;
	isPercent: boolean;
}
