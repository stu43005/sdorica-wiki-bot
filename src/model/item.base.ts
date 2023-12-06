import render from "preact-render-to-string";
import { AssetbundleLookupTable } from "../assetbundle-lookup-table";
import { RowWrapper } from "../imperium-data";
import { itemDropQuestsTemplate } from "../templates/item-drop-quests";
import { ItemIconParams, itemIconTemplate } from "../templates/item-icon";
import { ItemInfoboxParams, itemInfoboxTemplate } from "../templates/item-infobox";
import { itemCategoryName } from "../wiki-item";
import { wikiTitleEscape } from "../wiki-utils";
import { LookupTableCategory } from "./enums/lookup-table-category.enum";
import { ItemType } from "./enums/item-type.enum";

export abstract class ItemBase {
	abstract itemType: ItemType;
	abstract id: string;
	abstract name: string;
	abstract description: string;
	abstract iconKey: string;
	abstract enable: boolean;

	get isExplore(): boolean {
		return this.itemType === ItemType.ExploreItem;
	}

	constructor(protected row: RowWrapper) {}

	getIconAssetUrl(small = false) {
		if (small && !this.isExplore) {
			return AssetbundleLookupTable.getInstance().getAssetUrl(
				LookupTableCategory.ItemIconSmall,
				this.iconKey
			);
		}
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.ItemIconMid,
			this.iconKey + "_M"
		);
	}

	toWiki(options?: ItemIconParams) {
		return render(itemIconTemplate(this, options));
	}

	getWikiPageName() {
		return wikiTitleEscape(this.name);
	}

	getWikiCategory() {
		return itemCategoryName(this.row, this.name, this.description, this.isExplore);
	}

	getItemInfoboxParams() {
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

	toItemInfobox() {
		return itemInfoboxTemplate(this.getItemInfoboxParams());
	}

	toWikiDropQuests() {
		return itemDropQuestsTemplate(this.getWikiPageName());
	}

	toWikiPage() {
		return this.toItemInfobox();
	}
}
