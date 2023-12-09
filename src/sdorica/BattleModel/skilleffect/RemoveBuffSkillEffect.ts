import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface RemoveBuffSkillEffect extends BaseSkillEffect {
	_buffID: string;
}
