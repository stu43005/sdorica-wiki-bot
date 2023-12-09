import { BaseScriptableObject } from "../lib/FullInspector/BaseScriptableObject.js";
import { DialogMessage } from "./DialogMessage.js";

export interface DialogAsset extends BaseScriptableObject {
	Model: DialogMessage[];
	ReferenceAavatarImage: string[];
	ReferenceDialogAudio: string[];

	$interpreted?: string[];
}
