import converter from "number-to-chinese-words";
import { ImperiumData, RowWrapper } from "./imperium-data";
import { TemplateFormatter } from "./lib/TemplateFormatter";
import { localizationCharacterName, localizationItemName, localizationString, rank } from "./localization";
import { Logger } from './logger';
import { applyAtk, calcStatistics, heroName, skillinfo } from "./wiki-hero";
import { wikitemplate, wikiTitleEscape } from "./wiki-utils";

const logger = new Logger('wiki-quest');

const ChaptersTable = ImperiumData.fromGamedata().getTable("Chapters");
const DropItemsTable = ImperiumData.fromGamedata().getTable("DropItems");
const HeroesTable = ImperiumData.fromGamedata().getTable("Heroes");
const HeroRanksTable = ImperiumData.fromGamedata().getTable("HeroRanks");
const HeroSkillsTable = ImperiumData.fromGamedata().getTable("HeroSkills");
const QuestsTable = ImperiumData.fromGamedata().getTable("Quests");
const TeamLimitsTable = ImperiumData.fromGamedata().getTable("TeamLimits");
const QuestExtraSettingsTable = ImperiumData.fromGamedata().getTable("QuestExtraSettings");

export function getQuestJsonData() {
	const out: Record<string, Record<string, string>> = {};
	const chapters = ChaptersTable.filter(c => c.get("enable"));
	for (let i = 0; i < chapters.length; i++) {
		const chapter = chapters[i];
		const chID = chapter.get("id");
		const chName = localizationString("RegionName")(chapter.get("name"));
		const chTitle = localizationString("RegionName")(chapter.get("title"));
		const chKey = `${chID} - ${chName}: ${chTitle}`;
		out[chKey] = out[chKey] || {};

		const quests = QuestsTable.filter(q => q.get("chapter") == chID && q.get("enable"));
		for (let j = 0; j < quests.length; j++) {
			const quest = quests[j];
			const { fullname, prefix, ch, ch2, name } = questMetadata(quest, chapter);

			const dropitems: {id: string, name: string, count: string}[] = [];
			const dropitemsList = String(quest.get("displayDropItemFirst")).split(";").filter((s) => s != "").map((item) => item.split(":"));
			const dropGroup = DropItemsTable.filter(ditem => ditem.get("groupId") == quest.get("dropGroupIdFirst"));
			for (let k = 0; k < dropitemsList.length; k++) {
				const item = dropitemsList[k];
				let count = item.length > 1 ? item[1] : "";
				const dropGroupItem = dropGroup.find(ditem => ditem.get("itemId") == item[0]);
				if (dropGroupItem) {
					if (dropGroupItem.get("itemCount") > 1) {
						count = dropGroupItem.get("itemCount");
					}
				}
				if (Number(count) > 1 && dropitems.findIndex(item2 => item2.id == item[0]) > -1) {
					continue;
				}
				if (item[0] == "1004" && quest.get("ringFirst") > 0) {
					/* 1004 (魂晶碎片) */
					count = questNumberFirst(quest, "ring");
				}
				dropitems.push({
					id: item[0],
					name: localizationItemName()(item[0]),
					count: count,
				});
			}
			for (let k = 0; k < dropGroup.length; k++) {
				const dropGroupItem = dropGroup[k];
				const dropItem = dropitems.find(ditem => dropGroupItem.get("itemId") == ditem.id);
				if (!dropItem) {
					const itemname = localizationItemName()(dropGroupItem.get("itemId"));
					if (!itemname) {
						continue;
					}
					dropitems.push({
						id: dropGroupItem.get("itemId"),
						name: itemname,
						count: dropGroupItem.get("itemCount") > 1 ? dropGroupItem.get("itemCount") : "",
					});
				}
			}

			const questArgs: Record<string, any> = {
				"上一層": " ",
				"上一關": j < 1 ? " " : questMetadata(quests[j - 1], chapter).fullname,
				"下一關": j >= quests.length - 1 || j < 0 ? " " : questMetadata(quests[j + 1], chapter).fullname,
				"章節": prefix + ch || " ",
				"關卡": ch2 || " ",
				"名稱": name || " ",
				"類型": subtitle(quest.get("subtitle")),
				"等級": quest.get("dynamicLevel") ? "諦視者等級" : quest.get("recommendLevel"),
				"經驗": questNumberFirst(quest, "expPlayer") || "0",
				"庫倫": questNumberFirst(quest, "coin") || "0",
				"魂能": questNumberFirst(quest, "expTimePiece") || "0",
				"角色魂能": questNumberFirst(quest, "expHero") || "0",
			};

			let dropitemIndex;
			for (dropitemIndex = 0; dropitemIndex < dropitems.length; dropitemIndex++) {
				const item = dropitems[dropitemIndex];
				questArgs[`戰利品${dropitemIndex + 1}`] = item.name;
				if (item.count) {
					questArgs[`戰利品${dropitemIndex + 1}數量`] = item.count;
				}
			}
			if (dropitemIndex >= dropitems.length) {
				// lastest item
				for (let k = dropitemIndex; k < 4; k++) {
					questArgs[`戰利品${k + 1}`] = " ";
				}
			}

			Object.assign(questArgs, {
				"敵人總波數": " ",
				"地圖點": POI(quest.get("questLocation"))
			});

			if (('' + chapter.get("title")).startsWith("week")) {
				/* 每日限時活動 */
				questArgs["上一層"] = "每日限時活動";
				questArgs["上一關"] = questArgs["上一關"].indexOf("-") != -1 ? questArgs["上一關"].split("-")[1].trim() : questArgs["上一關"];
				questArgs["下一關"] = questArgs["下一關"].indexOf("-") != -1 ? questArgs["下一關"].split("-")[1].trim() : questArgs["下一關"];
				questArgs["章節"] = "每日限時活動";
				if (questArgs["戰利品2"] == "金色一階魂能(舊)") {
					questArgs["戰利品2"] = " ";
				}
				questArgs["隱藏附加說明"] = "1";
				if (questArgs["名稱"].indexOf("魂能") != -1 || questArgs["名稱"].indexOf("庫倫") != -1) {
					questArgs["隱藏戰利品"] = "1";
				}
			}

			const teamlimitArgs: Record<string, any> = {
				"可用角色限制": quest.get("heroLimitId") == -1 ? "無" : "有"
			};

			const teamlimit = TeamLimitsTable.find(t => t.get("id") == quest.get("heroLimitId"));
			if (teamlimit) {
				let teamlimitData: Team<TeamLimitData> = {
					g: {
						hero: HeroesTable.find(h => h.get("id") == teamlimit.get("idG")),
						type: teamlimit.get("typeG"),
						rank: teamlimit.get("rankG"),
						skill: teamlimit.get("skillG"),
						lv: teamlimit.get("lvG") || "",
						name: "",
					},
					b: {
						hero: HeroesTable.find(h => h.get("id") == teamlimit.get("idB")),
						type: teamlimit.get("typeB"),
						rank: teamlimit.get("rankB"),
						skill: teamlimit.get("skillB"),
						lv: teamlimit.get("lvB") || "",
						name: "",
					},
					w: {
						hero: HeroesTable.find(h => h.get("id") == teamlimit.get("idW")),
						type: teamlimit.get("typeW"),
						rank: teamlimit.get("rankW"),
						skill: teamlimit.get("skillW"),
						lv: teamlimit.get("lvW") || "",
						name: "",
					},
					SP1: {
						hero: HeroesTable.find(h => h.get("id") == teamlimit.get("idSP1")),
						type: teamlimit.get("typeSP1"),
						rank: teamlimit.get("rankSP1"),
						skill: teamlimit.get("skillSP1"),
						lv: teamlimit.get("lvSP1") || "",
						name: "",
					},
					SP2: {
						hero: HeroesTable.find(h => h.get("id") == teamlimit.get("idSP2")),
						type: teamlimit.get("typeSP2"),
						rank: teamlimit.get("rankSP2"),
						skill: teamlimit.get("skillSP2"),
						lv: teamlimit.get("lvSP2") || "",
						name: "",
					},
				};
				teamlimitData.g.name = teamlimitHero(teamlimitData.g);
				teamlimitData.b.name = teamlimitHero(teamlimitData.b);
				teamlimitData.w.name = teamlimitHero(teamlimitData.w);
				teamlimitData.SP1.name = teamlimitHero(teamlimitData.SP1);
				teamlimitData.SP2.name = teamlimitHero(teamlimitData.SP2);

				teamlimitData.g.rank = teamlimitHeroRank(teamlimitData.g);
				teamlimitData.b.rank = teamlimitHeroRank(teamlimitData.b);
				teamlimitData.w.rank = teamlimitHeroRank(teamlimitData.w);
				teamlimitData.SP1.rank = teamlimitHeroRank(teamlimitData.SP1);
				teamlimitData.SP2.rank = teamlimitHeroRank(teamlimitData.SP2);

				Object.assign(teamlimitArgs, {
					"金位名稱": teamlimitData.g.name,
					"金位階級": teamlimitData.g.rank || " ",
					"金位等級": Number(teamlimitData.g.lv) > -1 ? teamlimitData.g.lv : " ",
					"金位等級類型": teamlimitData.g.type == "HeroLevel" ? teamlimitData.g.type : "",
					"金位一魂說明": teamlimitData.g.S1,
					"金位二魂說明": teamlimitData.g.S2,
					"金位三魂說明": teamlimitData.g.E3,
					"金位三魂類型": teamlimitData.g.E3type,
					"金位四魂說明": teamlimitData.g.S3,
					"金位四魂類型": teamlimitData.g.S3type,
					"金位六魂說明": teamlimitData.g.E6,
					"金位被動說明": teamlimitData.g.P1,
					"金位nolink": teamlimitData.g.S1 ? "true" : "",

					"黑位名稱": teamlimitData.b.name,
					"黑位階級": teamlimitData.b.rank || " ",
					"黑位等級": Number(teamlimitData.b.lv) > -1 ? teamlimitData.b.lv : " ",
					"黑位等級類型": teamlimitData.b.type == "HeroLevel" ? teamlimitData.b.type : "",
					"黑位一魂說明": teamlimitData.b.S1,
					"黑位二魂說明": teamlimitData.b.S2,
					"黑位三魂說明": teamlimitData.b.E3,
					"黑位三魂類型": teamlimitData.b.E3type,
					"黑位四魂說明": teamlimitData.b.S3,
					"黑位四魂類型": teamlimitData.b.S3type,
					"黑位六魂說明": teamlimitData.b.E6,
					"黑位被動說明": teamlimitData.b.P1,
					"黑位nolink": teamlimitData.b.S1 ? "true" : "",

					"白位名稱": teamlimitData.w.name,
					"白位階級": teamlimitData.w.rank || " ",
					"白位等級": Number(teamlimitData.w.lv) > -1 ? teamlimitData.w.lv : " ",
					"白位等級類型": teamlimitData.w.type == "HeroLevel" ? teamlimitData.w.type : "",
					"白位一魂說明": teamlimitData.w.S1,
					"白位二魂說明": teamlimitData.w.S2,
					"白位三魂說明": teamlimitData.w.E3,
					"白位三魂類型": teamlimitData.w.E3type,
					"白位四魂說明": teamlimitData.w.S3,
					"白位四魂類型": teamlimitData.w.S3type,
					"白位六魂說明": teamlimitData.w.E6,
					"白位被動說明": teamlimitData.w.P1,
					"白位nolink": teamlimitData.w.S1 ? "true" : "",

					"參謀1名稱": teamlimitData.SP1.name,
					"參謀1階級": teamlimitData.SP1.rank || " ",
					"參謀1等級": Number(teamlimitData.SP1.lv) > -1 ? teamlimitData.SP1.lv : " ",
					"參謀1等級類型": teamlimitData.SP1.type == "HeroLevel" ? teamlimitData.SP1.type : "",
					"參謀1說明": teamlimitData.SP1.A1,
					"參謀1nolink": teamlimitData.SP1.A1 ? "true" : "",

					"參謀2名稱": teamlimitData.SP2.name,
					"參謀2階級": teamlimitData.SP2.rank || " ",
					"參謀2等級": Number(teamlimitData.SP2.lv) > -1 ? teamlimitData.SP2.lv : " ",
					"參謀2等級類型": teamlimitData.SP2.type == "HeroLevel" ? teamlimitData.SP2.type : "",
					"參謀2說明": teamlimitData.SP2.A1,
					"參謀2nolink": teamlimitData.SP2.A1 ? "true" : "",
				});
			}

			const sideStoryLimit = questSideStoryLimit(quest, chapter);
			out[chKey][`${fullname} (${quest.get("levelId")})`] = `${wikitemplate("關卡資訊", questArgs, TemplateFormatter.FORMAT.BLOCK)}\n${sideStoryLimit[0]}\n${wikitemplate("角色限制", teamlimitArgs, TemplateFormatter.FORMAT.BLOCK)}\n${sideStoryLimit[1]}`;
		}
	}
	return out;
}

