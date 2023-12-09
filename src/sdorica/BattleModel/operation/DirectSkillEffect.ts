import { SkillUnit } from "../SkillUnit.js";
import { IBaseOperation } from "./IBaseOperation.js";
import { ITriggerOperation } from "./ITriggerOperation.js";

export interface DirectSkillEffect extends ITriggerOperation, IBaseOperation {
	willTriggerBuff: boolean;
	skillUnit: SkillUnit;
}
