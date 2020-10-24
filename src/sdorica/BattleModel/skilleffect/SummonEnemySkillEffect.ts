import { ISummonSingleCharacter } from "../summon/ISummonSingleCharacter";
import { BaseSkillEffect } from "./BaseSkillEffect";

export interface SummonEnemySkillEffect extends BaseSkillEffect {
	Reference: ISummonSingleCharacter;
}
