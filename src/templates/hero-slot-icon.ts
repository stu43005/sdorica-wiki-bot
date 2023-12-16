import { HeroSlot } from "../model/enums/custom/hero-slot.enum.js";
import { WikiImageParams, wikiimageElement } from "./wikiimage.js";

const asset = {
	[HeroSlot.WHITE]:
		"assets/game/ui/common/commonui/texture/heroes_frame_position_white_withicon.png",
	[HeroSlot.GOLD]:
		"assets/game/ui/common/commonui/texture/heroes_frame_position_gold_withicon.png",
	[HeroSlot.BLACK]:
		"assets/game/ui/common/commonui/texture/heroes_frame_position_black_withicon.png",
};

/**
 * 取得`{{站位圖標}}`模板
 */
export function heroSlotIconTemplate(name: HeroSlot, params: WikiImageParams = {}) {
	return wikiimageElement({
		width: 25,
		...params,
		containerPath: asset[name],
	});
}
