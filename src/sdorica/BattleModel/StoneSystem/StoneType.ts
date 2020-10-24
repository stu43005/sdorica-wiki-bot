export enum StoneType {
	None = 0,
	Gold = 1,
	Black = 2,
	White = 4,
}

export namespace StoneType {
	export function toString(type: StoneType): string {
		switch (type) {
			case StoneType.Black:
				return "黑位";
			case StoneType.Gold:
				return "金位";
			case StoneType.White:
				return "白位";
		}
		return "無";
	}
}
