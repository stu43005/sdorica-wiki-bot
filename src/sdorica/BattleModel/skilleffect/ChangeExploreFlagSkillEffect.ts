import { ISingleInteger } from "../constant/ISingleInteger.js";
import { NumberOperation } from "../operation/NumberOperation.js";
import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface ChangeExploreFlagSkillEffect extends BaseSkillEffect {
	_flagId: string;
	_operation: NumberOperation;
	_value: ISingleInteger;
}
