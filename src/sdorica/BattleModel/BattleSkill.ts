import { IBattleSkill } from "./IBattleSkill.js";
import { SkillUnit } from "./SkillUnit.js";

export interface BattleSkill extends IBattleSkill {
	_skillIdentifiers: SkillUnit[];
	_isResolveTargetEachUnit: boolean;
}
