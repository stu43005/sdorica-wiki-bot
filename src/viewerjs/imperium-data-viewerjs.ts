import { ImperiumData } from "../imperium-data.js";
import { type ViewerJSHelper } from "./viewerjs-helper.js";

export function registerImperiumDataViewerJS(helper: ViewerJSHelper) {
	ImperiumData.dataLoader = async (self) => {
		self.data = await helper.getImperium(self.name);
	};
}
