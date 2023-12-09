import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface ReviveSkillEffect extends BaseSkillEffect {
	ReviveTargetBlood: number;
	ReviveTargetArmor: number;
	RecoverBloodInPercentage: boolean;
	RecoverArmorInPercentage: boolean;
}