interface QuestMetadata {
	rawname: string;
	fullname: string;
	prefix: string;
	ch: string;
	ch2: string;
	name: string;
	wikilink: string;
}

const questWikiLinkMap: Record<string, string> = {
	3426: "吸吮 (挑戰)",
	3430: "窒息 (挑戰)",
	600017: "炎日軍團(探索)",
	600020: "沙漠市集(探索)",
};

export function questMetadata(quest: RowWrapper, chapter?: RowWrapper): QuestMetadata {
	if (!chapter) {
		chapter = ChaptersTable.find(c => c.get("id") == quest.get("chapter"));
	}
	const rawname = quest && (localizationString("QuestName")(quest.get("levelId")) || quest.get("name")) || "";
	let prefix = "";
	let ch = "";
	let ch2 = "";
	let name = `${rawname}`.trim();
	let wikilink = name;
	const nameMatch = rawname.match(/^([a-zA-Z]?|课程|试炼)([0-9]+)\-([a-zA-Z0-9]+)(\s+|.)(.*)$/);
	if (nameMatch) {
		prefix = String.prototype.trim.call(nameMatch[1]);
		ch = String.prototype.trim.call(nameMatch[2]);
		ch2 = String.prototype.trim.call(nameMatch[3]);
		name = String.prototype.trim.call(nameMatch[5]);
		wikilink = name;
	}
	if (chapter) {
		const chapterId = chapter.get("id");
		const chapterCategory = chapter.get("category");
		const chapterGroup = chapter.get("group");
		const chapterTitle = chapter.get("title") + "";
		const chapterImage = chapter.get("mainImage") + "";
		switch (chapterCategory) {
			case "Main": { // 主線
				if (quest && !quest.get("enable")) {
					ch2 = `${ch}-${ch2}`;
					ch = "過去的主線";
				}
				const mainImage = chapterImage.match(/((S\d)_)?ch(\d+)/);
				if (mainImage && mainImage[2]) {
					ch = `${mainImage[2]}-${ch}`;
				}
				break;
			}

			case "Region": // 區域探索
			case "Challenge": // 挑戰關卡
			case "Tutorial": // 教學關卡
				break;

			case "Explore": // 探索系統
				ch = localizationString("RegionName")(chapterTitle);
				break;

			case "Event": {
				ch = localizationString("RegionName")(chapterTitle);
				if (chapterTitle.startsWith("week")) {
					// 每日限時活動
					break;
				}
				if (chapterImage == "daily01") {
					// 結晶蒐集
					break;
				}
				if (chapterImage == "daily02") {
					// 與英雄共舞
					break;
				}
				if (chapterGroup == "Adventure") {
					// 幻境試煉
					break;
				}
				if (chapterGroup == "Multiplayer") {
					// 與夥伴合奏
					wikilink = `${ch}/${name}${quest.get("recommendLevel") == 50 ? "(Lv.50)" : ""}`;
					break;
				}
				const ssChapter = ChaptersTable.find(c => c.get("group") == "SideStory" && c.get("category") == "SideStory" && c.get("title") == chapterTitle);
				if (ssChapter) {
					return questMetadata(quest, ssChapter);
				}
				const questCharU01 = QuestsTable.find(r => r.get("chapter") == chapterId && !!(r.get("levelId") + "").match(/char_(.*)_u01/));
				if (questCharU01 && quest) {
					const questCharU01Name = localizationString("QuestName")(questCharU01.get("levelId"));
					const heroName = questCharU01Name.replace("的旅程初級", "");
					ch = `${heroName}《${localizationString("RegionName")(chapterTitle)}》`;
					wikilink = `${ch}/${name}`;
					break;
				}
				if (ch == "Reset") {
					ch = "Sdorica X CytusⅡ《Reset》";
				}
				wikilink = `${ch}/${name}`;
				break;
			}

			case "SideStory": {
				const ssHero = HeroesTable.find(r => r.get("storyChapter") == chapterId);
				if (ssHero) {
					let ssHeroName = localizationCharacterName()(ssHero.get("model"));
					if (ssHeroName == "愛麗絲") {
						ssHeroName = "Sdorica X DEEMO";
					}
					ch = `${ssHeroName}《${localizationString("RegionName")(chapterTitle)}》`;
					wikilink = `${ch}/${name}`;
					break;
				}
				ch = localizationString("RegionName")(chapterTitle);
				wikilink = `${ch}/${name}`;
				break;
			}
		}
	}
	if (quest && quest.get("id") in questWikiLinkMap) {
		wikilink = questWikiLinkMap[quest.get("id")];
	}
	return {
		rawname,
		fullname: quest ? `${prefix}${ch}-${ch2} ${name}` : "",
		prefix,
		ch,
		ch2,
		name,
		wikilink,
	};
}

