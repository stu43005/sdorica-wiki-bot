export interface InterpretedBattleCharacter {
	Localization: string;
	攻擊力: number;
	攻擊力等級調整後: number;
	血量: number;
	血量等級調整後: number;
	疊盾: number;
	疊盾等級調整後: number;
	復活魂芯數: number;
	站位: string;
	起始CD: number;
	預設CD: number;
	敵人AI?: string;
	被動Buff: string[];
	消魂設置?: Record<string, string>;
	技能組: Record<string, InterpretedSkillSet[]>;
	技能: Record<string, string[]>;
	參謀技能?: InterpretedAssistantSkill;
}

export interface InterpretedSkillSet {
	條件: string[];
	目標: string;
	技能列表: string[];
	CoolDown: number;
}

export interface InterpretedAssistantSkill {
	類型: string;
	起始CD: number;
	技能CD: number;
	_startCastStack: number;
	_maxCastStack: number;
}

export interface InterpretedAssistantPassiveBuffSkill extends InterpretedAssistantSkill {
	動作: string;
}

export interface InterpretedAssistantActiveCastSkill extends InterpretedAssistantSkill {
	技能組: InterpretedSkillSet[];
}

export interface InterpretedAssistantActiveCastSkillWithPassiveBuff
	extends InterpretedAssistantActiveCastSkill {
	被動: string[];
}
