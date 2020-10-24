import { BaseScriptableObject } from "../lib/FullInspector/BaseScriptableObject";

export interface WrapperAsset<T2> extends BaseScriptableObject {
	Model: T2;
}
