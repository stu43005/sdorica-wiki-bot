import { TemplateFormatter } from "../lib/TemplateFormatter.js";
import { HeroRank } from "../model/enums/custom/hero-rank.enum.js";
import { HeroSlot } from "../model/enums/custom/hero-slot.enum.js";
import { wikiNextLine, wikitemplate } from "../wiki-utils.js";

export interface HeroRankParams {
	角色位置?: HeroSlot;
	角色名稱?: string;
	角色姓氏?: string;
	角色稱號?: string;
	共鳴階級?: HeroRank;
	技能強化?: number;
	復活?: number;

	共鳴材料?: string;
	介紹?: string;
	年齡?: string;
	身高?: string;
	聲優?: string;

	[key: string]: any;
}

/**
 * 取得`{{角色/階級}}`模板
 */
export function heroRankTemplate(params: HeroRankParams) {
	params.角色名稱 ||= " ";
	params.角色姓氏 ||= " ";
	params.角色稱號 ||= " ";
	params.介紹 = params.介紹 ? wikiNextLine(params.介紹) : " ";
	params.年齡 = params.年齡 ? params.年齡.replace(/(.月)/g, "[[$1]]") : "{{?}}";
	params.身高 ||= "{{?}}";
	params.聲優 ||= "無";

	return wikitemplate(
		"角色/階級",
		{
			1: "{{{1|}}}",
			...params,
		},
		TemplateFormatter.FORMAT.BLOCK,
	);
}
