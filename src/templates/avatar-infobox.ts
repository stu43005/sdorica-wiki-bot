import { TemplateFormatter } from "../lib/TemplateFormatter.js";
import { wikiNextLine, wikitemplate } from "../wiki-utils.js";

export interface AvatarInfoboxParams {
	name?: string;
	description?: string;
	iconKey?: string;
	imagename?: string;
}

/**
 * 取得`{{avatar infobox}}`模板
 */
export function avatarInfoboxTemplate(params: AvatarInfoboxParams) {
	params.description = params.description ? wikiNextLine(params.description) : " ";

	return wikitemplate("avatar infobox", params, TemplateFormatter.FORMAT.BLOCK);
}
