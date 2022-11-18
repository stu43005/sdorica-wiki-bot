import numeral from "numeral";
import { ImperiumData, RowWrapper } from "./imperium-data";
import { currency2Id, gamedataString, localizationCharacterNameByHeroId, localizationExploreBuildingName, localizationItemName, localizationMonsterNameById, localizationString, rank } from "./localization";
import { Chapter } from "./model/chapter";
import { ItemStackable } from "./model/enums/item-stackable.enum";
import { ExploreItem } from './model/explore-item';
import { Hero } from "./model/hero";
import { Item } from './model/item';
import { arrayUnique } from "./utils";
import { wikitemplate } from "./wiki-utils";

const ExploreItemsTable = ImperiumData.fromGamedata().getTable("ExploreItems");
const ExploreBuildingTable = ImperiumData.fromGamedata().getTable("ExploreBuilding");
const ExploreCompositeTable = ImperiumData.fromGamedata().getTable("ExploreComposite");

export function getItemJsonData() {
	const out: Record<string, Record<string, string>> = {
		"item": Item.getAll()
			.filter(item => item.enable)
			.map<[string, string]>(item => [`${item.id}-${item.getWikiPageName()}`, item.toWikiPage()])
			.reduce<Record<string, string>>((p, c) => {
				p[c[0]] = c[1];
				return p;
			}, {}),
		"ExploreItems": ExploreItem.getAll()
			.filter(item => item.enable)
			.map<[string, string]>(item => [`${item.id}-${item.getWikiPageName()}`, item.toWikiPage()])
			.reduce<Record<string, string>>((p, c) => {
				p[c[0]] = c[1];
				return p;
			}, {}),
	};
	return out;
}

export function exploreCompositeList(id: string) {
	let str = "";
	const composites = ExploreCompositeTable.filter(c => c.get("itemId") == id && c.get("enable"));
	if (composites.length) {
		const requireFlags = composites.reduce((pre, cur) => pre || !!cur.get("requireFlagId"), false);
		str += `\n== 合成方式 ==
{| class="wikitable"
! 合成素材 !! 需求`;
		if (requireFlags) {
			str += ` !! 合成配方取得方式`;
		}
		composites.forEach(composite => {
			const building = ExploreBuildingTable.find(b => b.get("id") == composite.get("requireBuildingId"));
			if (building) {
				const compositeItems = itemList(composite);
				str += `\n|-\n| ${compositeItems.join(" ")} || [[${localizationExploreBuildingName()(building.get("type"))}]] Lv ${building.get("level")}`;
				if (requireFlags) {
					str += `\n| ${composite.get("requireFlagId") ? `{{?}}<!--取得方式-->` : `style="text-align: center" | -`}`;
				}
			}
		});
		str += `\n|}`;
	}
	return str;
}

export function exploreUsingList(id: string) {
	let str = "";
	const useComposites = ExploreCompositeTable.filter(c => [c.get("item1Id"), c.get("item2Id"), c.get("item3Id"), c.get("item4Id")].indexOf(id) != -1 && c.get("enable"));
	const useBuilding = ExploreBuildingTable.filter(c => [c.get("item1Id"), c.get("item2Id"), c.get("item3Id"), c.get("item4Id")].indexOf(id) != -1);
	if (useComposites.length || useBuilding.length) {
		const CATEGORY_LEVEL_UP = "升級";
		const compositeGroup = useComposites.reduce((group, composite) => {
			const building = ExploreBuildingTable.find(b => b.get("id") == composite.get("requireBuildingId"));
			const compItem = ExploreItemsTable.find(i => i.get("id") == composite.get("itemId"));
			if (building && compItem) {
				const buildingName = localizationExploreBuildingName()(building.get("type"));
				group[buildingName] = group[buildingName] || {};
				const category = itemCategoryName(compItem, "", "", true)[0] || "探索道具";
				group[buildingName][category] = group[buildingName][category] || [];
				if (!group[buildingName][category].find(i => i.get("id") == compItem.get("id"))) {
					group[buildingName][category].push(compItem);
				}
			}
			return group;
		}, useBuilding.reduce((group, building) => {
			const buildingName = localizationExploreBuildingName()(building.get("type"));
			group[buildingName] = group[buildingName] || {};
			const category = CATEGORY_LEVEL_UP;
			group[buildingName][category] = group[buildingName][category] || [];
			group[buildingName][category].push(building);
			return group;
		}, {} as Record<string, Record<string, RowWrapper[]>>));

		str += `\n== 道具用途 ==`;
		for (const buildingName in compositeGroup) {
			if (compositeGroup.hasOwnProperty(buildingName)) {
				const catGroup = compositeGroup[buildingName];
				str += `\n;探索設施[[${buildingName}]]`;
				for (const cat in catGroup) {
					if (catGroup.hasOwnProperty(cat)) {
						if (cat == CATEGORY_LEVEL_UP) {
							const buildings = catGroup[cat];
							buildings.forEach(building => {
								str += `\n:*升級至 [[${buildingName}]] Lv ${Number(building.get("level")) + 1}。`;
							});
						}
						else {
							const compItems = catGroup[cat];
							str += `\n:*合成{{系統圖標|${cat}|25px}}${cat}：`;
							str += compItems.map(compItem => item2wiki(compItem.get("id"), undefined, true)).join("、");
							str += `。`;
						}
					}
				}
			}
		}
	}
	return str;
}

