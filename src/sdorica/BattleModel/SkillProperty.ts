export interface SkillPropertyDefine {
	SkillProperty: SkillProperty;
}

export enum SkillProperty {
	None = 0,
	Attack = 1,
	Defend = 2,
	Special = 4,
	NormalDamage = 8,
	BreakArmor = 16, // 0x00000010
	Heal = 32, // 0x00000020
	GainArmor = 64, // 0x00000040
	AddBuff = 128, // 0x00000080
	Summon = 256, // 0x00000100
	StoneAction = 512, // 0x00000200
	ChangeCD = 1024, // 0x00000400
	DismissArmor = 2048, // 0x00000800
	RemoveBuff = 4096, // 0x00001000
	TrueDamage = 8192, // 0x00002000
	ExploreFlag = 16384, // 0x00004000
}

const SkillPropertyList = [
	SkillProperty.Attack,
	SkillProperty.Defend,
	SkillProperty.Special,
	SkillProperty.NormalDamage,
	SkillProperty.BreakArmor,
	SkillProperty.Heal,
	SkillProperty.GainArmor,
	SkillProperty.AddBuff,
	SkillProperty.Summon,
	SkillProperty.StoneAction,
	SkillProperty.ChangeCD,
	SkillProperty.DismissArmor,
	SkillProperty.RemoveBuff,
	SkillProperty.TrueDamage,
	SkillProperty.ExploreFlag,
];

export namespace SkillProperty {
	export function toString(prop: SkillProperty) {
		return SkillPropertyList.filter((t) => (prop & t) == t)
			.map((t) => SkillProperty[t])
			.join(" | ");
	}
}
