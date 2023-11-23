import { TemplateFormatter } from "../lib/TemplateFormatter";
import { HeroSlot } from "../model/enums/hero-slot.enum";
import { wikitemplate } from "../wiki-utils";

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
		TemplateFormatter.FORMAT.BLOCK
	);
}
