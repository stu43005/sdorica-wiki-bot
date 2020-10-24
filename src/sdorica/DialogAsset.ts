import { BaseScriptableObject } from "../lib/FullInspector/BaseScriptableObject";
import { DialogMessage } from "./DialogMessage";

export interface DialogAsset extends BaseScriptableObject {
	Model: DialogMessage[];
	ReferenceAavatarImage: string[];
	ReferenceDialogAudio: string[];

	$interpreted?: string[];
}
