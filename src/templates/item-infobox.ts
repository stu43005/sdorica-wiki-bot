import { TemplateFormatter } from "../lib/TemplateFormatter.js";
import { wikiNextLine, wikitemplate } from "../wiki-utils.js";

export interface ItemInfoboxParams {
	id: string;
	category: string[];
	name: string;
	description: string;
	iconKey: string;

	imagename?: string;
	image?: string;
	sort?: string;

	// 一般道具專用
	currency?: string;
	price?: number;
	rank?: number;
	viewable?: boolean;

	// 探索道具專用
	stack?: number;
	portable?: string;
}

/**
 * 取得`{{item infobox}}`模板
 */
export function itemInfoboxTemplate(params: ItemInfoboxParams) {
	params.description = params.description ? wikiNextLine(params.description) : " ";

	return wikitemplate("item infobox", params, TemplateFormatter.FORMAT.BLOCK);
}
