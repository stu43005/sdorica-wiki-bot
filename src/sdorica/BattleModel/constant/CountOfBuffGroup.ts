import { IGroupedBuff } from "../buff/grouped/IGroupedBuff";
import { ISingleInteger } from "./ISingleInteger";

export interface CountOfBuffGroup extends ISingleInteger {
	group: IGroupedBuff;
}