export function getChapterType(chapter: RowWrapper) {
	const chapterId = chapter.get("id");
	const chapterCategory = chapter.get("category");
	const chapterGroup = chapter.get("group");
	const chapterTitle = chapter.get("title") + "";
	const chapterImage = chapter.get("mainImage") + "";

	switch (chapterCategory) {
		case "Main": { // 主線
			const mainImage = chapterImage.match(/(S2_)?(S3_)?ch(\d+)/);
			if (mainImage) {
				if (mainImage[1]) {
					return "Sdorica -mirage-";
				}
				if (mainImage[2]) {
					return "Sdorica -eclipse-";
				}
				return "Sdorica -sunset-";
			}
			break;
		}

		case "Region":
			return "區域探索";
		case "Challenge":
			return "挑戰關卡";
		case "Tutorial":
			return "教學關卡";
		case "Explore":
			return "探索系統";

		case "Event": { // 活動
			if (chapterTitle.startsWith("week")) {
				return "每日限時活動";
			}
			if (chapterImage == "daily01") {
				return "結晶蒐集";
			}
			if (chapterImage == "daily02") {
				return "與英雄共舞";
			}
			if (chapterGroup == "Adventure") {
				return "幻境試煉";
			}
			if (chapterGroup == "Multiplayer") {
				return "與夥伴合奏";
			}
			const ssChapter = ChaptersTable.find(c => c.get("group") == "SideStory" && c.get("category") == "SideStory" && c.get("title") == chapterTitle);
			if (ssChapter) {
				return "角色故事";
			}
			const questCharU01 = QuestsTable.find(r => r.get("chapter") == chapterId && !!(r.get("levelId") + "").match(/char_(.*)_u01/));
			if (questCharU01) {
				return "角色故事";
			}
			return "活動關卡";
		}
		case "SideStory":
			return "角色故事";
	}
	logger.error(`Unknown main chapter: ${chapterTitle}`);
	debugger;
	return "Unknown";
}

