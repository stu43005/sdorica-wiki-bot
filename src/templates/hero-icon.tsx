import numeral from "numeral";
import { h } from "preact";
import { IHeroSkillSet } from "../model/hero-skillset.interface.js";
import { wikiimageElement } from "./wikiimage.js";

export interface HeroIconParams {
	/**
	 * 數量
	 */
	count?: number;
	/**
	 * 圖示寬度
	 * @default 25px
	 */
	width?: string | number;
	/**
	 * 圖示高度
	 */
	height?: string | number;
	/**
	 * `text=true` 時將會輸出名稱並包含連結，或是給予自訂文字。
	 * @default true
	 */
	text?: string | true;
	/**
	 * 是否顯示角色階級
	 * @default true
	 */
	showRank?: boolean;
	/**
	 * `direction=vertical`時將會以垂直方式顯示名稱及數量。
	 * @default "horizontal"
	 */
	direction?: "vertical" | "horizontal";
}

export function heroIconTemplate(
	skillset: IHeroSkillSet,
	options: HeroIconParams = {},
): h.JSX.Element {
	if (!options.height) {
		options.width ??= 25;
	}
	options.text ??= true;
	options.showRank ??= true;
	options.direction ??= "horizontal";

	const url = skillset.getSdAssetUrl();
	const img = url ? (
		wikiimageElement({
			url: url,
			width: options.width,
			height: options.height,
			props: {
				alt: !options.text ? skillset.hero?.firstname : "",
				title: skillset.hero?.firstname,
			},
		})
	) : (
		<>[{skillset.heroSd}]</>
	);
	const text = options.text === true ? skillset.hero?.firstname : options.text;
	const suffix = options.showRank
		? `(${skillset.isBook ? skillset.name : skillset.rankPlus})`
		: "";
	const count =
		typeof options.count === "number" ? `x${numeral(options.count).format("0,0")}` : "";

	if (options.direction === "horizontal") {
		return (
			<span style="display: inline-table; text-align: left;">
				{img}
				{text ? ` ${text}${suffix}` : ""}
				{count ? ` ${count}` : ""}
			</span>
		);
	} else {
		return (
			<div style="position:relative;width:70px;display:inline-block;margin:3px;height:88px;text-align: center;">
				{img}
				{text ? (
					<span style="position: absolute;left:0px;right:0px;margin:auto;bottom:0px;font-size:12px; background:rgba(0,0,0,0.6); padding:0px 2px;line-height:14px;text-align:center;border-radius: 4px;color:white;">
						{text}
						{suffix}
					</span>
				) : (
					""
				)}
			</div>
		);
	}
}
