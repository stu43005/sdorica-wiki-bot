import { TemplateFormatter } from "../lib/TemplateFormatter.js";
import { wikitemplate } from "../wiki-utils.js";

/**
 * 取得`{{角色數值}}`模板
 */
export function heroBaseTemplate(atk: number, hp: number) {
	return wikitemplate(
		"角色數值",
		{
			1: "{{{1|}}}",
			攻擊: atk,
			體力: hp,
		},
		TemplateFormatter.FORMAT.BLOCK,
	);
}
