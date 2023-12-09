import { ISingleInteger } from "./ISingleInteger.js";

export interface MultiplyInt extends ISingleInteger {
	left: ISingleInteger;
	right: ISingleInteger;
}
