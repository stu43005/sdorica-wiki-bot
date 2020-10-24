import { ISingleInteger } from "../constant/ISingleInteger";
import { BaseSkillEffect } from "./BaseSkillEffect";

export interface ChangeTireSkillEffect extends BaseSkillEffect {
	_value: ISingleInteger;
}
