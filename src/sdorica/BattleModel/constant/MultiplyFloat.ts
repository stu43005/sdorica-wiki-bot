import { ISingleInteger } from "./ISingleInteger.js";

export interface MultiplyFloat extends ISingleInteger {
	left: ISingleInteger;
	ratio: number;
}
