import array_slice from "locutus/php/array/array_slice";
import { TemplateFormatter } from "./lib/TemplateFormatter";
import { objectEach } from "./utils";

const invalidChar = {
	"#": "＃",
	"<": "＜",
	">": "＞",
	"[": "［",
	"]": "］",
	"|": "｜",
	"{": "｛",
	"}": "｝",
	"%": "％",
	"/": "／",
	":": "：",
};

export function wikiTitleEscape(title: string) {
	let newtitle = title;
	objectEach(invalidChar, (from, to) => {
		newtitle = newtitle.replace(new RegExp(`\\${from}`, "g"), to);
	});
	return newtitle;
}

export function wikiNextLine(text: string) {
	return String(text).replace(/\r?\n/g, "<br/>\n");
}

/**
 *
 * @param name
 * @param params (param只要判斷為false就會消失)
 * @param format
 */
export function wikitemplate(
	name: string,
	params: Record<string, any>,
	format: string = TemplateFormatter.FORMAT.INLINE
) {
	const formatter = new TemplateFormatter();
	formatter.setTemplateName(name);
	formatter.setParameters(params);
	formatter.setFormat(format);
	return formatter.getTemplate();
}

export function titleparts(title = "", parts = 0, offset = 0) {
	title = String(title);
	const bits = title.split("/");
	if (bits.length <= 0) {
		return title;
	}
	if (offset > 0) {
		offset--;
	}
	if (parts == 0) {
		return array_slice(bits, offset).join("/");
	}
	return array_slice(bits, offset, parts).join("/");
}
