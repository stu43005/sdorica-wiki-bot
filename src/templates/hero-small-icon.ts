import { wikitemplate } from "../wiki-utils";

export interface HeroSmallIconParams {
	/**
	 * 圖示大小
	 *
	 * 預設: "25px"
	 */
	size?: string;
	/**
	 * 圖示連結
	 */
	link?: string;
	/**
	 * 無圖示連結
	 *
	 * 賦予任意值即可
	 */
	nolink?: boolean;
	/**
	 * 顯示文字
	 *
	 * `true`則顯示該角色名稱
	 */
	text?: string;
}

/**
 * 取得`{{角色小圖示}}`模板
 */
export function heroSmallIconTemplate(name: string, params: HeroSmallIconParams = {}) {
	return wikitemplate('角色小圖示', {
		1: name,
		...params,
	});
}
