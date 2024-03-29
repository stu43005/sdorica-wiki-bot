import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { itemNameNormalization, localizationString } from "../localization.js";
import { wikiH2 } from "../templates/wikiheader.js";
import { Avatar } from "./avatar.js";
import { DropItemsGroup } from "./drop-items.js";
import { ExploreItemsCategory } from "./enums/explore-items-category.enum.js";
import { ItemCategory } from "./enums/item-category.enum.js";
import { Stackable } from "./enums/stackable.enum.js";
import { ExploreItem } from "./explore-item.js";
import { ItemBase } from "./item.base.js";
import { ItemGiveList } from "./item-give-list.js";
import { ItemGiveRef } from "./item-give-ref.js";
import { itemRename } from "./config/item.js";
import { HeroSkillSet } from "./hero-skillset.js";
import { ItemPayRef } from "./item-pay-ref.js";
import { ItemIconParams } from "../templates/item-icon.js";
import { ItemType } from "./enums/item-type.enum.js";
import { ItemInfoboxParams } from "../templates/item-infobox.js";

const ExtraProductsTable = ImperiumData.fromGamedata().getTable("ExtraProducts");
const ItemsTable = ImperiumData.fromGamedata().getTable("Items");
const VoucherGiftsTable = ImperiumData.fromGamedata().getTable("VoucherGifts");

const instances: Record<string, Item> = {};
let allInstances: Item[] | null = null;

