import { BaseSkillEffect } from "./skilleffect/BaseSkillEffect.js";
import { skillEffectStringify } from "./skilleffect/SkillEffectStringify.js";
import { IGroupedCharacter } from "./target/IGroupedCharacter.js";
import { ISingleCharacter } from "./target/ISingleCharacter.js";
import { targetResolve } from "./target/TargetStringify.js";

export interface SkillUnit {
	IsMultiple: boolean;
	CanBeEmpty: boolean;
	single?: ISingleCharacter;
	multi?: IGroupedCharacter;
	skillEffects: BaseSkillEffect[];
}

export function skillUnitStringify(unit: SkillUnit): string {
	return (
		targetResolve(unit) +
		unit.skillEffects
			.map((effect) => {
				return `${skillEffectStringify(effect)}`;
			})
			.join("、")
	);
}
