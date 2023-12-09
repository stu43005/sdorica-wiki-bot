import { wikitemplate } from "../wiki-utils.js";
import { HeroSlot } from "../model/enums/custom/hero-slot.enum.js";

// TODO:
const asset = {
	[HeroSlot.WHITE]:
		"assets/game/ui/common/commonui/texture/heroes_frame_position_white_withicon.png",
	[HeroSlot.GOLD]:
		"assets/game/ui/common/commonui/texture/heroes_frame_position_gold_withicon.png",
	[HeroSlot.BLACK]:
		"assets/game/ui/common/commonui/texture/heroes_frame_position_black_withicon.png",
};

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
