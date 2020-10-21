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

			const heroExists = await bot.exists(hero.name);
			if (!heroExists) {
				await bot.create(hero.name, hero.hero);
				logger.log(`Create: ${hero.name}`);

				if (hero.name != hero.scName) {
					try {
						await bot.create(hero.scName, `#重新導向 [[${hero.name}]]`, "簡中導向");
						logger.log(`Redirect: ${hero.scName} -> ${hero.name}`);
					} catch (error) {
					}
				}

				if (hero.cv) {
					const cvCat = `分類:聲優為 ${hero.cv} 的角色`;
					try {
						await bot.create(cvCat, `{{角色聲優分類}}`);
						logger.log(`Create: ${cvCat}`);
					} catch (error) {
					}
				}
			}

			for (const rankName in hero.ranks) {
				if (hero.ranks.hasOwnProperty(rankName)) {
					const rankExists = await bot.exists(rankName);
					if (!rankExists) {
						try {
							const rank = hero.ranks[rankName];
							await bot.create(`模板:${rankName}`, rank);
							logger.log(`Create: 模板:${rankName}`);
						} catch (error) {
						}
					}
				}
			}

			await bot.editOnDifference(`模板:角色數值/${hero.name}`, hero.base);
		}
	}
}