export const exploreLabelName: Record<string, string[]> = {
	"1": ["探索素材"], // 素材
	"2": ["共通裝備", "探索裝備"], // 戰鬥：共通裝備
	"3": ["憑證"], // 戰鬥：憑證
	"4": ["探索消耗物"], // 戰鬥：消耗物
	"5": ["探索裝備【金位一階】", "探索裝備"], // 角色：金位一階
	"6": ["探索裝備【金位二階】", "探索裝備"], // 角色：金位二階
	"7": ["探索裝備【金位三階】", "探索裝備"], // 角色：金位三階
	"8": ["探索裝備【黑位一階】", "探索裝備"], // 角色：黑位一階
	"9": ["探索裝備【黑位二階】", "探索裝備"], // 角色：黑位二階
	"10": ["探索裝備【黑位三階】", "探索裝備"], // 角色：黑位三階
	"11": ["探索裝備【白位一階】", "探索裝備"], // 角色：白位一階
	"12": ["探索裝備【白位二階】", "探索裝備"], // 角色：白位二階
	"13": ["探索裝備【白位三階】", "探索裝備"], // 角色：白位三階
	"14": ["探索工具"], // 探索
	"15": ["頭像"], // 轉化：頭像
	"16": ["共鳴素材"], // 轉化：共鳴素材
	"17": ["探索貨幣"], // 轉化：貨幣
	"18": ["探索食物【精神值】", "探索食物"], // 食物：精神值
	"19": ["探索食物【飽食度】", "探索食物"], // 食物：飽食度
	"20": ["探索食物【增益效果】", "探索食物"], // 食物：增益效果
	"21": ["野獸道具"], // 其他：野獸
	"22": ["探索劇情文本道具"], // 其他：劇情文本
	"23": ["探索道具"],
};

function exploreCategoryName(label: string) {
	const labels = label.split(";");
	const cats = labels.reduce<string[]>((priv, str) => {
		return priv.concat(exploreLabelName[str]);
	}, []);
	return arrayUnique(cats);
}

export function itemCategoryName(row: RowWrapper, itemName: string, itemDescription: string, isExplore = false) {
	const id = row.get("id");
	const iconKey = row.get("iconKey");
	const category = row.get("category");
	if (!itemName) {
		itemName = localizationItemName(isExplore)(id);
	}
	if (!itemDescription) {
		itemDescription = localizationString(isExplore ? "ExpItem": "Item")(row.get("localizationKeyDescription")) || "";
	}

	let cats: string[] = [];
	if (isExplore) {
		cats = cats.concat(exploreCategoryName(row.get("label")));
		if (itemDescription.indexOf("捕捉野獸道具") != -1 || itemDescription.indexOf("捕捉岡布奧道具") != -1) {
			cats.unshift("捕捉野獸道具");
		}
		if (itemDescription.indexOf("體力回復道具") != -1) {
			cats.unshift("體力回復道具");
		}
		if (itemName.indexOf("契約：") == 0) {
			cats.unshift("契約");
		}
		if (itemName.endsWith("卷軸")) {
			cats.unshift("卷軸");
		}
		if (itemName.startsWith("符文字元：")) {
			cats.unshift("符文字元");
		}
		if (itemName.startsWith("符文書：")) {
			cats.unshift("符文書");
		}
		if (!cats.length) {
			cats.push("探索道具");
		}
		return cats;
	}
	switch (category) {
		case "Mineral": return ["魂能結晶"];
		case "WildcardMineral": return ["魂能結晶"];
		case "WildcardOwnedAll": return ["魂能結晶"];
		case "WildcardOwnedGold": return ["魂能結晶"];
		case "WildcardOwnedBlack": return ["魂能結晶"];
		case "WildcardOwnedWhite": return ["魂能結晶"];
		case "Soul": return ["貨幣"];
		case "Coin": return ["貨幣"];
		case "PlayerExp": return ["貨幣"];
		case "GashaponTicket": return ["書籤"];
		case "HeroSkill":
			if (itemName.indexOf("造型書") !== -1) {
				return ["造型書"];
			}
			return ["技能書"];
		case "Avatar": return ["頭像"];
		case "Treasure": return ["寶箱"];
		case "Space":
			if (itemName == "獸廄擴充證") {
				return ["野獸道具", "探索貨幣"];
			}
			break;
		case "None":
			if (itemDescription.indexOf("素材") != -1) {
				return ["共鳴素材"];
			}
			if (iconKey.endsWith("_collection")) {
				return ["蒐集"];
			}
			if (iconKey.startsWith("soul") || iconKey.startsWith("coin") || iconKey.startsWith("ring") || iconKey.startsWith("gem") ||
				iconKey.startsWith("medals") || iconKey.startsWith("GuildCoin") || iconKey.startsWith("GuildRing") ||
				itemName == "殘光粉末" ||
				itemName == "起源魂石" ||
				itemName == "魂光粉塵") {
				return ["貨幣"];
			}
			if (Number(id) > 20000 && Number(id) < 30000) {
				return ["探索道具"];
			}
			break;
	}
	return ["其他"];
}

