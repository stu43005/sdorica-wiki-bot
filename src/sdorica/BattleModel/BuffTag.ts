export interface BuffTagDefine {
	BuffTag: BuffTag;
}

export enum BuffTag {
	Hidden = 1,
	NotRemoveAfterBattle = 2,
	NotRemoveWhenDie = 4,
	TriggerOncePerTurn = 8,
	Taunt = 16, // 0x00000010
	TriggerMaxLeveLTimesPerTurn = 32, // 0x00000020
	Forever = 64, // 0x00000040
	Undead = 128, // 0x00000080
	Redirect = 256, // 0x00000100
	DoNotAddBackOnRevive = 512, // 0x00000200
	StackIndependent = 1024, // 0x00000400
	ChangeIdle2 = 2048, // 0x00000800
	DoNotDisplayHit = 4096, // 0x00001000
	SkipSkill = 8192, // 0x00002000
	ChangeIdle3 = 16384, // 0x00004000
	InfinityTrigger = 32768, // 0x00008000
	CanCastSkillWhenDie = 65536, // 0x00010000
	DoNotDisplayHitAction = 131072, // 0x00020000
}

const BuffTagList = [
	BuffTag.Hidden,
	BuffTag.NotRemoveAfterBattle,
	BuffTag.NotRemoveWhenDie,
	BuffTag.TriggerOncePerTurn,
	BuffTag.Taunt,
	BuffTag.TriggerMaxLeveLTimesPerTurn,
	BuffTag.Forever,
	BuffTag.Undead,
	BuffTag.Redirect,
	BuffTag.DoNotAddBackOnRevive,
	BuffTag.StackIndependent,
	BuffTag.ChangeIdle2,
	BuffTag.DoNotDisplayHit,
	BuffTag.SkipSkill,
	BuffTag.ChangeIdle3,
	BuffTag.InfinityTrigger,
	BuffTag.CanCastSkillWhenDie,
	BuffTag.DoNotDisplayHitAction,
];

export namespace BuffTag {
	export function toString(tag: BuffTag): string {
		return BuffTagList.filter(t => (tag & t) == t).map(t => BuffTag[t]).join(" | ");
	}
}
