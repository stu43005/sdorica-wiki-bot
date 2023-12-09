import { localizationString } from "../localization.js";

export class HeroInfo {
	info1 = "";
	age = "";
	height = "";
	cv = "";

	constructor(public key: string) {
		this.info1 = localizationString("HeroInfo")(key + "_info1");
		const info2 = localizationString("HeroInfo")(key + "_info2");
		if (info2) {
			const info2match = info2.match(/^◆\s?([^◆\n]*)\n?◆\s?([^◆\n]*)(\n?◆\s?CV：([^◆\n]*))?/);
			if (info2match) {
				this.age =
					info2match[1]
						?.trim()
						.replace(/[（﹝]/g, " (")
						.replace(/[）﹞]/g, ")") ?? "";
				this.height = info2match[2]?.trim() ?? "";
				this.cv = info2match[4]?.trim() ?? "";
			}
		}
	}
}
