import { ISingleInteger } from "../constant/ISingleInteger.js";
import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface ChangeTireSkillEffect extends BaseSkillEffect {
	_value: ISingleInteger;
}
