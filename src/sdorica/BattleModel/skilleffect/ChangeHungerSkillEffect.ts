import { ISingleInteger } from "../constant/ISingleInteger.js";
import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface ChangeHungerSkillEffect extends BaseSkillEffect {
	_value: ISingleInteger;
}
