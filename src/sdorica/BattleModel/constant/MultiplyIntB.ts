import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff";

export interface MultiplyIntB extends ISingleIntegerOfBuff {
	left: ISingleIntegerOfBuff;
	right: ISingleIntegerOfBuff;
}
