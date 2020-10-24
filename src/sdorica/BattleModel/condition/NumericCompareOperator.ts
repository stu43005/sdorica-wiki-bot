export enum NumericCompareOperator {
	Equal, // 0
	Less, // 1
	Greater, // 2
	LessOrEqual, // 3
	GreaterOrEqual, // 4
	NotEqual, // 5
}

export namespace NumericCompareOperator {
	export function toString(op: NumericCompareOperator) {
		switch (op) {
			case NumericCompareOperator.Equal:
				return "==";
			case NumericCompareOperator.Less:
				return "<";
			case NumericCompareOperator.Greater:
				return ">";
			case NumericCompareOperator.LessOrEqual:
				return "<=";
			case NumericCompareOperator.GreaterOrEqual:
				return ">=";
			case NumericCompareOperator.NotEqual:
				return "!=";
		}
	}

	export function inverse(op: NumericCompareOperator) {
		switch (op) {
			case NumericCompareOperator.Equal:
				return NumericCompareOperator.NotEqual;
			case NumericCompareOperator.Less:
				return NumericCompareOperator.GreaterOrEqual;
			case NumericCompareOperator.Greater:
				return NumericCompareOperator.LessOrEqual;
			case NumericCompareOperator.LessOrEqual:
				return NumericCompareOperator.Greater;
			case NumericCompareOperator.GreaterOrEqual:
				return NumericCompareOperator.Less;
			case NumericCompareOperator.NotEqual:
				return NumericCompareOperator.Equal;
		}
	}
}
