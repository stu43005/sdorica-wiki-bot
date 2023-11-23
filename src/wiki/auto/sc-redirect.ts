import MWBot from "mwbot";
import { ImperiumData } from "../../imperium-data";
import { setDefaultLanguage } from "../../localization";
import { Logger } from "../../logger";
import { ExploreItem } from "../../model/explore-item";
import { Hero } from "../../model/hero";
import { questMetadata } from "../../wiki-quest";

const enable = {
	hero: false,
	exploreItem: false,
	chapter: true,
};

const ChaptersTable = ImperiumData.fromGamedata().getTable("Chapters");
const QuestsTable = ImperiumData.fromGamedata().getTable("Quests");

const logger = new Logger("mwbot");

export async function wikiScRedirectBot(bot: MWBot) {
	if (enable.hero) {
		for (const hero of Hero.getAll().filter((h) => h.enable)) {
			const tcName = hero.firstname;
			const scName = hero.scName;

			if (tcName == scName) {
				continue;
			}

			const scExists = await bot.exists(scName);
			if (!scExists) {
				const tcExists = await bot.exists(tcName);
				if (tcExists) {
					logger.log(`Redirect: ${scName} -> ${tcName}`);
					try {
						await bot.create(scName, `#重新導向 [[${tcName}]]`, "簡中導向");
					} catch (error) {
						logger.error(error);
					}
				}
			}
		}
	}

	if (enable.exploreItem) {
		for (const item of ExploreItem.getAll().filter((i) => i.enable)) {
			const tcName = item.name;
			const scName = item.scName;

			if (tcName == scName) {
				continue;
			}

			const scExists = await bot.exists(scName);
			if (!scExists) {
				const tcExists = await bot.exists(tcName);
				if (tcExists) {
					logger.log(`Redirect: ${scName} -> ${tcName}`);
					try {
						await bot.create(scName, `#重新導向 [[${tcName}]]`, "簡中導向");
					} catch (error) {
						logger.error(error);
					}
				}
			}
		}
	}

	if (enable.chapter) {
		for (let i = 0; i < ChaptersTable.length; i++) {
			const row = ChaptersTable.get(i);
			const chID = row.get("id");
			if (!row.get("enable")) continue;

			if (row.get("category") == "Challenge") {
				const quests = QuestsTable.filter(
					(q) => q.get("chapter") == chID && q.get("enable")
				);
				for (let j = 0; j < quests.length; j++) {
					const quest = quests[j];
					const { prefix, ch, ch2, wikilink: tcWikilink } = questMetadata(quest, row);
					setDefaultLanguage("ChineseSimplified");
					const { wikilink: scWikilink } = questMetadata(quest, row);
					setDefaultLanguage("Chinese");
					const questNumber = `${prefix}${ch}${ch2 ? "-" + ch2 : ""}`;

					if (tcWikilink != scWikilink) {
						const scExists = await bot.exists(scWikilink);
						if (!scExists) {
							const tcExists = await bot.exists(tcWikilink);
							if (tcExists) {
								logger.log(`Redirect: ${scWikilink} -> ${tcWikilink}`);
								try {
									await bot.create(
										scWikilink,
										`#重新導向 [[${tcWikilink}]]`,
										"簡中導向"
									);
								} catch (error) {
									logger.error(error);
								}
							}
						}
					}

					const numberExists = await bot.exists(questNumber);
					if (!numberExists) {
						const tcExists = await bot.exists(tcWikilink);
						if (tcExists) {
							logger.log(`Redirect: ${questNumber} -> ${tcWikilink}`);
							try {
								await bot.create(
									questNumber,
									`#重新導向 [[${tcWikilink}]]`,
									"關卡編號導向"
								);
							} catch (error) {
								logger.error(error);
							}
						}
					}
				}
			}
		}
	}
}
