import { Dictionary } from "../Dictionary.js";
import { AddBuffData } from "./AddBuffData.js";
import { AssistantSkill } from "./AssistantSkill.js";
import { BattleCharacterPose } from "./BattleCharacterPose.js";
import { EnemyAI } from "./EnemyAI.js";
import { IBattleSkill } from "./IBattleSkill.js";
import { SkillSet } from "./SkillSet.js";
import { StoneEraseType } from "./StoneSystem/StoneEraseType.js";
import { StoneType } from "./StoneSystem/StoneType.js";

export interface BattleCharacter {
	_power: number;
	_bloodCapacity: number;
	_armorCapacity: number;
	_passiveBuff: AddBuffData[];
	_characterAI: EnemyAI;
	_stoneEraseSetting: Dictionary<StoneEraseType, string>;
	_skillsetTable: Record<string, SkillSet>;
	_skills: Record<string, IBattleSkill>;
	ReferenceBuffKeys: string[];
	_reviveCount: number;
	_stoneType: StoneType;
	_assistantSkill: AssistantSkill;
	_initialCoolDown: number;
	_defaultCoolDown: number;
	_masterRank: number;
	_mass: number;
	_pose: BattleCharacterPose;
}

export namespace BattleCharacter {
	export const LEVEL_RATIO = 1.06;
	export const SUBRANK_HP_ADD = 300;
	export const SUBRANK_ATK_ADD = 50;
}
