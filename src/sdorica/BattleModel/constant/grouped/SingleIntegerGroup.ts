import { ISingleInteger } from "../ISingleInteger";
import { IGroupedInteger } from "./IGroupedInteger";

export interface SingleIntegerGroup extends IGroupedInteger {
	SingleIntegers: ISingleInteger[];
}
