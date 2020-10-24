import { ISingleInteger } from "../constant/ISingleInteger";
import { BaseSkillEffect } from "./BaseSkillEffect";

export interface ChangeHungerSkillEffect extends BaseSkillEffect {
	_value: ISingleInteger;
}
