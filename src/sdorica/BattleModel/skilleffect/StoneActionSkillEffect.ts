import { PreselectStoneAction } from "../StoneSystem/PreselectStoneAction.js";
import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface StoneActionSkillEffect extends BaseSkillEffect {
	_stoneAction: PreselectStoneAction;
}
