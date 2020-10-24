import { BaseSkillEffect } from "./skilleffect/BaseSkillEffect";
import { skillEffectStringify } from "./skilleffect/SkillEffectStringify";
import { IGroupedCharacter } from "./target/IGroupedCharacter";
import { ISingleCharacter } from "./target/ISingleCharacter";
import { targetResolve } from "./target/TargetStringify";

export interface SkillUnit {
	IsMultiple: boolean;
	CanBeEmpty: boolean;
	single?: ISingleCharacter;
	multi?: IGroupedCharacter;
	skillEffects: BaseSkillEffect[];
}

export function skillUnitStringify(unit: SkillUnit): string {
	return targetResolve(unit) + unit.skillEffects.map((effect) => {
		return `${skillEffectStringify(effect)}`;
	}).join("、");
}
