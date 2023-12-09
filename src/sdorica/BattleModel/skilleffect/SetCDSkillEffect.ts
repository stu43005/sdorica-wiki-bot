import { ISingleInteger } from "../constant/ISingleInteger.js";
import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface SetCDSkillEffect extends BaseSkillEffect {
	_integer: ISingleInteger;
}
