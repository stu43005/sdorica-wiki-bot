import { StoneBuffAction } from "../StoneSystem/StoneBuffAction.js";
import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface StoneBuffSkillEffect extends BaseSkillEffect {
	_stoneBuffAction: StoneBuffAction;
}
