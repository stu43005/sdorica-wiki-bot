import { IGroupedInteger } from "./grouped/IGroupedInteger";
import { ISingleInteger } from "./ISingleInteger";

export interface MinOfInts extends ISingleInteger {
	group: IGroupedInteger;
}
