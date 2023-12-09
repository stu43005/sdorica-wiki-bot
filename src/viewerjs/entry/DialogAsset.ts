import { DialogAsset } from "../../sdorica/DialogAsset.js";
import { type ViewerJSHelper } from "../viewerjs-helper.js";

export default async function (helper: ViewerJSHelper, data: DialogAsset) {
	data.$interpreted = interpreted(data);
	return data;
}

export function interpreted(data: DialogAsset) {
	const out: string[] = [];
	for (let i = 0; i < data.Model.length; i++) {
		const content = data.Model[i];
		out.push(`${content.SpeakerName}: ${content.Text}`);
	}
	return out;
}
