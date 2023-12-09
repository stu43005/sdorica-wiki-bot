import { IGroupedInteger } from "./grouped/IGroupedInteger.js";
import { ISingleInteger } from "./ISingleInteger.js";

export interface MinOfInts extends ISingleInteger {
	group: IGroupedInteger;
}
