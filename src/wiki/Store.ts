import { ImperiumData } from "../imperium-data";
import { localizationString } from "../localization";
import { arrayGroupBy, objectMap } from "../utils";
import { item2wikiWithType } from "../wiki-item";

const StoreConfigsTable = ImperiumData.fromGamedata().getTable("StoreConfigs");
const StoreItemGroupsTable = ImperiumData.fromGamedata().getTable("StoreItemGroups");

export default function wikiStore() {
	const storeGroup = objectMap(arrayGroupBy(StoreConfigsTable.filter(r => r.get("enable")).map(row => ({
		condition: String(row.get("condition")),
		param1: String(row.get("param1")),
		param2: String(row.get("param2")),
		param3: String(row.get("param3")),
		itemGroup: String(row.get("itemGroup")),
		store: String(row.get("store")),
		slot: Number(row.get("slot")),
		order: Number(row.get("order")),
	})), r => r.store), (key, value) => arrayGroupBy(value, r => r.slot, true));

	const out: string[] = [];
	for (const store in storeGroup) {
		if (storeGroup.hasOwnProperty(store)) {
			const name = localizationString("Metagame")(`store_eventStore_${store}`);
			let str = `== ${store}${name ? ` ${name}` : ""} ==`;
			const sortedGroup = storeGroup[store].sort((a, b) => a[0].order - b[0].order);
			for (let slot = 0; slot < sortedGroup.length; slot++) {
				if (!sortedGroup[slot]) continue;
				str += `
=== 第 ${slot + 1} 格 ===`;
				const indent = sortedGroup[slot].length > 1 ? "**" : "*";
				for (let i = 0; i < sortedGroup[slot].length; i++) {
					const config = sortedGroup[slot][i];
					if (indent == "**") {
						str += `
* ${config.condition}: ${config.param1} ~ ${config.param2}`;
					}

					const itemGroup = StoreItemGroupsTable.filter(g => g.get("group") == config.itemGroup && g.get("enable"));
					let weightCount = 0;
					itemGroup.forEach(ig => {
						weightCount += Number(ig.get("weight"));
					});
					for (let j = 0; j < itemGroup.length; j++) {
						const item = itemGroup[j];
						str += `\n${indent} ${item2wikiWithType(item.get("giveType"), item.get("giveLinkId"), item.get("itemCount"))}：${item2wikiWithType(item.get("payType"), item.get("linkId"), item.get("amount"))}`;
						if (itemGroup.length > 1) {
							str += ` (${Math.floor(Number(item.get("weight")) / weightCount * 10000) / 100}%)`;
						}
					}
				}
			}
			out.push(str);
		}
	}

	return out.join("\n\n");
}
