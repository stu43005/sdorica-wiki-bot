import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff.js";

export interface MultiplyFloatB extends ISingleIntegerOfBuff {
	left: ISingleIntegerOfBuff;
	ratio: number;
}
