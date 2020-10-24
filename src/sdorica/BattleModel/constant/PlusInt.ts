import { ISingleInteger } from "./ISingleInteger";

export interface PlusInt extends ISingleInteger {
	left: ISingleInteger;
	right: ISingleInteger;
}
