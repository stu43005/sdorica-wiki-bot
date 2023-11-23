import { RowWrapper } from "../imperium-data";
import { itemDropQuestsTemplate } from "../templates/item-drop-quests";
import { ItemInfoboxParams, itemInfoboxTemplate } from "../templates/item-infobox";
import { item2wiki, Item2WikiOptions, itemCategoryName } from "../wiki-item";
import { wikiTitleEscape } from "../wiki-utils";

export abstract class ItemBase {
	abstract isExplore: boolean;
	abstract id: string;
	abstract name: string;
	abstract description: string;
	abstract iconKey: string;
	abstract enable: boolean;

	constructor(protected row: RowWrapper) {}

	toWiki(options?: Item2WikiOptions) {
		return item2wiki(this.id, options?.count, this.isExplore, options);
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
