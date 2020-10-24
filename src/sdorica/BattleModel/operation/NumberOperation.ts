export enum NumberOperation {
	Change = "Change",
	Set = "Set",
}

export namespace NumberOperation {
	export function toString(op: NumberOperation) {
		switch (op) {
			case NumberOperation.Change: return "增加";
			case NumberOperation.Set: return "改為";
		}
		return NumberOperation[op] || op;
	}
}
