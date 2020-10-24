import { PreselectStoneAction } from "../StoneSystem/PreselectStoneAction";
import { BaseSkillEffect } from "./BaseSkillEffect";

export interface StoneActionSkillEffect extends BaseSkillEffect {
	_stoneAction: PreselectStoneAction;
}