export interface ChapterMetadata {
	group: string;
	name: string;
	title: string;
	imageName: string;
}

export function chapterMetadata(chapter: RowWrapper): ChapterMetadata {
	const out: ChapterMetadata = {
		group: getChapterType(chapter),
		name: localizationString("RegionName")(chapter.get("name")),
		title: localizationString("RegionName")(chapter.get("title")),
		imageName: "",
	};
	out.imageName = out.title;
	const nameNumber = getNumber(out.name);

	switch (out.group) {
		case "Sdorica -sunset-":
			out.imageName = `第${converter.toWords(nameNumber)}章`;
			break;

		case "Sdorica -mirage-":
			out.name = `S2 ${out.name}`;
			out.imageName = `S2第${converter.toWords(nameNumber)}章`;
			break;

		case "Sdorica -eclipse-":
			out.name = `S3 ${out.name}`;
			out.imageName = `S3第${converter.toWords(nameNumber)}章`;
			break;

		case "活動關卡":
		case "每日限時活動":
		case "結晶蒐集":
		case "與英雄共舞":
		case "幻境試煉":
		case "與夥伴合奏":
		case "角色故事": {
			const chapterId = chapter.get("id");
			const quests = QuestsTable.filter(q => q.get("chapter") == chapterId && q.get("enable"));
			const firstQuest = quests[0];
			out.title = questMetadata(firstQuest, chapter).ch;
			out.imageName = out.title;
			break;
		}
	}

	out.name = wikiTitleEscape(out.name);
	out.title = wikiTitleEscape(out.title);
	out.imageName = wikiTitleEscape(out.imageName);
	return out;
}

