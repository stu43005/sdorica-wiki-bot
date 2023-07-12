import { ImperiumData } from "./imperium-data";
import { TemplateString } from "./model/template-string";
import { wikiTitleEscape } from "./wiki-utils";

const EMPTY = "";

export type Func1 = (str: string) => string;

export function nothing(): Func1 {
	return () => {
		return EMPTY;
	};
}

export function something(): Func1 {
	return (str) => {
		return str;
	};
}

export function call2(...cbs: Func1[]): Func1 {
	return (str) => {
		let result = str;
		for (const cb of cbs) {
			result = cb(result);
			if (!result) return EMPTY;
		}
		return result;
	};
}

export function semicolon(cb: Func1): Func1 {
	return (str) => {
		const ss = str.split(";").map(cb);
		return ss.join(";");
	};
}

export function distinct(separator = ";"): Func1 {
	return (str) => {
		const ss = [...new Set(str.split(separator))];
		return ss.join(";");
	};
}

export function colonFirst(cb: Func1): Func1 {
	return (str) => {
		const first = str.split(":")[0];
		return cb(first);
	};
}

export function ifor(...cbs: Func1[]): Func1 {
	return (str) => {
		for (let i = 0; i < cbs.length; i++) {
			const cb = cbs[i];
			const res = cb(str);
			if (res) return res;
		}
		return EMPTY;
	};
}

export function gamedataString(
	tablename: string,
	key: string | number,
	value: string | number,
	keyPrefix: string | ((key: string) => string) = ""
): Func1 {
	return (str) => {
		if (str) {
			const table = ImperiumData.fromGamedata().getTable(tablename);
			const row = table.find(
				(r) =>
					r.get(key) ==
					(typeof keyPrefix == "function" ? keyPrefix(str) : keyPrefix + str)
			);
			if (row) {
				if (typeof value == "string") {
					const subvalues = value.split(":");
					const values = subvalues.map((sv) => row.get(sv)).join(":");
					return values;
				}
				return `${row.get(value)}`;
			}
		}
		return EMPTY;
	};
}

let defaultLanguage = "Chinese";
export function setDefaultLanguage(language: string) {
	defaultLanguage = language;
}

export function localizationString(
	tablename: string,
	keyPrefix: string | ((key: string) => string) = "",
	key = "Key",
	value = defaultLanguage
): Func1 {
	return (str) => {
		if (str) {
			const table = ImperiumData.fromLocalization().getTable(tablename);
			const row = table.find(
				(r) =>
					r.get(key) ==
					(typeof keyPrefix == "function" ? keyPrefix(str) : keyPrefix + str)
			);
			if (row) return row.get(value);
		}
		return EMPTY;
	};
}

export function applyStringRefer(str: string, replacer = stringReferReplacer): string {
	return str.replace(
		/\$(INFO|BUFF|TRIG)\:\((\w+)(?:,\(([\w\.,]*)\))?\)/g,
		(substring: string, type: string, key: string, arg: string) => {
			const result = replacer(substring, type, key, arg);
			return applyStringRefer(result, replacer);
		}
	);
}

export function stringReferReplacer(substring: string, type: string, key: string, arg: string) {
	if (type === "INFO") {
		const args = arg.split(",");
		return localizationString("BaseSkillInfo")(key).replace(
			/\$ARG(\d+)/g,
			(substring, index) => {
				if (args[index - 1]) {
					return args[index - 1];
				}
				return substring;
			}
		);
	}
	if (type === "BUFF") {
		return localizationString("BaseBuff")(key);
	}
	if (type === "TRIG") {
		return new TemplateString(localizationString("BaseBuff")("format")).apply([
			localizationString("BaseBuff")("TRIGGER"),
			localizationString("BaseBuff")(key),
		]);
	}
	return substring;
}

export function achReplacer(string: string): string {
	return string.replace(/\$ACH\(.*?\)/g, "");
}

export function localizationStringAuto(): Func1 {
	return (str) => {
		if (str) {
			const s = str.split("/");
			return localizationString(s[0])(s[1]);
		}
		return EMPTY;
	};
}

