import { StoneType } from "../StoneSystem/StoneType.js";
import { ISingleInteger } from "./ISingleInteger.js";

export interface StonePanelColorCount extends ISingleInteger {
	Type: StoneType;
}
