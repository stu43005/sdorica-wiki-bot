import { normalizationHeaderId } from "./wikiheader";

export function wikiSectionLink(section: string, text?: string) {
	return `<a href="#${normalizationHeaderId(section)}">${text ?? section}</a>`;
	// return `[${text ?? section}](#${section})`;
}

export function wikiPageLink(page: string, text?: string, section?: string) {
	if (!text) {
		if (section) {
			text = `${page}＃${section}`;
		} else {
			text = page;
		}
	}
	const link = `${page}.html${section ? `#${normalizationHeaderId(section)}` : ""}`;
	return `<a href="${link}">${text}</a>`;
	// return `[${text}](${link})`;
}