/**
 * string: linkId:payType
 */
export function localizationItemNameWithType(withCurrencyType = false): Func1 {
	return (str) => {
		const strings = str.split(":");
		switch (strings[1]) {
			default:
				if (withCurrencyType) {
					return call2(currency2Id(), localizationItemName())(strings[1]);
				}
				break;
			case "Item":
				return localizationItemName()(strings[0]);
			case "ExploreItem":
				return localizationItemName(true)(strings[0]);
			case "Monster":
				// return localizationMonsterName()(strings[0]);
				return `${localizationMonsterNameById()(strings[0])}:${gamedataString(
					"HomelandMonster",
					"id",
					"rank"
				)(strings[0])}`;
			case "Hero": {
				const [heroId, rankId] = strings[0].split("_");
				return `${localizationCharacterNameByHeroId()(heroId)}_${rank()(rankId)}`;
			}
			case "Diligent":
				return localizationChapterName()(strings[0]);
		}
		return "";
	};
}

export function localizationItemName(isExplore = false): Func1 {
	if (isExplore) {
		return call2(
			ifor(
				localizationString("ExpItem", "exp_item_name_"),
				call2(
					gamedataString("ExploreItems", "id", "localizationKeyName"),
					localizationString("ExpItem")
				),
				gamedataString("ExploreItems", "id", "iconKey")
			),
			(str) => itemNameNormalization(str)
		);
	}
	return call2(
		ifor(
			localizationString("Item", "item_name_"),
			call2(gamedataString("Items", "id", "localizationKeyName"), localizationString("Item")),
			gamedataString("Items", "id", "name"),
			gamedataString("Items", "id", "iconKey")
		),
		(str) => itemNameNormalization(str)
	);
}

export function itemNameNormalization(name: string) {
	return String(name).trim();
}

export function currency2Id(): Func1 {
	return (str) => {
		str = String(str).toLowerCase();
		switch (str) {
			case "playerexp":
				return "321";
			case "soul":
				return "1001";
			case "coin":
				return "1002";
			case "gem":
			case "freegem":
				return "1003";
			case "ring":
				return "1004";
			case "medal":
				return "1005";
			case "guildcoin":
				return "1006";
			case "guildring":
				return "1007";
			case "paidgem":
			case "iosgem":
			case "andgem":
			case "dmmgem":
				return "1008";
			case "diligent":
				return "1011";
			case "monsterexp":
				return "20038";
			case "homeexp":
				return "20039";
		}
		return "";
	};
}

export function localizationCurrencyName(): Func1 {
	return call2(currency2Id(), localizationItemName());
}

export function localizationCharacterNameByHeroId(): Func1 {
	return call2(gamedataString("Heroes", "id", "model"), localizationCharacterName(false));
}

/**
 * `t0033s5` => `碎牙`
 *
 * `t0033s5_a2` => `碎牙`
 */
export function localizationCharacterName(includeSkillset = true, includeNoteName = true): Func1 {
	return call2(
		ifor(
			includeSkillset
				? call2(
						gamedataString("HeroSkills", "skillSet", "heroId"),
						gamedataString("Heroes", "id", "model"),
						localizationCharacterName(false, false)
				  )
				: nothing(),
			localizationString("CharacterName"),
			localizationString("Default"),
			includeNoteName ? gamedataString("Heroes", "model", "name") : nothing()
		),
		(str) => characterNameNormalization(str)
	);
}

export function characterNameNormalization(name: string) {
	return wikiTitleEscape(
		name.replace(/\sSP$/, "SP").replace(/\sMZ$/, "MZ").replace(/\sOS$/, "OS")
	);
}

export function localizationCharacterNameWithDefault(): Func1 {
	return ifor(localizationCharacterName(), something());
}

export function localizationExploreBuildingName(): Func1 {
	return localizationString("ExploreBuilding", (str) => `${str.toLowerCase()}_title`);
}

export function localizationHomelandBuildingName(): Func1 {
	return call2(
		gamedataString("HomelandBuilding", "buildingId", "nameKey"),
		localizationString("Homeland")
	);
}

