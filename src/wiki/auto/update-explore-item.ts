import MWBot from "mwbot";
import { Logger } from "../../logger";
import { ExploreItem } from "../../model/explore-item";

const logger = new Logger("mwbot");

export async function wikiUpdateExploreItemBot(bot: MWBot) {
	for (const item of ExploreItem.getAll().filter((i) => i.enable)) {
		const pageName = item.getWikiPageName();

		let text: string;
		const originalText = (text = await bot.readText(pageName, false));
		const summary: string[] = [];

		// category
		let match = text.match(/\|\s*category\s*=\s*(.*)\n/);
		if (match) {
			const category = item.getWikiCategory().join(",");
			if (match[1] != category) {
				text = text.replace(/(\|\s*category\s*=\s*)(.*)/, `$1${category}`);
				logger.log(`${pageName}：category ${match[1]} -> ${category}`);
				summary.push("category");
			}
		}

		// stack
		match = text.match(/\|\s*stack\s*=\s*(.*)\n/);
		if (match) {
			if (Number(match[1]) != item.stackingNum) {
				text = text.replace(/(\|\s*stack\s*=\s*)(.*)/, `$1${item.stackingNum}`);
				logger.log(`${pageName}：stack ${match[1]} -> ${item.stackingNum}`);
				summary.push("stack");
			}
		}

		if (originalText != text) {
			await bot.editOnDifference(pageName, text, `Update ${summary.join(", ")} (by MWBot)`);
		}
	}
}
