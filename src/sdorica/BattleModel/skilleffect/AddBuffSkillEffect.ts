import { AddBuffData } from "../AddBuffData";
import { BaseSkillEffect } from "./BaseSkillEffect";

export interface AddBuffSkillEffect extends BaseSkillEffect {
	_buffData: AddBuffData[];
}
