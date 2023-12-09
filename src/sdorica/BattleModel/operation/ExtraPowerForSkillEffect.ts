import { ISingleInteger } from "../constant/ISingleInteger.js";
import { IBaseOperation } from "./IBaseOperation.js";
import { ISkillEffectOperation } from "./ISkillEffectOperation.js";

export interface ExtraPowerForSkillEffect extends ISkillEffectOperation, IBaseOperation {
	value: ISingleInteger;
	isPercent: boolean;
}