export function localizationBuffName(orig?: boolean): Func1 {
	return (str) => {
		let name = applyStringRefer(localizationString("Buff")(str));
		if (name) {
			name = name.split(/(:|：)/)[0];
			if (orig) {
				return `${str}(${name})`;
			}
		}
		return name || str;
	};
}

export function localizationTavernMissionName(withRank = false): Func1 {
	const namer = ifor(
		call2(
			gamedataString("TavernMission", "id", "questKeyName"),
			localizationString("TavernMission")
		),
		gamedataString("TavernMission", "id", "questKeyDescription"),
		gamedataString("TavernMission", "id", "questKeyName")
	);
	return (str) => {
		if (withRank) {
			return `【${gamedataString("TavernMission", "id", "questRank")(str)} ★】${namer(str)}`;
		} else {
			return namer(str);
		}
	};
}

export function localizationMonsterNameById(): Func1 {
	return ifor(
		call2(gamedataString("HomelandMonster", "id", "keyName"), localizationCharacterName()),
		gamedataString("HomelandMonster", "id", "keyName"),
		something()
	);
}

export function localizationMonsterName(): Func1 {
	return call2(
		gamedataString("HomelandMonster", "monsterId", "keyName"),
		localizationCharacterName()
	);
}

export function localizationMonsterSkillName(): Func1 {
	return ifor(
		call2(
			gamedataString("MonsterSkill", "skillId", "skillKeyName"),
			localizationString("MonsterSkill")
		),
		gamedataString("MonsterSkill", "skillId", "iconKey")
	);
}

export function localizationMonsterSpecialityName(): Func1 {
	return call2(
		gamedataString("MonsterSpeciality", "id", "specialityKeyName"),
		localizationString("MonsterSkill")
	);
}

export function weekday(): Func1 {
	return (n) => {
		switch (Number(n)) {
			case 1:
				return "週一";
			case 2:
				return "週二";
			case 3:
				return "週三";
			case 4:
				return "週四";
			case 5:
				return "週五";
			case 6:
				return "週六";
			case 0:
				return "週日";
		}
		return EMPTY;
	};
}

export function rank(defaultReturn: string = EMPTY, custom: Record<string, string> = {}): Func1 {
	return (n) => {
		if (n in custom) {
			return custom[n];
		}
		switch (Number(n)) {
			case 2:
				return "零階";
			case 3:
				return "一階";
			case 4:
				return "二階";
			case 5:
				return "三階";
			case 100:
				return "Alt";
		}
		return defaultReturn;
	};
}

export function gbw(): Func1 {
	return ifor(gold(), black(), white());
}

export function gold(): Func1 {
	return (str) => {
		switch (String(str)) {
			case "true":
			case "gold":
				return "金";
		}
		return "";
	};
}

export function black(): Func1 {
	return (str) => {
		switch (String(str)) {
			case "true":
			case "black":
				return "黑";
		}
		return "";
	};
}

export function white(): Func1 {
	return (str) => {
		switch (String(str)) {
			case "true":
			case "white":
				return "白";
		}
		return "";
	};
}

export function localizationVolumeNameById(): Func1 {
	return ifor(
		call2(gamedataString("Volume", "order", "name"), localizationString("Metagame")),
		gamedataString("Volume", "order", "title")
	);
}

export function localizationChapterName(): Func1 {
	return call2(gamedataString("Chapters", "id", "title"), localizationString("RegionName"));
}

/**
 * `main_001_201` => `1-1 王國治安官`
 */
export function localizationQuestName(): Func1 {
	return call2(gamedataString("Quests", "id", "levelId"), localizationString("QuestName"));
}

export function localizationQuestModeName(): Func1 {
	return call2(gamedataString("QuestMode", "id", "modeI2"), localizationStringAuto(), (str) =>
		str.trim()
	);
}

export function localizationUnlockCondition(): Func1 {
	return (str) => {
		const strings = str.split(":");
		switch (strings[1]) {
			case "QuestComplete":
				return localizationQuestName()(strings[0]);
		}
		return "";
	};
}

export function getConstants(): Func1 {
	return gamedataString("Constants", "id", "value");
}
