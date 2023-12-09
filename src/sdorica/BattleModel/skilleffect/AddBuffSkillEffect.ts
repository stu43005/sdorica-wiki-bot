import { AddBuffData } from "../AddBuffData.js";
import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface AddBuffSkillEffect extends BaseSkillEffect {
	_buffData: AddBuffData[];
}
