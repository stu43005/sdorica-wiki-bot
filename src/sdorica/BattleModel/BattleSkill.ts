import { IBattleSkill } from "./IBattleSkill";
import { SkillUnit } from "./SkillUnit";

export interface BattleSkill extends IBattleSkill {
	_skillIdentifiers: SkillUnit[];
	_isResolveTargetEachUnit: boolean;
}
