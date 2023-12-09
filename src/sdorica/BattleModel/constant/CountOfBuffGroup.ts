import { IGroupedBuff } from "../buff/grouped/IGroupedBuff.js";
import { ISingleInteger } from "./ISingleInteger.js";

export interface CountOfBuffGroup extends ISingleInteger {
	group: IGroupedBuff;
}
