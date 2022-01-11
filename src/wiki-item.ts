import numeral from "numeral";
import { ImperiumData, RowWrapper } from "./imperium-data";
import { currency2Id, Func1, gamedataString, localizationCharacterNameByHeroId, localizationExploreBuildingName, localizationItemName, localizationMonsterNameById, localizationString, rank } from "./localization";
import { ExploreItem } from './model/explore-item';
import { Hero } from "./model/hero";
import { Item } from './model/item';
import { arrayUnique } from "./utils";
import { wikitemplate, wikiTitleEscape } from "./wiki-utils";

const ItemsTable = ImperiumData.fromGamedata().getTable("Items");
const DropItemsTable = ImperiumData.fromGamedata().getTable("DropItems");
const ExploreItemsTable = ImperiumData.fromGamedata().getTable("ExploreItems");
const ExploreBuildingTable = ImperiumData.fromGamedata().getTable("ExploreBuilding");
const ExploreCompositeTable = ImperiumData.fromGamedata().getTable("ExploreComposite");
const HeroSkillsTable = ImperiumData.fromGamedata().getTable("HeroSkills");
const VoucherGiftsTable = ImperiumData.fromGamedata().getTable("VoucherGifts");

export function getItemJsonData() {
	const out: Record<string, Record<string, string>> = {
		"item": Item.getAll()
			.filter(item => item.enable)
			.map<[string, string]>(item => [`${item.id}-${item.getWikiPageName()}`, item.getWikiPage()])
			.reduce<Record<string, string>>((p, c) => {
				p[c[0]] = c[1];
				return p;
			}, {}),
		"ExploreItems": ExploreItem.getAll()
			.filter(item => item.enable)
			.map<[string, string]>(item => [`${item.id}-${item.getWikiPageName()}`, item.getWikiPage()])
			.reduce<Record<string, string>>((p, c) => {
				p[c[0]] = c[1];
				return p;
			}, {}),
	};
	return out;
}

export function treasureList(groupId: number, lineStart = '') {
	const dropitems = DropItemsTable.filter(di => di.get("groupId") == groupId);
	// groupId,subgroupId,category,chest,dropTime,itemId,itemCount,value,id
	const dropgroup: RowWrapper[][] = [];
	dropitems.forEach(di => {
		const subgroupId = parseInt(di.get("subgroupId"));
		dropgroup[subgroupId] = dropgroup[subgroupId] || [];
		dropgroup[subgroupId].push(di);
	});
	let str = "";
	for (const subgroupId in dropgroup) {
		const subgroup = dropgroup[subgroupId];
		if (subgroup.length == 1) {
			str += `\n${lineStart}* ${dropItemListEntry(subgroup[0], subgroup[0].get("value"))}`;
		}
		else if (subgroup.length > 1) {
			str += `\n${lineStart}* 隨機獲得以下${subgroup[0].get("giveType") == "Monster" ? "野獸" : "物品"}其一：`;
			let weightCount = 0;
			if (subgroup[0].get("category") == "Weight") {
				subgroup.forEach(di => {
					weightCount += Number(di.get("value"));
				});
			}
			subgroup.sort((a, b) => Number(b.get("value")) - Number(a.get("value"))).forEach(di => {
				str += `\n${lineStart}** ${dropItemListEntry(di, weightCount)}`;
			});
		}
	}
	return str;
}

function dropItemListEntry(item: RowWrapper, weightCount = 0) {
	let str = item2wikiWithType(item.get("giveType"), item.get("giveLinkId"), item.get("giveAmount"));
	if (item.get("category") == "Chance" && item.get("value") != 10000) {
		str += `：${item.get("value") / 100}%`;
	}
	else if (item.get("category") == "Weight" && weightCount && item.get("value") != weightCount) {
		str += `：${Math.floor(item.get("value") / weightCount * 10000) / 100}%`;
	}
	return str;
}

