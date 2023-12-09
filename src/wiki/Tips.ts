import { getConstants, localizationString } from "../localization.js";
import { wikiH1 } from "../templates/wikiheader.js";
import { wikitable, WikiTableStruct } from "../templates/wikitable.js";

const IntroTip = localizationString("IntroTip");

function getAllTips() {
	const indexStart = +getConstants()("loadingSceneTipIndexStart");
	const indexEnd = +getConstants()("loadingSceneTipIndexEnd");
	// const Tip_num = +IntroTip("Tip_num");
	const out: string[] = [];
	for (let i = indexStart; i < indexEnd + 1; i++) {
		const key = `Tip_${i}`;
		const tip = IntroTip(key).replace(/\n/g, "");
		out.push(tip);
	}
	return out;
}

export default function wikiTipsTemplate() {
	const Tip_num = +IntroTip("Tip_num");
	const out: string[] = [];
	out.push(
		`{{#switch:{{#expr:({{#time:y}} * {{#time:n}} * {{#time:j}} + {{{offset|0}}}) mod ${
			Tip_num - 1
		}}}`,
	);
	out.push(...getAllTips().map((tip, index) => `|${index} = ${tip}`));
	out.push(`}}<noinclude>{{Documentation}}</noinclude>`);
	return out.join("\n");
}

export function wikiTips() {
	let out = wikiH1(`小提示`);

	const table: WikiTableStruct = [
		[`! #`, `! 小提示`],
		...getAllTips().map((tip, index) => [index, tip]),
	];

	out += `\n${wikitable(table)}`;
	return out;
}
