import { ImperiumData } from "../imperium-data";
import { ViewerJSHelper } from "./viewerjs-helper";

export function registerImperiumDataViewerJS(helper: ViewerJSHelper) {
	ImperiumData.dataLoader = async (self) => {
		self.data = await helper.getImperium(self.name);
	};
}
