import { Dictionary } from "../Dictionary";
import { AddBuffData } from "./AddBuffData";
import { AssistantSkill } from "./AssistantSkill";
import { BattleCharacterPose } from "./BattleCharacterPose";
import { EnemyAI } from "./EnemyAI";
import { IBattleSkill } from "./IBattleSkill";
import { SkillSet } from "./SkillSet";
import { StoneEraseType } from "./StoneSystem/StoneEraseType";
import { StoneType } from "./StoneSystem/StoneType";

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
