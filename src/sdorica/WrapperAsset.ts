import { BaseScriptableObject } from "../lib/FullInspector/BaseScriptableObject.js";

export interface WrapperAsset<T2> extends BaseScriptableObject {
	Model: T2;
}
