import { ISingleInteger } from "../constant/ISingleInteger.js";
import { SkillProperty } from "../SkillProperty.js";
import { IBaseOperation } from "./IBaseOperation.js";
import { ISkillEffectOperation } from "./ISkillEffectOperation.js";

export interface BonusEffectForSkillProperty extends ISkillEffectOperation, IBaseOperation {
	property: SkillProperty;
	value: ISingleInteger;
	isPercent: boolean;
}
