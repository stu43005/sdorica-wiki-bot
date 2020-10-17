import { TemplateFormatter } from "../lib/TemplateFormatter";
import { wikitemplate } from "../wiki-utils";

export interface HeroPageParams {
	角色名稱: string;
	英文名稱?: string;
	日文名稱?: string;
	韓文名稱?: string;

	角色故事?: string;

	零階?: string;
	一階?: string;
	二階?: string;
	三階?: string;
	Alt?: string;
	Skin?: string[];
	冬青少女?: boolean;

	三階技能強化次數?: number;

	其他資訊?: string;
}

/**
 * 取得`{{角色<noinclude>頁面</noinclude>}}`模板
 */
export function heroPageTemplate(params: HeroPageParams) {
	params.英文名稱 ||= ' ';
	params.日文名稱 ||= ' ';
	params.韓文名稱 ||= ' ';
	params.角色故事 ||= ' ';

	return wikitemplate('角色<noinclude>頁面</noinclude>', {
		1: "{{{1|}}}",
		2: "{{{2|}}}",
		...params,
		Skin: params.Skin?.join(','),
	}, TemplateFormatter.FORMAT.BLOCK);
}
