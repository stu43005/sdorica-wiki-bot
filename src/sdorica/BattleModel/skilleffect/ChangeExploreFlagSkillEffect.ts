import { ISingleInteger } from "../constant/ISingleInteger";
import { NumberOperation } from "../operation/NumberOperation";
import { BaseSkillEffect } from "./BaseSkillEffect";

export interface ChangeExploreFlagSkillEffect extends BaseSkillEffect {
	_flagId: string;
	_operation: NumberOperation;
	_value: ISingleInteger;
}
