import { AddBuffData } from "../AddBuffData";
import { BoardModificationStoneAction } from "./BoardModificationStoneAction";
import { Constraint } from "./Constraint";

export interface StoneBuffAction extends BoardModificationStoneAction {
	targetStoneCount: number;
	buff: AddBuffData;
	filter: Constraint;
	action: StoneBuffAction.BuffChangeType;
	order: StoneBuffAction.Order;
}

export namespace StoneBuffAction {
	export enum BuffChangeType {
		Add,
		Remove,
	}

	export namespace BuffChangeType {
		export function toString(type: BuffChangeType): string {
			if (typeof type == "string") {
				const t2 = type as string;
				switch (t2) {
					case "Add":
						return "加入";
					case "Remove":
						return "移除";
				}
			}
			switch (type) {
				case BuffChangeType.Add:
					return "加入";
				case BuffChangeType.Remove:
					return "移除";
			}
		}
	}

	export enum Order {
		LeftToRight,
		RightToLeft,
		UpperLeftToLowerLeft,
		UpperRightToLowerRight,
		Random,
	}

	export namespace Order {
		export function toString(type: Order): string {
			if (typeof type == "string") {
				const t2 = type as string;
				switch (t2) {
					case "LeftToRight":
						return "左至右";
					case "RightToLeft":
						return "右至左";
					case "UpperLeftToLowerLeft":
						return "上左至下左";
					case "UpperRightToLowerRight":
						return "上右至下右";
					case "Random":
						return "隨機";
				}
			}
			switch (type) {
				case Order.LeftToRight:
					return "左至右";
				case Order.RightToLeft:
					return "右至左";
				case Order.UpperLeftToLowerLeft:
					return "上左至下左";
				case Order.UpperRightToLowerRight:
					return "上右至下右";
				case Order.Random:
					return "隨機";
			}
		}
	}
}
