import { IGroupedInteger } from "./grouped/IGroupedInteger";
import { ISingleInteger } from "./ISingleInteger";

export interface MaxOfInts extends ISingleInteger {
	group: IGroupedInteger;
}
