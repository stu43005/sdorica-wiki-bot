import { HpDamageSkillEffect } from "./HpDamageSkillEffect";

export interface HpDamageDrainSkillEffect extends HpDamageSkillEffect {
	_drainRatio: number;
}
