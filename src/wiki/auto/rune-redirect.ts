import MWBot from "mwbot";
import { Logger } from '../../logger';

const runeNames = [
	"【未知符文】",
	"【專注】",
	"【奇策】",
	"【充能】",
	"【黎明的啟示】",
	"【日落的預言】",
	"【電解】",
	"【預支】",
	"【苦行】",
	"【優雅】",
	"【孤狼】",
	"【生還者】",
	"【麻木】",
	"【封印】",
	"【受虐】",
	"【飢不擇食】",
	"【奉獻】",
	"【反擊的號角】",
	"【突擊令】",
	"【愚蠢的交易】",
	"【如期而至的厄運】",
	"【威壓】",
	"【精準打擊】",
	"【警戒】",
	"【錦上添花】",
	"【結晶】",
	"【偏執狂】",
	"【恐慌】",
	"【傳染】",
	"【憐憫】",
	"【庇護】",
	"【楔】",
	"【破城錘】",
	"【灼熱鮮血】",
	"【固執】",
	"【魯莽】",
	"【風化】",
	"【鏽蝕】",
	"【自私的願望】",
	"【種子】",
	// 符文參謀
	"【落石】",
	"【結算】",
	"【正殛傳導】",
	"【啟發】",
	"【羔羊】",
	"【停滯】",
	"【稻草人】",
	"【寶石】",
];

const logger = new Logger('mwbot');

export async function wikiRuneRedirectBot(bot: MWBot) {
	for (const name of runeNames) {
		const text = await bot.readText(name, false);
		const target = `符文#${name}`;
		let editText = `#重新導向 [[${target}]]`;
		let edit = !text;
		if (text) {
			const m = text.match(/#(REDIRECT|重新導向) \[\[(.*)\]\]/i);
			if (m) {
				const oldTarget = m[1];
				if (oldTarget != target) {
					editText = text.replace(/#(REDIRECT|重新導向) \[\[(.*)\]\]/i, editText);
					edit = true;
				}
			} else {
				editText = `${editText}\n${text}`;
				edit = true;
			}
		}

		if (edit) {
			logger.log(`Redirect: ${name} -> ${target}`);
			// logger.log(`Edit: ${name} : ${editText}`);
			await bot.create(name, editText, "符文重新導向");
		}
	}
}
