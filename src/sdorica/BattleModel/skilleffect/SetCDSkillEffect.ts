import { ISingleInteger } from "../constant/ISingleInteger";
import { BaseSkillEffect } from "./BaseSkillEffect";

export interface SetCDSkillEffect extends BaseSkillEffect {
	_integer: ISingleInteger;
}
