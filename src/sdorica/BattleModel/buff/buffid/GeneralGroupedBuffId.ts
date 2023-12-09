import { IGroupedBuff } from "../grouped/IGroupedBuff.js";
import { IGroupedBuffId } from "./IGroupedBuffId.js";

export interface GeneralGroupedBuffId extends IGroupedBuffId {
	BuffGroup: IGroupedBuff;
}
