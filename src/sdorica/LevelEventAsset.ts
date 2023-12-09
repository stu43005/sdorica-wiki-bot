import { InterpretedObjectBase } from "../viewerjs/leveldata-tarns-event.js";
import { LevelEventModel } from "./LevelEventModel.js";
import { WrapperAsset } from "./WrapperAsset.js";

export interface LevelEventAsset extends WrapperAsset<LevelEventModel> {
	$interpreted?: InterpretedObjectBase[];
}
