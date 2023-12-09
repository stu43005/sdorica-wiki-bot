import { ISingleInteger } from "../ISingleInteger.js";
import { IGroupedInteger } from "./IGroupedInteger.js";

export interface SingleIntegerGroup extends IGroupedInteger {
	SingleIntegers: ISingleInteger[];
}
