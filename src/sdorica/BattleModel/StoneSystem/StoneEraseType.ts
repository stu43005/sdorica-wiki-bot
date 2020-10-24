export enum StoneEraseType {
	Invalid = -1,
	Type1 = 0,
	Type2 = 1,
	Type4 = 2,
	Type3_L = 3,
	Type3_I = 4,
	Type4_L = 5,
	Type4_I = 6,
	Type6 = 7,
}

export namespace StoneEraseType {
	export function toString(type: StoneEraseType): string {
		return StoneEraseType[type];
	}
}
