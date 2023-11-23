import { wikitemplate } from "../wiki-utils";
import { HeroSlot } from "../model/enums/hero-slot.enum";

export interface HeroSlotIconParams {
	/**
	 * 圖示大小
	 *
	 * 預設: "x16px"
	 */
	size?: string;
	/**
	 * 圖示連結
	 */
	link?: string;
}

/**
 * 取得`{{站位圖標}}`模板
 */
export function heroSlotIconTemplate(name: HeroSlot, params: HeroSlotIconParams = {}) {
	return wikitemplate("站位圖標", {
		1: name,
		...params,
	});
}
