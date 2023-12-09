import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff.js";

export interface MultiplyIntB extends ISingleIntegerOfBuff {
	left: ISingleIntegerOfBuff;
	right: ISingleIntegerOfBuff;
}
