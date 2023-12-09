import { IGroupedInteger } from "./grouped/IGroupedInteger.js";
import { ISingleInteger } from "./ISingleInteger.js";

export interface SumOfInts extends ISingleInteger {
	group: IGroupedInteger;
}
