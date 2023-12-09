import { BaseSkillEffect } from "../skilleffect/BaseSkillEffect.js";
import { IBaseOperation } from "./IBaseOperation.js";
import { ITriggerOperation } from "./ITriggerOperation.js";

export interface ImmediatelySkillEffect extends ITriggerOperation, IBaseOperation {
	SkillEffect: BaseSkillEffect[];
}
