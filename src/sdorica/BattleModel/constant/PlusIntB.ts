import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff.js";

export interface PlusIntB extends ISingleIntegerOfBuff {
	left: ISingleIntegerOfBuff;
	right: ISingleIntegerOfBuff;
}
