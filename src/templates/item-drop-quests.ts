import { wikitemplate } from "../wiki-utils";

/**
 * 取得`{{掉落關卡}}`模板
 */
export function itemDropQuestsTemplate(name: string) {
	return wikitemplate("掉落關卡", {
		name,
	});
}