export function voucherList(groupId: number) {
	const items = VoucherGiftsTable.filter(r => r.get('groupId') == groupId);
	let str = "";
	for (const item of items) {
		str += `\n* ${item2wikiWithType(item.get("giveType"), item.get("giveLinkId"), item.get("giveAmount"))}`;
	}
	return str;
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

const ItemNameMap: Record<string, string> = {
	334: "凝粹魂能",
	3030: "哥哥 (頭像)",
	3031: "傭兵 (頭像)",
	3032: "村長 (頭像)",
	3033: "營站指揮官 (頭像)",
	3034: "男學院生 (頭像)",
	3036: "盈月天狐 (頭像)",
	3055: "噩夢表演家 (頭像)",
	3083: "聖夜贈禮大師 (頭像)",
	3091: "城市女王 (頭像)",
	3093: "「種下種子」",
	3094: "「保留種子」",
	3096: "古銅色的誘惑 (頭像)",
	3097: "搖滾巨星 (頭像)",
	3098: "貪心偶像 (頭像)",
	3099: "沙塵指揮者 (頭像)",
	3100: "熱情海浪 (頭像)",
	3101: "流光之舞 (頭像)",
	3102: "魘巫女 (頭像)",
	3103: "猛夏豪傑 (頭像)",
	3109: "亂櫻之刀 (頭像)",
	3110: "善意心魔",
	3111: "惡意心魔",
	4001: "傑克的餅乾", /* 傑克的餅乾X100 */
	7028: "神秘寶箱 (連續登入)",
	7097: "怦然心動禮盒 (2020)",
	7100: "神秘寶箱 (Sdorica二週年)",
	7103: "燦爛夏夜 (2020)",
	7111: "神秘寶箱 (2020 萬聖節)",
};

const ExpItemName: Record<string, string> = {
	1004: "庫倫 (探索)",
	1033: "魔物警報 (探索道具)",
	"forest_9": "錫箔彩蛋 (探索)",
};

export function getWikiItemRename(id: string, isExplore = false) {
	if (!isExplore && id in ItemNameMap) {
		return ItemNameMap[id];
	}
	else if (!isExplore && isAvatar(id, isExplore)) {
		const itemName = localizationItemName(isExplore)(id);
		const sk = HeroSkillsTable.find(skill => skill.get("rank") > 5 && localizationString("HeroSkills", "skill_set_")(skill.get("id")) == itemName);
		if (sk) {
			return `${itemName} (頭像)`;
		}
	}
	else if (isExplore && id in ExpItemName) {
		return ExpItemName[id];
	}
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

export function item2wiki(id: string, count?: number, isExplore = false, options?: Item2WikiOptions) {
	options = options || {};
	options.text = typeof options.text === 'undefined' ? 'true' : options.text;
	if (!id || id == "-1") return "";

	let itemName = localizationItemName(isExplore)(id);
	if (!itemName) {
		itemName = id;
	}
	let suffix = isAvatar(id, isExplore) ? "([[頭像]])" : "";
	const args: Record<string, string | number | undefined> = {
		1: itemName,
		text: options.text,
		size: options.size,
		count: count,
	};
	Object.assign(args, options);
	const packitem = itemName.match(/^(\d+)\顆([^\(\)]+)$/);
	const packitem2 = itemName.match(/^([^\(\)]+)\(.*\)$/);
	const escapedName = wikiTitleEscape(itemName);
	if (escapedName !== itemName) {
		args[1] = escapedName;
		args.text = itemName;
	}
	const rename = getWikiItemRename(id, isExplore);
	if (rename) {
		args[1] = rename;
		args.text = itemName;
	}
	else if (packitem) {
		args[1] = wikiTitleEscape(packitem[2]);
		if (args[1] !== packitem[2]) {
			args.text = packitem[2];
		}
		args.count = Number(packitem[1]);
	}
	else if (packitem2) {
		args[1] = wikiTitleEscape(packitem2[1]);
		args.text = itemName;
	}
	if (!isExplore && gamedataString("Items", "id", "stackable")(id) == "Sell") {
		const item = ItemsTable.find(r => r.get("id") == id);
		if (item) {
			const price = Number(item.get("sellAmount"));
			const count = Number(args.count);
			if (price > 1) {
				suffix += `<sub>(${numeral(price * count).format("0,0")})</sub>`;
			}
		}
	}
	if (options.text != "true") {
		args.text = options.text;
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
			const hero = Hero.get(heroId)?.toWikiSmallIcon() ?? localizationCharacterNameByHeroId()(heroId);
			return `${hero} (${rank()(rankId)})` + (count ? ` x${count}` : "");
		}
	}
}

export function itemlist2wiki(list: string, isExplore = false, options?: Item2WikiOptions, separator = "<br/>") {
	return String(list)
		.split(";")
		.filter(s => s != "")
		.map(item => item.split(":"))
		.map(item => item2wiki(item[0], item.length > 1 ? Number(item[1]) : undefined, isExplore, options))
		.join(separator);
}

export function itemList(row: RowWrapper, count = 4, isExplore = true, size = "20px") {
	const items: string[] = [];
	for (let k = 1; k <= count; k++) {
		const wiki = item2wiki(row.get(`item${k}Id`), row.get(`item${k}Count`), isExplore, { size });
		if (wiki) items.push(wiki);
	}
	return items;
}

export function itemListWithType(row: RowWrapper, count: number, typeKey: Func1, itemKey: Func1, countKey: Func1, size = "20px") {
	const items: string[] = [];
	for (let i = 1; i <= count; i++) {
		const wiki = item2wikiWithType(row.get(typeKey(i.toString())), row.get(itemKey(i.toString())), row.get(countKey(i.toString())), { size });
		if (wiki) items.push(wiki);
	}
	return items;
}

function isAvatar(id: string, isExplore = false): boolean {
	if (isExplore) {
		if (gamedataString("ExploreItems", "id", "category")(id) == "Transform") {
			const toItemId = gamedataString("ExploreItems", "id", "effectValue")(id);
			return isAvatar(toItemId);
		}
		return false;
	}
	return gamedataString("Items", "id", "category")(id) == "Avatar";
}
