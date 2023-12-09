import { DialogIconLocate } from "./DialogIconLocate.js";

export interface DialogMessage {
	ID: string;
	SpeakerName: string;
	SpeakerAssetName: string;
	IconName: string;
	IconLocate: DialogIconLocate;
	Text: string;
	sfxName: string;
	sfxVolume: number;
}
