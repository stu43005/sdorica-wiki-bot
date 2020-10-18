import { localizationString } from "../localization";

export default function wikiTips() {
	const IntroTip = localizationString("IntroTip");
	const Tip_num = Number(IntroTip("Tip_num"));
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
