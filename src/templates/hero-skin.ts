import { TemplateFormatter } from "../lib/TemplateFormatter.js";
import { HeroSlot } from "../model/enums/custom/hero-slot.enum.js";
import { wikitemplate } from "../wiki-utils.js";

export interface HeroSkinParams {
	角色位置?: HeroSlot;
	角色名稱?: string;
	角色姓氏?: string;
	角色稱號?: string;

	[key: string]: any;
}

/**
 * 取得`{{角色造型書}}`模板
 */
export function heroSkinTemplate(params: HeroSkinParams) {
	params.角色名稱 ||= " ";
	params.角色姓氏 ||= " ";
	params.角色稱號 ||= " ";

	return wikitemplate(
		"角色造型書",
		{
			1: "{{{1|}}}",
			...params,
		},
		TemplateFormatter.FORMAT.BLOCK,
	);
}
