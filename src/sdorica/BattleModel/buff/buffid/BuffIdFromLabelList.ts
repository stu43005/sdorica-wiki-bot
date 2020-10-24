import { BuffLabelData } from "../../BuffLabelData";
import { IGroupedBuffId } from "./IGroupedBuffId";

export interface BuffIdFromLabelList extends IGroupedBuffId {
	BuffLabel: BuffLabelData;
}
