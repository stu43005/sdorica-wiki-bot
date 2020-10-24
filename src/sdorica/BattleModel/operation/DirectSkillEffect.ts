import { SkillUnit } from "../SkillUnit";
import { IBaseOperation } from "./IBaseOperation";
import { ITriggerOperation } from "./ITriggerOperation";

export interface DirectSkillEffect extends ITriggerOperation, IBaseOperation {
	willTriggerBuff: boolean;
	skillUnit: SkillUnit;
}
