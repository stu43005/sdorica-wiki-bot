import { ISingleInteger } from "./ISingleInteger.js";

export interface PlusInt extends ISingleInteger {
	left: ISingleInteger;
	right: ISingleInteger;
}
