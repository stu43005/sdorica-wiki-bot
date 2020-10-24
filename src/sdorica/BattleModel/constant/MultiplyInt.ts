import { ISingleInteger } from "./ISingleInteger";

export interface MultiplyInt extends ISingleInteger {
	left: ISingleInteger;
	right: ISingleInteger;
}
