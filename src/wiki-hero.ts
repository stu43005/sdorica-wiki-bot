import { RowWrapper } from "./imperium-data.js";
import { characterNameNormalization, localizationString } from "./localization.js";
import { Hero } from "./model/hero.js";
import { numMultiply } from "./utils.js";
import { skillinfoKeywords } from "./wiki-settings.js";
import { wikiNextLine } from "./wiki-utils.js";

export function getHeroJsonData() {
	return Hero.getAll().reduce<Record<string, any>>((p, hero) => {
		const json = hero.toSIJson();
		if (json) {
			p[hero.getSIKey()] = json;
		}
		return p;
	}, {});
}

export const nameRegexp = /^([^·‧・]*)\s?[·‧・]\s?(.*)$/;
export const pointRegexp = /\s?[·‧・]\s?/g;
export const point = "‧";

export function heroName(hero: RowWrapper) {
	const fullname: string = localizationString("HeroInfo")(hero.get("model")) || hero.get("name");
	const nameMatch = fullname.match(nameRegexp);
	let firstname = fullname;
	let lastname = "";
	if (nameMatch) {
		firstname = nameMatch[1];
		lastname = nameMatch[2].replace(pointRegexp, point);
	}
	firstname = characterNameNormalization(
		localizationString("CharacterName")(hero.get("model")) || firstname,
	);
	if (String(hero.get("name")).endsWith("SP") && !String(firstname).endsWith("SP")) {
		firstname = `${firstname}SP`;
	}
	const nameMatch2 = firstname.match(nameRegexp);
	if (nameMatch2) {
		firstname = nameMatch2[1];
		lastname = nameMatch2[2].replace(pointRegexp, point);
	}
	const englishName = localizationString(
		"CharacterName",
		"",
		"Key",
		"English",
	)(hero.get("model"));
	return {
		fullname,
		firstname,
		lastname,
		englishName,
	};
}

export function skillinfo(info: string, skill: string): string {
	if (!info) return "";
	skillinfoKeywords.forEach((keyword) => {
		info = info.replace(new RegExp(keyword, "g"), "{{" + keyword + "}}");
	});
	// 轉
	info = info.replace(/(魂芯)轉(成|為)/g, "$1{{轉}}$2");
	info = info.replace(/轉(((一|二|三|四|五|六|七|八|九|十|\d)+(個|顆)|所有)魂芯)/g, "{{轉}}$1");
	// 移除/消除/獲得
	info = info.replace(
		/(移除|消除|獲得)((其|我方指定角色|指定的|玩家操作區(上|中)的)?((一|二|兩|三|四|五|六|七|八|九|十|\d)+(個|顆)|所有)非?(金|黑|白|同顏色的|本角色的)?(色?魂芯|珠)|其同樣數量與顏色的魂芯)/g,
		"{{$1}}$2",
	);
	info = info.replace(/(將所有(金|黑|白|同顏色的)?(色?魂芯|珠))(移除|消除)/g, "$1{{$2}}");
	// 免疫合傘
	info = info.replace(/\{?\{?免疫\}?\}?合傘/g, "{{免疫合傘}}");

	info = info.replace(/\{\{([^\{\}]*)\{\{([^\{\}]*)\}\}([^\{\}]*)\}\}/g, "{{$1$2$3}}");
	info = info.replace(/\(\$(\w+)\:([\d\.]+)\)/g, (match, p1, p2) => {
		let n = Number(p2);
		switch (p1) {
			case "ARM":
				n = numMultiply(n, 1.2);
				break;
			case "BK":
				n = numMultiply(n, 0.75);
				break;
			case "HEAL":
				n = numMultiply(n, 0.9);
				break;
			default:
				break;
		}
		return `{{atk|${n}}}`;
	});
	// remove buff
	info = info.replace(/(^|\n+)\s*【[^】]*】：.*/g, "");
	info = info.replace(/(。|；)(.)/g, "$1\n$2");
	if (skill == "A1") {
		info = info.replace(/(，|。)\s*冷卻時間為\s*(\d+)\s*。/, "。[CD: $2]");
		info = info.replace(/^([^。，]*)(。|，)\n?/g, "$1$2");
	}
	info = info.replace(/\n+$/g, "");
	info = wikiNextLine(info);
	return info;
}

export function applyAtk(info: string, atk: number): string {
	return info.replace(/\{\{atk\|([\d\.]+)\}\}/g, (match, p1) => {
		const mult = Number(p1);
		return `{{atk|n|${Math.floor(numMultiply(atk, mult))}}}`;
	});
}

export function toLevel(base: number, level: number): number {
	return Math.floor(numMultiply(base, Math.pow(1.06, level - 1)));
}

export function calcStatistics(base: number, level: number, attr: number) {
	return Math.floor(numMultiply(toLevel(base, level), attr));
}
