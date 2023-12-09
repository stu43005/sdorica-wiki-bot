import { h } from "preact";
import { wrapRender } from "./preact-wrapper.js";
import { normalizationHeaderId } from "./wikiheader.js";

export function wikiSectionLink(section: string, text?: string) {
	return `<a href="#${normalizationHeaderId(section)}">${text ?? section}</a>`;
	// return `[${text ?? section}](#${section})`;
}

export const wikiPageLink = wrapRender(wikiPageLinkElement);

export function wikiPageLinkElement(page: string, text?: string, section?: string): h.JSX.Element {
	if (!text) {
		if (section) {
			text = `${page}＃${section}`;
		} else {
			text = page;
		}
	}
	const link = `${page}.html${section ? `#${normalizationHeaderId(section)}` : ""}`;
	return <a href={link}>{text}</a>;
}
