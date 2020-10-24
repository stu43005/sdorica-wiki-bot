import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff";

export interface PlusIntB extends ISingleIntegerOfBuff {
	left: ISingleIntegerOfBuff;
	right: ISingleIntegerOfBuff;
}
