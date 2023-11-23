import _ from "lodash";
import { ImperiumData, RowWrapper } from "../imperium-data";
import { wikiul } from "../templates/wikilist";
import { ChestCategory } from "./enums/chest-category.enum";
import { DropItemCategory } from "./enums/drop-item-category.enum";
import { DropTimeCategory } from "./enums/drop-time-category.enum";
import { ItemGiveRef } from "./item-give-ref";

const DropItemsTable = ImperiumData.fromGamedata().getTable("DropItems");

const instances: Record<number, DropItemsGroup> = {};

export class DropItemsGroup {
	public static get(groupId: number): DropItemsGroup | undefined {
		if (!instances[groupId]) {
			const rows = DropItemsTable.filter((r) => r.get("groupId") == groupId);
			if (!rows.length) {
				return undefined;
			}
			const subgroups = _.groupBy(rows, (r) => r.get("subgroupId"));
			instances[groupId] = new DropItemsGroup(
				Object.values(subgroups).map(
					(subgroup) => new DropItems(subgroup as [RowWrapper, ...RowWrapper[]])
				)
			);
		}
		return instances[groupId];
	}

	constructor(public subgroups: DropItems[]) {}

	toWiki() {
		return wikiul(this.subgroups.map((items) => items.toWiki()).filter(Boolean));
	}
}

export class DropItems {
	private first: RowWrapper;

	get groupId(): number {
		return +this.first.get("groupId");
	}
	get subgroupId(): number {
		return +this.first.get("subgroupId");
	}
	get category(): DropItemCategory {
		return this.first.get("category");
	}
	get chest(): ChestCategory {
		return this.first.get("chest");
	}
	get dropTime(): DropTimeCategory {
		return this.first.get("dropTime");
	}

	// ?
	get flagOpId(): string {
		return this.first.get("flagOpId");
	}

	items: ItemGiveRef[];

	constructor(private rows: [RowWrapper, ...RowWrapper[]]) {
		this.first = rows[0];

		switch (this.category) {
			case DropItemCategory.Chance:
				this.items = rows.map(
					(r) =>
						new ItemGiveRef(
							r.get("giveType"),
							r.get("giveLinkId"),
							+r.get("giveAmount"),
							+r.get("value")
						)
				);
				break;
			case DropItemCategory.Weight:
				const weightSum = _.sumBy(rows, (r) => +r.get("value"));
				this.items = rows.map(
					(r) =>
						new ItemGiveRef(
							r.get("giveType"),
							r.get("giveLinkId"),
							+r.get("giveAmount"),
							(r.get("value") / weightSum) * 10000
						)
				);
				break;
		}
		this.items = _.sortBy(this.items, (item) => item.chance).reverse();
	}

	toWiki() {
		if (this.items.length < 1) {
			return "";
		}
		if (this.items.length === 1) {
			return this.items[0].toWiki();
		}
		return `隨機獲得以下其一：${wikiul(this.items.map((item) => item.toWiki()))}`;
	}
}
