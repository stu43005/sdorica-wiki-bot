import numeral from "numeral";
import { h } from "preact";
import { ExploreItem } from "../model/explore-item.js";
import { Item } from "../model/item.js";
import { ItemBase } from "../model/item.base.js";
import { wikiimageElement } from "./wikiimage.js";
import { wikiPageLinkElement } from "./wikilink.js";

export interface ItemIconParams {
	/**
	 * 道具數量
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
	 * `text=true` 時將會輸出道具名稱並包含連結，或是給予自訂文字。
	 * @default true
	 */
	text?: string | true;
	/**
	 * `direction=vertical`時將會以垂直方式顯示道具名稱及數量。
	 * @default "horizontal"
	 */
	direction?: "vertical" | "horizontal";
	smallIcon?: boolean;
	iconUrl?: string;
}

export function itemIconTemplate(item: ItemBase, options: ItemIconParams = {}): h.JSX.Element {
	if (!options.height) {
		options.width ??= 25;
	}
	options.text ??= true;
	options.direction ??= "horizontal";

	const url = options.iconUrl || item.getIconAssetUrl(options.smallIcon);
	const img = url ? (
		wikiimageElement({
			url: url,
			width: options.width,
			height: options.height,
			props: {
				alt: !options.text ? item.name : "",
				title: item.name,
			},
		})
	) : (
		<>[{item.iconKey}]</>
	);
	const text = options.text === true ? item.name : options.text;
	const count =
		typeof options.count === "number" ? `x${numeral(options.count).format("0,0")}` : "";
	let suffix = <></>;
	const avatar = (
		item instanceof ExploreItem ? item.transformTo : item instanceof Item ? item : null
	)?.avatar;
	if (text && avatar) {
		suffix = <>({wikiPageLinkElement("Avatars", "頭像")})</>;
	}

	if (options.direction === "horizontal") {
		return (
			<span style="display: inline-table; text-align: left;">
				{img}
				{text ? ` ${text}` : ""}
				{count ? ` ${count}` : ""}
				{suffix}
			</span>
		);
	} else {
		return (
			<span style="display: inline-table; text-align: center;">
				{img}
				{text ? (
					<>
						<br />
						{text}
						{suffix}
					</>
				) : (
					""
				)}
				{count ? (
					<>
						<br />
						{count}
					</>
				) : (
					""
				)}
			</span>
		);
	}
}
