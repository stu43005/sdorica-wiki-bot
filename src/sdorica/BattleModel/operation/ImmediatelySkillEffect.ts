import { BaseSkillEffect } from "../skilleffect/BaseSkillEffect";
import { IBaseOperation } from "./IBaseOperation";
import { ITriggerOperation } from "./ITriggerOperation";

export interface ImmediatelySkillEffect extends ITriggerOperation, IBaseOperation {
	SkillEffect: BaseSkillEffect[];
}