export class Item extends ItemBase {
	public static get(id: string): Item | undefined;
	public static get(row: RowWrapper): Item;
	public static get(rowOrId: RowWrapper | string): Item {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string" ? ItemsTable.find((r) => r.get("id") == id) : rowOrId;
			if (row) {
				instances[id] = new Item(row);
			}
		}
		return instances[id];
	}

	public static find(predicate: (value: Item) => boolean): Item | undefined {
		for (const item of this) {
			if (predicate(item)) {
				return item;
			}
		}
		return;
	}

	public static getAll() {
		return (allInstances ??= Array.from(this));
	}

	public static *[Symbol.iterator]() {
		for (let i = 0; i < ItemsTable.length; i++) {
			const row = ItemsTable.get(i);
			yield Item.get(row);
		}
	}

	readonly itemType = ItemType.Items;

	get id(): string {
		return this.row.get("id");
	}
	get category(): ItemCategory {
		return this.row.get("category");
	}
	get effectValue(): number {
		return +this.row.get("effectValue");
	}
	get iconKey(): string {
		return `${this.row.get("iconKey")}`.replace(/Avatar_Explore\//gi, "Avatar_");
	}
	get rank(): number {
		return +this.row.get("rank");
	}

	name: string;
	description: string;
	get internalName(): string {
		return this.row.get("name");
	}

	#enable: boolean | null = null;
	get enable() {
		return (this.#enable ??= this.getEnable());
	}

	#sellItem: ItemGiveRef | null = null;
	get sellItem(): ItemGiveRef {
		return (this.#sellItem ??= new ItemGiveRef(
			this.row.get("sellType"),
			this.row.get("sellLinkId"),
			this.row.get("sellAmount"),
		));
	}

	#buyItem: ItemPayRef | undefined | null = null;
	get buyItem(): ItemPayRef | undefined {
		if (this.#buyItem === null) {
			const row = ExtraProductsTable.find(
				(r) =>
					["heroSkill", "Space"].includes(r.get("category")) &&
					r.get("param1") === this.id,
			);
			if (row) {
				this.#buyItem = new ItemPayRef(
					row.get("payType"),
					row.get("linkId"),
					row.get("amount"),
				);
			} else {
				this.#buyItem = undefined;
			}
		}
		return this.#buyItem;
	}

	get stackable(): Stackable {
		return this.row.get("stackable");
	}
	get viewable(): boolean {
		return !!this.row.get("viewable");
	}
	get stackingNum(): number {
		return +this.row.get("stackingNum");
	}

	#avatar: Avatar | undefined | null = null;
	get avatar(): Avatar | undefined {
		if (this.category !== ItemCategory.Avatar) {
			return undefined;
		}
		if (this.#avatar === null) {
			this.#avatar = Avatar.get(this.effectValue.toString());
		}
		return this.#avatar;
	}

	#treasureItems: DropItemsGroup | undefined | null = null;
	get treasureItems(): DropItemsGroup | undefined {
		if (this.category !== ItemCategory.Treasure) {
			return undefined;
		}
		if (this.#treasureItems === null) {
			this.#treasureItems = DropItemsGroup.get(this.effectValue);
		}
		return this.#treasureItems;
	}

	#voucherGifts: ItemGiveList | undefined | null = null;
	get voucherGifts(): ItemGiveList | undefined {
		if (this.category !== ItemCategory.Voucher) {
			return undefined;
		}
		if (this.#voucherGifts === null) {
			const items = VoucherGiftsTable.filter((r) => r.get("groupId") == this.effectValue);
			if (items.length) {
				this.#voucherGifts = new ItemGiveList(
					items.map(
						(item) =>
							new ItemGiveRef(
								item.get("giveType"),
								item.get("giveLinkId"),
								item.get("giveAmount"),
							),
					),
				);
			} else {
				this.#voucherGifts = undefined;
			}
		}
		return this.#voucherGifts;
	}

	#transformExploreItems: ExploreItem[] | null = null;
	get transformExploreItems(): ExploreItem[] {
		if (this.#transformExploreItems === null) {
			this.#transformExploreItems = ExploreItem.getAll().filter(
				(item) => item.transformTo == this,
			);
		}
		return this.#transformExploreItems;
	}

	constructor(row: RowWrapper) {
		super(row);
		this.name = itemNameNormalization(
			localizationString("Item")(row.get("localizationKeyName")) ||
				this.internalName ||
				this.iconKey,
		);
		this.description = localizationString("Item")(row.get("localizationKeyDescription"));
	}

	private getEnable() {
		if (+this.id > 20000 && +this.id < 30000) {
			// 由ExploreItem轉移過來的道具
			if (
				ExploreItem.find(
					(item) =>
						item.category == ExploreItemsCategory.Transform &&
						item.effectValue == this.id,
				)
			) {
				return true;
			}
			// 同樣道具同時存在在ExploreItem (用作關卡獎勵圖示)，無用
			if (ExploreItem.find((item) => item.name == this.name)) {
				return false;
			}
		}
		return true;
	}

	override toWiki(options?: ItemIconParams): string {
		if (
			this.stackable == Stackable.Sell &&
			this.sellItem?.item &&
			this.sellItem?.item !== this
		) {
			return this.sellItem.toWiki({
				iconUrl: this.getIconAssetUrl(options?.smallIcon),
				...options,
			});
		}
		return super.toWiki(options);
	}

	override getWikiPageName(): string {
		if (itemRename[this.id]) {
			return itemRename[this.id];
		}
		if (this.category == ItemCategory.Avatar) {
			const sk = HeroSkillSet.getAll().find(
				(skillset) => skillset.isBook && skillset.name == this.name,
			);
			if (sk) {
				return super.getWikiPageName() + " (頭像)";
			}
		}
		if (
			this.stackable == Stackable.Sell &&
			this.sellItem?.item &&
			this.sellItem?.item !== this
		) {
			return this.sellItem.item.getWikiPageName();
		}
		return super.getWikiPageName();
	}

	override getItemInfoboxParams(): ItemInfoboxParams {
		const params = super.getItemInfoboxParams();
		const category = params.category;

		if (
			category.includes("技能書") ||
			category.includes("造型書") ||
			category.includes("頭像")
		) {
			params.image = " ";
		}
		if (category.includes("造型書")) {
			params.sort = "👕";
		}
		if (this.sellItem.amount && !category.includes("蒐集")) {
			params.currency = this.sellItem.item?.name;
			params.price = this.sellItem.amount;
		}

		params.rank = this.rank;
		params.viewable = this.viewable;
		return params;
	}

	toWikiTreasureList(): string {
		if (this.category == ItemCategory.Treasure) {
			return `${wikiH2("開啟寶箱獲得道具")}\n${this.treasureItems?.toWiki()}`;
		} else if (this.category == ItemCategory.Voucher) {
			return `${wikiH2("自選項目")}\n${this.voucherGifts?.toWiki()}`;
		}
		return "";
	}

	toWikiCompositeList(): string {
		return this.transformExploreItems.map((item) => item.toWikiCompositeList()).join("");
	}

	override toWikiPage(): string {
		return [
			this.toItemInfobox(),
			this.avatar?.getAvatarInfobox() ?? "",
			this.toWikiDropQuests(),
			this.toWikiTreasureList(),
			this.toWikiCompositeList(),
		]
			.filter(Boolean)
			.join("\n");
	}
}