export interface Item2WikiOptions {
	/**
	 * 道具數量
	 *
	 * ※ 此選項會複寫參數值的count。
	 */
	count?: number;
	/**
	 * 圖示大小
	 * @default "25px"
	 */
	size?: string;
	/**
	 * `text=true` 時將會輸出道具名稱並包含連結，或是給予自訂文字。
	 * @default "true"
	 */
	text?: string;
	/**
	 * `direction=vertical`時將會以垂直方式顯示道具名稱及數量。
	 * @default "horizontal"
	 */
	direction?: string;
	M?: string;
}

export function item2wiki(id: string, count?: number, isExplore = false, options: Item2WikiOptions = {}) {
	let item: ExploreItem | Item | undefined;
	if (isExplore) {
		item = ExploreItem.get(id);
	} else {
		item = Item.get(id);
	}
	if (!item) return "";

	options.text ??= 'true';

	const avatar = (item.isExplore ? item.transformTo : item)?.avatar;
	let suffix = avatar ? "([[頭像]])" : "";
	const args: Record<string, string | number | undefined> = {
		1: item.getWikiPageName(),
		text: options.text,
		size: options.size,
		count: count,
	};
	Object.assign(args, options);
	if (options.text !== "true") {
		args.text = options.text;
	} else if (args[1] !== item.name) {
		args.text = item.name;
	}
	if (!item.isExplore && item.stackable == ItemStackable.Sell) {
		const price = item.sellItem.amount;
		const count = args.count ? +args.count : 1;
		if (price > 1) {
			suffix += `<sub>(${numeral(price * count).format("0,0")})</sub>`;
		}
	}
	if (args.count) {
		args.count = numeral(Number(args.count)).format("0,0");
	}
	return wikitemplate("道具圖示", args) + suffix;
}

export function monster2wiki(id: string, count?: number, options?: Item2WikiOptions) {
	options = options || {};
	options.text = typeof options.text === 'undefined' ? 'true' : options.text;
	if (!id || id == "-1") return "";

	const monsterName = localizationMonsterNameById()(id);
	const rank = gamedataString("HomelandMonster", "id", "rank")(id);
	const suffix = `(${rank}階)` + (count ? ` x${count}` : "");
	const args: Record<string, string | number | undefined> = {
		1: monsterName,
		text: options.text,
		size: options.size,
	};
	Object.assign(args, options);
	return wikitemplate("野獸小圖示", args) + suffix;
}

export function item2wikiWithType(type: string, id: string, count?: number, options?: Item2WikiOptions) {
	switch (type) {
		case "coin": // old type
		case "gem": // old type
		case "ring": // old type
		case "soul": // old type
			id = currency2Id()(type);
		case "Item":
		case "item": // old type
		default:
			if (!id) {
				id = currency2Id()(type);
			}
			return item2wiki(id, count, false, options);

		case "ExploreItem":
			return item2wiki(id, count, true, options);

		case "Monster":
			return monster2wiki(id, count, options);

		case "Hero": {
			const [heroId, rankId] = id.split("_");
			const hero = Hero.get(heroId)?.toWiki() ?? localizationCharacterNameByHeroId()(heroId);
			return `${hero} (${rank()(rankId)})` + (count ? ` x${count}` : "");
		}

		case "Diligent": {
			const chapter = Chapter.get(id);
			const diligentId = "1011";
			return `章節${chapter ? `[[${chapter.getWikiTitle()}]]` : id}${item2wiki(diligentId, count, false, options)}`;
		}
	}
}

export function itemList(row: RowWrapper, count = 4, isExplore = true, size = "20px") {
	const items: string[] = [];
	for (let k = 1; k <= count; k++) {
		const wiki = item2wiki(row.get(`item${k}Id`), row.get(`item${k}Count`), isExplore, { size });
		if (wiki) items.push(wiki);
	}
	return items;
}
