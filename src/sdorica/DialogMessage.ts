import { DialogIconLocate } from "./DialogIconLocate";

export interface DialogMessage {
	ID: string;
	SpeakerName: string;
	SpeakerAssetName: string;
	IconName: string;
	IconLocate: DialogIconLocate;
	Text: string;
	sfxName: string;
}
