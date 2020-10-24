import { SkillValue } from "../SkillValue";
import { BaseSkillEffect } from "./BaseSkillEffect";

export interface NumericSkillEffect extends BaseSkillEffect {
	_skillModifier: SkillValue;
}

export namespace NumericSkillEffect {
	export const DamageCoefficient = 1;
	export const BreakArmorCoefficient = 0.75;
	export const ArmorCoefficient = 1.2;
	export const HealCoefficient = 0.9;
}
