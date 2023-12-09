import numeral from "numeral";
import { currency2Id } from "../localization.js";
import { HeroIconParams } from "../templates/hero-icon.js";
import { ItemIconParams } from "../templates/item-icon.js";
import { MonsterIconParams } from "../templates/monster-icon.js";
import { Chapter } from "./chapter.js";
import { GiveType } from "./enums/give-type.enum.js";
import { ExploreItem } from "./explore-item.js";
import { HeroSkillSet } from "./hero-skillset.js";
import { Hero } from "./hero.js";
import { ItemBase } from "./item.base.js";
import { Item } from "./item.js";
import { Monster } from "./monster.js";

type ToWikiParam = ItemIconParams & HeroIconParams & MonsterIconParams;

export class ItemGiveRef {
	item?: ItemBase;
	monster?: Monster;
	heroSkillSet?: HeroSkillSet;
	diligentChapter?: Chapter;

	public static createItem(id: string, amount = 0): ItemGiveRef {
		return new ItemGiveRef(GiveType.Item, id, amount);
	}

	public static parseItem(str: string, separator = ":"): ItemGiveRef {
		const [id, amount] = str.split(separator);
		return new ItemGiveRef(GiveType.Item, id, +amount || 0);
	}

	constructor(
		public type: GiveType,
		public id: string,
		public amount: number = 0,
		public chance: number = 10000,
	) {
		switch (this.type) {
			case GiveType.ExploreItem:
				this.item = ExploreItem.get(this.id);
				break;
			case GiveType.Item:
			default:
				if (this.type !== GiveType.Item) {
					const currencyId = currency2Id()(this.type);
					if (!currencyId) {
						break;
					}
					this.id = currencyId;
				}
				this.item = Item.get(this.id);
				break;
			case GiveType.Monster:
				this.monster = Monster.get(this.id);
				break;
			case GiveType.Hero: {
				const [heroId, rankId] = this.id.split("_");
				this.heroSkillSet = Hero.get(heroId)?.getSkillSet(+rankId);
				break;
			}
			case GiveType.Diligent:
				this.diligentChapter = Chapter.get(this.id);
				break;
		}
	}

	compare(another: ItemGiveRef | ItemBase | Monster | HeroSkillSet | Hero | Chapter): boolean {
		if (this === another) return true;
		if (another instanceof ItemBase) {
			return this.item?.compare(another) ?? false;
		}
		if (another instanceof Monster) {
			return this.monster?.compare(another) ?? false;
		}
		if (another instanceof HeroSkillSet) {
			return this.heroSkillSet?.compare(another) ?? false;
		}
		if (another instanceof Hero) {
			return this.heroSkillSet?.compareHero(another) ?? false;
		}
		if (another instanceof Chapter) {
			return this.diligentChapter?.compare(another) ?? false;
		}
		return (
			this.type === another.type &&
			this.id === another.id &&
			this.amount === another.amount &&
			this.chance === another.chance
		);
	}

	getChanceString(): string {
		return numeral(this.chance / 10000).format("0.[00]%");
	}

	private _toWiki(input?: ToWikiParam) {
		let count = typeof input?.count === "number" ? input.count : 1;
		count *= this.amount;
		const options: ToWikiParam = {
			...input,
			count: count,
		};
		if (this.item) {
			return this.item.toWiki(options);
		}
		if (this.monster) {
			return this.monster.toWiki(options);
		}
		if (this.heroSkillSet) {
			return this.heroSkillSet.toWiki(options) + (count > 1 ? ` x${count}` : "");
		}
		if (this.diligentChapter) {
			return `${this.diligentChapter.getWikiTitle()}${this.diligentChapter.diligentItem?.toWiki(
				options,
			)}`;
		}
		return "";
	}

	toWiki(options?: ToWikiParam): string {
		return (
			this._toWiki(options) +
			(this.chance === 10000 || this.chance < 0 ? "" : `：${this.getChanceString()}`)
		);
	}
}
