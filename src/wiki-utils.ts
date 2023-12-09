import { TemplateFormatter } from "./lib/TemplateFormatter.js";
import { objectEach } from "./utils.js";

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
	format: string = TemplateFormatter.FORMAT.INLINE,
) {
	const formatter = new TemplateFormatter();
	formatter.setTemplateName(name);
	formatter.setParameters(params);
	formatter.setFormat(format);
	return formatter.getTemplate();
}
