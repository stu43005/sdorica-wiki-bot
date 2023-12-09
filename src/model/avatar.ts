import { AssetbundleLookupTable } from "../assetbundle-lookup-table.js";
import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { localizationString } from "../localization.js";
import { AvatarInfoboxParams, avatarInfoboxTemplate } from "../templates/avatar-infobox.js";
import { AvatarType } from "./enums/avatar-type.enum.js";
import { ItemCategory } from "./enums/item-category.enum.js";
import { LookupTableCategory } from "./enums/custom/lookup-table-category.enum.js";
import { Hero } from "./hero.js";
import { Item } from "./item.js";

const AvatarsTable = ImperiumData.fromGamedata().getTable("Avatars");

const instances: Record<string, Avatar> = {};
let allInstances: Avatar[] | null = null;

export class Avatar {
	public static get(id: string): Avatar | undefined;
	public static get(row: RowWrapper): Avatar;
	public static get(rowOrId: RowWrapper | string): Avatar {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string" ? AvatarsTable.find((r) => r.get("id") == id) : rowOrId;
			if (row) {
				instances[id] = new Avatar(row);
			}
		}
		return instances[id];
	}

	public static getAll() {
		return (allInstances ??= Array.from(this));
	}

	public static *[Symbol.iterator]() {
		for (let i = 0; i < AvatarsTable.length; i++) {
			const row = AvatarsTable.get(i);
			yield Avatar.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get asset(): string {
		return this.row.get("asset");
	}
	get category(): AvatarType {
		return this.row.get("category");
	}
	get enable(): boolean {
		return !!this.row.get("enable");
	}
	get order(): number {
		return +this.row.get("order");
	}

	description: string;

	#item: Item | undefined | null = null;
	get item(): Item | undefined {
		if (this.#item === null) {
			this.#item = Item.find(
				(item) =>
					item.category == ItemCategory.Avatar && item.effectValue.toString() == this.id,
			);
		}
		return this.#item;
	}
	#hero: Hero | undefined | null = null;
	get hero(): Hero | undefined {
		if (this.#hero === null) {
			this.#hero = Hero.find((hero) => hero.avatarId == this.id);
		}
		return this.#hero;
	}

	constructor(private row: RowWrapper) {
		this.description = localizationString("Avatars")(this.id);
	}

	getAvatarInfobox() {
		const params: AvatarInfoboxParams = {
			name: this.item?.name,
			description: this.description,
			iconKey: this.asset,
		};
		const pageName = this.item?.getWikiPageName();
		if (pageName !== this.item?.name) {
			params.imagename = pageName;
		}
		return avatarInfoboxTemplate(params);
	}

	getIconAssetUrl(small = true) {
		if (small) {
			return AssetbundleLookupTable.getInstance().getAssetUrl(
				LookupTableCategory.CharacterPortrait,
				this.asset + "_icon",
			);
		}
		return AssetbundleLookupTable.getInstance().getAssetUrl(
			LookupTableCategory.CharacterPortrait_LARGE,
			this.asset + "_iconL",
		);
	}
}
