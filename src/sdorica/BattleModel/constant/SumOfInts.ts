import { IGroupedInteger } from "./grouped/IGroupedInteger";
import { ISingleInteger } from "./ISingleInteger";

export interface SumOfInts extends ISingleInteger {
	group: IGroupedInteger;
}
