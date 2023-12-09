import { BuffLabelData } from "../../BuffLabelData.js";
import { IGroupedBuffId } from "./IGroupedBuffId.js";

export interface BuffIdFromLabelList extends IGroupedBuffId {
	BuffLabel: BuffLabelData;
}
