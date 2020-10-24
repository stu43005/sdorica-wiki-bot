import { InterpretedObjectBase } from "../viewerjs/leveldata-tarns-event";
import { LevelEventModel } from "./LevelEventModel";
import { WrapperAsset } from "./WrapperAsset";

export interface LevelEventAsset extends WrapperAsset<LevelEventModel> {
	$interpreted?: InterpretedObjectBase[];
}