function getNumber(str: string) {
	const m = str.match(/(\d+)/);
	if (m) {
		return Number(m[1]);
	}
	return NaN;
}

interface Team<T> {
	g: T;
	b: T;
	w: T;
	SP1: T;
	SP2: T;
}
interface TeamLimitData {
	hero?: RowWrapper;
	type: string;
	rank: string;
	skill: string;
	lv: string;
	name: string;
	S1?: string;
	S2?: string;
	E3?: string;
	E3type?: string;
	S3?: string;
	S3type?: string;
	E6?: string;
	P1?: string;
	A1?: string;
}

function teamlimitHero(data: TeamLimitData): string {
	switch (data.type) {
		case "None": return "關閉";
		case "Any": return "開放";
	}

	if (!data.hero) {
		return "";
	}
	if (!data.hero.get("enable")) {
		const skills = HeroSkillsTable.find((s) => s.get("heroId") == data.hero!.get("id") && s.get("rank") == data.rank);
		let skillSet = `${data.hero.get("model")}s${data.rank}`;
		if (skills) {
			skillSet = skills.get("skillSet");

			const skillIds = ["S1", "S2", "S3"];
			skillIds.forEach(skill => {
				const stoneEraseType = skills.get(skill);
				let skilltype = "";
				switch (stoneEraseType) {
					case "O3I":
					case "O4I":
						skilltype = "I形";
						break;
					case "O3L":
					case "O4L":
						skilltype = "L形";
						break;
					case "O3A":
					case "O4A":
						skilltype = "任意形狀";
						break;
					case "O4":
						skilltype = "方形";
						break;
				}
				switch (`${stoneEraseType}`.substr(0, 2)) {
					case "O1":
						data.S1 = skillinfo(localizationString("SkillInfo")(`${skillSet}_S1_1`), "S1");
						break;
					case "O2":
						data.S2 = skillinfo(localizationString("SkillInfo")(`${skillSet}_S2_1`), "S2");
						break;
					case "O3":
						data.E3 = skillinfo(localizationString("SkillInfo")(`${skillSet}_E3_1`), "E3");
						data.E3type = skilltype;
						break;
					case "O4":
						data.S3 = skillinfo(localizationString("SkillInfo")(`${skillSet}_S3_1`), "S3");
						data.S3type = skilltype;
						break;
					case "O6":
						data.E6 = skillinfo(localizationString("SkillInfo")(`${skillSet}_E6_1`), "E6");
						break;
				}
			});
		}
		else {
			data.S1 = skillinfo(localizationString("SkillInfo")(`${skillSet}_S1_1`), "S1");
			data.S2 = skillinfo(localizationString("SkillInfo")(`${skillSet}_S2_1`), "S2");
			data.E3 = skillinfo(localizationString("SkillInfo")(`${skillSet}_E3_1`), "E3");
			data.S3 = skillinfo(localizationString("SkillInfo")(`${skillSet}_S3_1`), "S3");
			data.E6 = skillinfo(localizationString("SkillInfo")(`${skillSet}_E6_1`), "E6");
		}

		data.P1 = skillinfo(localizationString("SkillInfo")(`${skillSet}_P1`), "P1");
		data.A1 = skillinfo(localizationString("SkillInfo")(`${skillSet}_A1`), "A1");

		const heroRank = HeroRanksTable.find(r => r.get("heroId") == data.hero!.get("id") && r.get("rank") == data.rank);
		if (heroRank) {
			const atk = calcStatistics(data.hero.get("atk"), Number(data.lv), heroRank.get("attrModifier"));
			if (data.S1) data.S1 = applyAtk(data.S1, atk);
			if (data.S2) data.S2 = applyAtk(data.S2, atk);
			if (data.E3) data.E3 = applyAtk(data.E3, atk);
			if (data.S3) data.S3 = applyAtk(data.S3, atk);
			if (data.E6) data.E6 = applyAtk(data.E6, atk);
			if (data.P1) data.P1 = applyAtk(data.P1, atk);
			if (data.A1) data.A1 = applyAtk(data.A1, atk);
		}

		data.type = "";
	}
	if (data.hero.get("empty")) {
		data.rank = "";
		data.lv = "";
		data.type = "";
		return "關閉";
	}
	return localizationString("CharacterName")(`${data.hero.get("model")}s${data.rank}`) ||
		localizationString("CharacterName")(data.hero.get("model")) ||
		data.hero.get("name");
}

