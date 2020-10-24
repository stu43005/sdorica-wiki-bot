export enum Constraint {
	None,
	IsGold,
	IsBlack,
	IsNotWhite,
	IsWhite,
	IsNotBlack,
	IsNotGold,
	IsAllColor,
}

export namespace Constraint {
	export function toString(type: Constraint) {
		if (typeof type == "string") {
			const t2 = type as string;
			switch (t2) {
				case "IsGold":
					return "金色魂芯";
				case "IsBlack":
					return "黑色魂芯";
				case "IsWhite":
					return "白色魂芯";
				case "IsNotGold":
					return "非金色魂芯";
				case "IsNotBlack":
					return "非黑色魂芯";
				case "IsNotWhite":
					return "非白色魂芯";
				case "IsAllColor":
					return "任何顏色的魂芯";
			}
			return "魂芯";
		}
		switch (type) {
			case Constraint.IsGold:
				return "金色魂芯";
			case Constraint.IsBlack:
				return "黑色魂芯";
			case Constraint.IsWhite:
				return "白色魂芯";
			case Constraint.IsNotGold:
				return "非金色魂芯";
			case Constraint.IsNotBlack:
				return "非黑色魂芯";
			case Constraint.IsNotWhite:
				return "非白色魂芯";
			case Constraint.IsAllColor:
				return "任何顏色的魂芯";
		}
		return "魂芯";
	}
}