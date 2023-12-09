import { IGroupedInteger } from "./grouped/IGroupedInteger.js";
import { ISingleInteger } from "./ISingleInteger.js";

export interface MaxOfInts extends ISingleInteger {
	group: IGroupedInteger;
}
