export interface BuffActiveTimingDefine {
	BuffActiveTiming: BuffActiveTiming;
}

export enum BuffActiveTiming {
	OnTurnBegin = 1,
	OnTurnEnd = 2,
	OnEachSkillSetStart = 4,
	OnEachSkillSetEnd = 8,
	OnCalculatePower = 32, // 0x00000020
	OnEachSkill = 64, // 0x00000040
	OnEachSkillTarget = 256, // 0x00000100
	OnEachSkillTargetEffect = 1024, // 0x00000400
	OnEverySecond = 2048, // 0x00000800
	OnBuffStack = 8192, // 0x00002000
	OnBuffAdd = 16384, // 0x00004000
	OnBuffFinish = 32768, // 0x00008000
	OnBuffRemove = 65536, // 0x00010000
	BeforeAnyoneDie = 131072, // 0x00020000
	AfterAnyoneRevive = 262144, // 0x00040000
	AfterSummonAnyone = 524288, // 0x00080000
	AfterAnyoneDie = 1048576, // 0x00100000
	OnBuffStackFromAnyone = 2097152, // 0x00200000
	OnBuffAddFromAnyone = 4194304, // 0x00400000
	OnBuffFinishFromAnyone = 8388608, // 0x00800000
	OnBuffRemoveFromAnyone = 16777216, // 0x01000000
}

const BuffActiveTimingList = [
	BuffActiveTiming.OnTurnBegin,
	BuffActiveTiming.OnTurnEnd,
	BuffActiveTiming.OnEachSkillSetStart,
	BuffActiveTiming.OnEachSkillSetEnd,
	BuffActiveTiming.OnCalculatePower,
	BuffActiveTiming.OnEachSkill,
	BuffActiveTiming.OnEachSkillTarget,
	BuffActiveTiming.OnEachSkillTargetEffect,
	BuffActiveTiming.OnEverySecond,
	BuffActiveTiming.OnBuffStack,
	BuffActiveTiming.OnBuffAdd,
	BuffActiveTiming.OnBuffFinish,
	BuffActiveTiming.OnBuffRemove,
	BuffActiveTiming.BeforeAnyoneDie,
	BuffActiveTiming.AfterAnyoneRevive,
	BuffActiveTiming.AfterSummonAnyone,
	BuffActiveTiming.AfterAnyoneDie,
	BuffActiveTiming.OnBuffStackFromAnyone,
	BuffActiveTiming.OnBuffAddFromAnyone,
	BuffActiveTiming.OnBuffFinishFromAnyone,
	BuffActiveTiming.OnBuffRemoveFromAnyone,
];

export namespace BuffActiveTiming {
	export function toString(timing: BuffActiveTiming): string {
		return BuffActiveTimingList.filter((t) => (timing & t) == t)
			.map((t) => BuffActiveTiming[t])
			.join(" | ");
	}
}
