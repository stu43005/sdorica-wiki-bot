import { IGroupedBuff } from "../grouped/IGroupedBuff";
import { IGroupedBuffId } from "./IGroupedBuffId";

export interface GeneralGroupedBuffId extends IGroupedBuffId {
	BuffGroup: IGroupedBuff;
}
