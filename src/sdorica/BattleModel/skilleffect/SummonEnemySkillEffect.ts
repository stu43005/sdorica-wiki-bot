import { ISummonSingleCharacter } from "../summon/ISummonSingleCharacter.js";
import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface SummonEnemySkillEffect extends BaseSkillEffect {
	Reference: ISummonSingleCharacter;
}