function teamlimitHeroRank(data: TeamLimitData): string {
	let out = rank("")(data.rank);
	if (data.skill) {
		const skill = localizationString("HeroSkills", "skill_set_")(data.skill);
		if (skill) {
			out = skill;
		}
	}
	if (out && data.hero && data.hero.get("enable")) {
		out = `{{階級稱號|${data.name}|${out}}}`;
	}
	else if (data.hero) {
		const heroId = data.hero.get("id");
		const skillset = HeroSkillsTable.find(r => r.get("heroId") == heroId && r.get("rank") == data.rank);
		if (skillset) {
			const skill = localizationString("HeroSkills", "skill_set_")(skillset.get("id"));
			if (skill) {
				out = skill;
			}
		}
	}
	return out;
}

function subtitle(s: string): string {
	switch (s) {
		case "Activity": return "活動";
		case "Story": return "故事";
		case "Battle": return "戰鬥";
		case "Challenge": return "挑戰";
	}
	return s;
}

function POI(key: string): string {
	let out = localizationString("POIName")(key) || key;
	switch (key[0]) {
		case '0':
			out = `<!-- ${out} -->`;
			break;
		case '1':
			out += "<!-- 晴空草原 -->";
			break;
		case '2':
			out += "<!-- 圖騰塔夫 -->";
			break;
		case '3':
			out += "<!-- 啼林谷 -->";
			break;
		case '4':
			if (out == "王座廳") {
				out += "(太陽王都)";
			}
			else {
				out += "<!-- 太陽王都 -->";
			}
			break;
		case '5':
			out += "<!-- 彭列瓦 -->";
			break;
		case '6':
			out += "<!-- 楓湖畔 -->";
			break;
		case '7':
			if (out == "王座廳") {
				out += "(亞特拉斯)";
			}
			else {
				out += "<!-- 亞特拉斯 -->";
			}
			break;
	}
	return out;
}

