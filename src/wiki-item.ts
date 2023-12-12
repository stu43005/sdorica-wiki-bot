import { RowWrapper } from "./imperium-data.js";
import { localizationItemName, localizationString } from "./localization.js";
import { ExploreItem } from "./model/explore-item.js";
import { Item } from "./model/item.js";
import { arrayUnique } from "./utils.js";

export function getItemJsonData() {
	const out: Record<string, Record<string, string>> = {
		item: Item.getAll()
			.filter((item) => item.enable)
			.map<[string, string]>((item) => [
				`${item.id}-${item.getWikiPageName()}`,
				item.toWikiPage(),
			])
			.reduce<Record<string, string>>((p, c) => {
				p[c[0]] = c[1];
				return p;
			}, {}),
		ExploreItems: ExploreItem.getAll()
			.filter((item) => item.enable)
			.map<[string, string]>((item) => [
				`${item.id}-${item.getWikiPageName()}`,
				item.toWikiPage(),
			])
			.reduce<Record<string, string>>((p, c) => {
				p[c[0]] = c[1];
				return p;
			}, {}),
	};
	return out;
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
	"23": ["探索道具"], // 其他
};

function exploreCategoryName(label: string) {
	const labels = label.split(";");
	const cats = labels.reduce<string[]>((priv, str) => {
		return priv.concat(exploreLabelName[str]);
	}, []);
	return arrayUnique(cats);
}

export function itemCategoryName(
	row: RowWrapper,
	itemName: string,
	itemDescription: string,
	isExplore = false,
) {
	const id = row.get("id");
	const iconKey = row.get("iconKey");
	const category = row.get("category");
	if (!itemName) {
		itemName = localizationItemName(isExplore)(id);
	}
	if (!itemDescription) {
		itemDescription =
			localizationString(isExplore ? "ExpItem" : "Item")(
				row.get("localizationKeyDescription"),
			) || "";
	}

	let cats: string[] = [];
	if (isExplore) {
		cats = cats.concat(exploreCategoryName(row.get("label")));
		if (
			itemDescription.indexOf("捕捉野獸道具") != -1 ||
			itemDescription.indexOf("捕捉岡布奧道具") != -1
		) {
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
		case "Mineral":
			return ["魂能結晶"];
		case "WildcardMineral":
			return ["魂能結晶"];
		case "WildcardOwnedAll":
			return ["魂能結晶"];
		case "WildcardOwnedGold":
			return ["魂能結晶"];
		case "WildcardOwnedBlack":
			return ["魂能結晶"];
		case "WildcardOwnedWhite":
			return ["魂能結晶"];
		case "Soul":
			return ["貨幣"];
		case "Coin":
			return ["貨幣"];
		case "PlayerExp":
			return ["貨幣"];
		case "GashaponTicket":
			return ["書籤"];
		case "HeroSkill":
			if (itemName.indexOf("造型書") !== -1) {
				return ["造型書"];
			}
			return ["技能書"];
		case "Avatar":
			return ["頭像"];
		case "Treasure":
			return ["寶箱"];
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
			if (
				iconKey.startsWith("soul") ||
				iconKey.startsWith("coin") ||
				iconKey.startsWith("ring") ||
				iconKey.startsWith("gem") ||
				iconKey.startsWith("medals") ||
				iconKey.startsWith("GuildCoin") ||
				iconKey.startsWith("GuildRing") ||
				itemName == "殘光粉末" ||
				itemName == "起源魂石" ||
				itemName == "魂光粉塵"
			) {
				return ["貨幣"];
			}
			if (Number(id) > 20000 && Number(id) < 30000) {
				return ["探索道具"];
			}
			break;
	}
	return ["其他"];
}
