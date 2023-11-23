import numeral from "numeral";
import { currency2Id } from "../localization";
import { HeroSmallIconParams } from "../templates/hero-small-icon";
import { Item2WikiOptions, item2wikiWithType } from "../wiki-item";
import { Chapter } from "./chapter";
import { ItemGiveType } from "./enums/item-give-type.enum";
import { ExploreItem } from "./explore-item";
import { Hero } from "./hero";
import { HeroSkillSet } from "./hero-skillset";
import { Item } from "./item";
import { ItemBase } from "./item.base";

export class ItemGiveRef {
	item?: ItemBase;
	heroSkillSet?: HeroSkillSet;
	diligentChapter?: Chapter;

	public static createItem(id: string, amount = 0) {
		return new ItemGiveRef(ItemGiveType.Item, id, amount);
	}

	public static parseItem(str: string, separator = ":") {
		const [id, amount] = str.split(separator);
		return new ItemGiveRef(ItemGiveType.Item, id, +amount || 0);
	}

	constructor(
		public type: ItemGiveType,
		public id: string,
		public amount: number = 0,
		public chance: number = 10000
	) {
		switch (this.type) {
			case ItemGiveType.ExploreItem:
				this.item = ExploreItem.get(this.id);
				break;
			case ItemGiveType.Item:
			default:
				if (this.type !== ItemGiveType.Item) {
					const currencyId = currency2Id()(this.type);
					if (!currencyId) {
						break;
					}
					this.id = currencyId;
				}
				this.item = Item.get(this.id);
				break;
			case ItemGiveType.Monster:
				// TODO: support Monster GiveType
				break;
			case ItemGiveType.Hero: {
				const [heroId, rankId] = this.id.split("_");
				this.heroSkillSet = Hero.get(heroId)?.getSkillSet(+rankId);
				break;
			}
			case ItemGiveType.Diligent:
				this.diligentChapter = Chapter.get(this.id);
				break;
		}
	}

	compare(another: ItemGiveRef) {
		if (this === another) return true;
		return (
			this.type === another.type &&
			this.id === another.id &&
			this.amount === another.amount &&
			this.chance === another.chance
		);
	}

	getChanceString() {
		return numeral(this.chance / 10000).format("0.[00]%");
	}

	private _toWiki(options?: Item2WikiOptions & HeroSmallIconParams) {
		if (this.item) {
			return this.item.toWiki({
				...options,
				count: this.amount,
			});
		}
		if (this.heroSkillSet) {
			return this.heroSkillSet.toWiki(options) + (this.amount ? ` x${this.amount}` : "");
		}
		if (this.diligentChapter) {
			return `${this.diligentChapter.getWikiTitle()}${this.diligentChapter.diligentItem?.toWiki(
				{
					...options,
					count: this.amount,
				}
			)}`;
		}
		return item2wikiWithType(this.type, this.id, this.amount, options);
	}

	toWiki(options?: Item2WikiOptions & HeroSmallIconParams) {
		return this._toWiki(options) + (this.chance === 10000 ? "" : `：${this.getChanceString()}`);
	}
}
