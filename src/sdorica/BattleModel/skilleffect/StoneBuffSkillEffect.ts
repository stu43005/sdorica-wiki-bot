import { StoneBuffAction } from "../StoneSystem/StoneBuffAction";
import { BaseSkillEffect } from "./BaseSkillEffect";

export interface StoneBuffSkillEffect extends BaseSkillEffect {
	_stoneBuffAction: StoneBuffAction;
}
