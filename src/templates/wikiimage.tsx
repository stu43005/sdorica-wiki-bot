import { h } from "preact";
import { getAssetUrl } from "../assetbundle/asset.js";
import { AssetbundleLookupTable } from "../assetbundle/assetbundle-lookup-table.js";
import { LookupTableCategory } from "../model/enums/custom/lookup-table-category.enum.js";
import { wrapRender } from "./preact-wrapper.js";

export function wikiimage_old(
	filename: string,
	{
		width,
		height,
	}: {
		width?: number;
		height?: number;
	} = {},
) {
	return `[[File:${filename}|${width ? `${width}px` : ""}${height ? `x${height}px` : ""}]]`;
}

type WikiImageSource =
	| {
			url: string | undefined;
	  }
	| {
			containerPath: string;
	  }
	| {
			category: LookupTableCategory;
			key: string;
	  };
type ImageElementProps = h.JSX.DetailedHTMLProps<
	h.JSX.HTMLAttributes<HTMLImageElement>,
	HTMLImageElement
>;
export type WikiImageParams = {
	width?: number | string;
	height?: number | string;
	props?: ImageElementProps;
};
export type WikiImageOptions = WikiImageSource & WikiImageParams;

export const wikiimage = wrapRender(wikiimageElement);

export function wikiimageElement(options: WikiImageOptions): h.JSX.Element {
	let src = "";
	if ("url" in options && options.url) {
		src = options.url;
	} else if ("containerPath" in options && options.containerPath) {
		src = getAssetUrl(options.containerPath);
	} else if ("category" in options) {
		const assetUrl = AssetbundleLookupTable.getInstance().getAssetUrl(
			options.category,
			options.key,
		);
		if (!assetUrl) {
			return (
				<>
					[{options.category}::{options.key}]
				</>
			);
		}
		src = assetUrl;
	}
	if (!src) {
		return <>[Unknown image]</>;
	}
	return (
		<img
			loading="lazy"
			src={src}
			width={options.width}
			height={options.height}
			{...options.props}
		/>
	);
}
