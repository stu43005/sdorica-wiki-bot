import { render } from "preact-render-to-string";
import { AssetbundleLookupTable } from "../assetbundle-lookup-table.js";
import { RowWrapper } from "../imperium-data.js";
import { itemDropQuestsTemplate } from "../templates/item-drop-quests.js";
import { ItemIconParams, itemIconTemplate } from "../templates/item-icon.js";
import { ItemInfoboxParams, itemInfoboxTemplate } from "../templates/item-infobox.js";
import { itemCategoryName } from "../wiki-item.js";
import { wikiTitleEscape } from "../wiki-utils.js";
import { LookupTableCategory } from "./enums/custom/lookup-table-category.enum.js";
import { ItemType } from "./enums/item-type.enum.js";

export abstract class ItemBase {
	abstract itemType: ItemType;
	abstract id: string;
	abstract name: string;
	abstract description: string;
	abstract iconKey: string;
	abstract enable: boolean;

	get isExplore(): boolean {
		return this.itemType === ItemType.ExploreItems;
	}

	constructor(protected row: RowWrapper) {}

	getIconAssetUrl(small = false): string | undefined {
		if (small && !this.isExplore) {
			return AssetbundleLookupTable.getInstance().getAssetUrl(
				LookupTableCategory.ItemIconSmall,
				this.iconKey,
			);
		}
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.ItemIconMid,
			this.iconKey + "_M",
		);
	}

	toWiki(options?: ItemIconParams): string {
		return render(itemIconTemplate(this, options));
	}

	getWikiPageName(): string {
		return wikiTitleEscape(this.name);
	}

	getWikiCategory(): string[] {
		return itemCategoryName(this.row, this.name, this.description, this.isExplore);
	}

	getItemInfoboxParams(): ItemInfoboxParams {
		const category = this.getWikiCategory();

		const params: ItemInfoboxParams = {
			id: this.id,
			category,
			name: this.name,
			description: this.description,
			iconKey: this.iconKey,
		};
		const pageName = this.getWikiPageName();
		if (pageName !== this.name) {
			params.imagename = pageName;
		}
		return params;
	}

	toItemInfobox(): string {
		return itemInfoboxTemplate(this.getItemInfoboxParams());
	}

	toWikiDropQuests(): string {
		return itemDropQuestsTemplate(this.getWikiPageName());
	}

	toWikiPage(): string {
		return this.toItemInfobox();
	}
}
