import { HpDamageSkillEffect } from "./HpDamageSkillEffect.js";

export interface HpDamageDrainSkillEffect extends HpDamageSkillEffect {
	_drainRatio: number;
}
