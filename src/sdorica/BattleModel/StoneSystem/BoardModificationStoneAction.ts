import { StoneAction } from "./StoneAction";

export interface BoardModificationStoneAction extends StoneAction {
}

export namespace BoardModificationStoneAction {
	export enum ChangeType {
		Erase = 0,
		ToGold = 1,
		ToBlack = 2,
		ToWhite = 4,
	}

	export namespace ChangeType {
		export function toString(type: ChangeType): string {
			if (typeof type == "string") {
				const t2 = type as string;
				switch (t2) {
					case "Erase":
						return "消除";
					case "ToGold":
						return "轉為金色魂芯";
					case "ToBlack":
						return "轉為黑色魂芯";
					case "ToWhite":
						return "轉為白色魂芯";
				}
			}
			switch (type) {
				case ChangeType.Erase:
					return "消除";
				case ChangeType.ToGold:
					return "轉為金色魂芯";
				case ChangeType.ToBlack:
					return "轉為黑色魂芯";
				case ChangeType.ToWhite:
					return "轉為白色魂芯";
			}
		}
	}
}
