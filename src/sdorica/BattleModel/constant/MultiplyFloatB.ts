import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff";

export interface MultiplyFloatB extends ISingleIntegerOfBuff {
	left: ISingleIntegerOfBuff;
	ratio: number;
}