function questNumberFirst(quest: RowWrapper, key: string) {
	if (quest.get(key + "First") != quest.get(key)) {
		return `${quest.get(key + "First")} (${quest.get(key)})`;
	}
	return quest.get(key);
}

export function questSideStoryLimit(quest: RowWrapper, chapter: RowWrapper): [string, string] {
	let str1 = "";
	let str2 = "";
	if (chapter.get("category") == "SideStory") {
		const hero = HeroesTable.find(h => h.get("storyChapter") == chapter.get("id"));
		const extraSetting = QuestExtraSettingsTable.find(s => s.get("id") == quest.get("extraSettingId"));
		if (hero && extraSetting) {
			const { firstname } = heroName(hero);
			str1 = `{{角色故事限制 | 角色 = ${firstname} | 內容 = 報酬變化}}`;
			switch (extraSetting.get("unlockType")) {
				case "heroRank":
					if (extraSetting.get("param2") > hero.get("initRank")) {
						str2 = `{{角色故事限制 | 角色 = ${firstname} | 內容 = 共鳴限制 | 共鳴階級 = ${rank("")(extraSetting.get("param2"))}}}`;
					}
					break;
				case "QuestComplete":
					const compQuest = QuestsTable.find(q => q.get("id") == extraSetting.get("param1"));
					if (compQuest) {
						const { prefix: compprefix, ch: compch, ch2: compch2, name: compqname } = questMetadata(compQuest);
						str2 = `{{角色故事限制 | 角色 = ${firstname} | 內容 = 主線限制 | 關卡號碼 = ${compprefix}${compch}-${compch2} | 關卡名稱 = ${compqname}}}`;
						break;
					}
			}
		}
	}
	return [str1, str2];
}
