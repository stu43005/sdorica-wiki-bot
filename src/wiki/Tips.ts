import { localizationString } from "../localization";
import { wikiH1 } from "../templates/wikiheader";
import { wikitable, WikiTableStruct } from "../templates/wikitable";

const IntroTip = localizationString("IntroTip");

export default function wikiTipsTemplate() {
	const Tip_num = +IntroTip("Tip_num");
	const out: string[] = [];
	out.push(`{{#switch:{{#expr:({{#time:y}} * {{#time:n}} * {{#time:j}} + {{{offset|0}}}) mod ${Tip_num - 1}}}`);
	for (let i = 1; i < Tip_num; i++) {
		const key = `Tip_${i}`;
		const tip = IntroTip(key).replace(/\n/g, "");
		out.push(`|${i - 1} = ${tip}`);
	}
	out.push(`}}<noinclude>{{Documentation}}</noinclude>`);
	return out.join("\n");
}

export function wikiTips() {
	let out = wikiH1(`小提示`);

	const table: WikiTableStruct = [
		[
			`! #`,
			`! 小提示`,
		],
	];

	const Tip_num = +IntroTip("Tip_num");
	for (let i = 1; i < Tip_num; i++) {
		const key = `Tip_${i}`;
		const tip = IntroTip(key).replace(/\n/g, "");
		table.push([
			i - 1,
			tip,
		]);
	}

	out += `\n${wikitable(table)}`;
	return out;
}
