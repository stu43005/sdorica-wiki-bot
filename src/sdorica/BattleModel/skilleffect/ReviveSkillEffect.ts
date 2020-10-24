import { BaseSkillEffect } from "./BaseSkillEffect";

export interface ReviveSkillEffect extends BaseSkillEffect {
	ReviveTargetBlood: number;
	ReviveTargetArmor: number;
	RecoverBloodInPercentage: boolean;
	RecoverArmorInPercentage: boolean;
}
