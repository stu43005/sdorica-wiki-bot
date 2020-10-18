import MWBot from "mwbot";
import { Logger } from '../../logger';
import { getHeroJsonData } from "../../wiki-hero";

const logger = new Logger('mwbot');

export async function wikiHeroBot(bot: MWBot) {
	const json = getHeroJsonData();

	for (const name in json) {
		if (json.hasOwnProperty(name)) {
			const hero = json[name];
			if (!hero.enable) continue;

			const originalText = await bot.readText(hero.name, true);
			if (!originalText) {
				// not exist
				await bot.create(hero.name, hero.hero);
				logger.log(`Create: ${hero.name}`);

				if (hero.name != hero.scName) {
					await bot.create(hero.scName, `#重新導向 [[${hero.name}]]`, "簡中導向");
					logger.log(`Redirect: ${hero.scName} -> ${hero.name}`);
				}

				for (const rankName in hero.ranks) {
					if (hero.ranks.hasOwnProperty(rankName)) {
						const rank = hero.ranks[rankName];
						await bot.create(`模板:${rankName}`, rank);
						logger.log(`Create: 模板:${rankName}`);
					}
				}

				if (hero.cv) {
					const cvCat = `分類:聲優為 ${hero.cv} 的角色`;
					const cvCatText = await bot.readText(cvCat, true);
					if (!cvCatText) {
						await bot.create(cvCat, `{{角色聲優分類}}`);
					}
				}
			}

			for (const rankName in hero.ranks) {
				if (hero.ranks.hasOwnProperty(rankName) && rankName.includes('三階+')) {
					try {
						const rank = hero.ranks[rankName];
						await bot.create(`模板:${rankName}`, rank);
						logger.log(`Create: 模板:${rankName}`);
					} catch (error) {
					}
				}
			}

			await bot.editOnDifference(`模板:角色數值/${hero.name}`, hero.base);
		}
	}
}
