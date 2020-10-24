import { StoneType } from "../StoneSystem/StoneType";
import { ISingleInteger } from "./ISingleInteger";

export interface StonePanelColorCount extends ISingleInteger {
	Type: StoneType;
}
