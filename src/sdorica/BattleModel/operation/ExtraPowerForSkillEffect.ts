import { ISingleInteger } from "../constant/ISingleInteger";
import { IBaseOperation } from "./IBaseOperation";
import { ISkillEffectOperation } from "./ISkillEffectOperation";

export interface ExtraPowerForSkillEffect extends ISkillEffectOperation, IBaseOperation {
	value: ISingleInteger;
	isPercent: boolean;
}
