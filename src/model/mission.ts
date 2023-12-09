import { ImperiumData, RowWrapper } from "../imperium-data.js";
import { localizationCharacterNameByHeroId, localizationString } from "../localization.js";
import { wikiPageLink } from "../templates/wikilink.js";
import { ChapterGroup } from "./enums/chapter-group.enum.js";
import { MissionType } from "./enums/mission-type.enum.js";
import { ItemGiveRef } from "./item-give-ref.js";
import { Quest } from "./quest.js";
import { TemplateString } from "./template-string.js";

const MissionsTable = ImperiumData.fromGamedata().getTable("Missions");

const instances: Record<string, Mission> = {};
let allInstances: Mission[] | null = null;

export class Mission {
	public static get(id: string): Mission | undefined;
	public static get(row: RowWrapper): Mission;
	public static get(rowOrId: RowWrapper | string): Mission {
		const id = typeof rowOrId === "string" ? rowOrId : rowOrId.get("id");
		if (!instances[id]) {
			const row =
				typeof rowOrId === "string"
					? MissionsTable.find((r) => r.get("id") == id)
					: rowOrId;
			if (row) {
				instances[id] = new Mission(row);
			}
		}
		return instances[id];
	}

	public static find(predicate: (value: Mission) => boolean): Mission | undefined {
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
		for (let i = 0; i < MissionsTable.length; i++) {
			const row = MissionsTable.get(i);
			yield Mission.get(row);
		}
	}

	get id(): string {
		return this.row.get("id");
	}
	get tab(): string {
		return this.row.get("tab");
	}
	get category(): string {
		return this.row.get("category");
	}
	get order(): number {
		return +this.row.get("order");
	}
	get type(): MissionType {
		return this.row.get("type");
	}
	get enable(): boolean {
		return !!this.row.get("enable");
	}

	get minLv(): number {
		return +this.row.get("minLv");
	}
	get maxLv(): number {
		return +this.row.get("maxLv");
	}

	/**
	 * @deprecated 改用 {@link getMissionName}
	 */
	get name(): string {
		return this.row.get("name");
	}

	get param1(): number {
		return +this.row.get("param1");
	}
	get param2(): number {
		return +this.row.get("param2");
	}
	get param3(): string {
		return this.row.get("param3");
	}
	get requireId(): string {
		return this.row.get("requireId");
	}

	#giveItem: ItemGiveRef | null = null;
	get giveItem(): ItemGiveRef {
		return (this.#giveItem ??= new ItemGiveRef(
			this.row.get("giveType"),
			this.row.get("giveLinkId"),
			this.row.get("giveAmount"),
		));
	}

	get timeLimit(): number {
		return +this.row.get("timeLimit");
	}
	get weight(): number {
		return +this.row.get("weight");
	}

	constructor(private row: RowWrapper) {}

	public getMissionName(wikilink = false): string {
		if (this.type != MissionType.Quest) {
			return localizationString("Mission", "mission_")(this.id) || this.name;
		}

		let prefix = "";
		if (this.tab == "guild") {
			const lv = this.category.replace(/^guild/, "");
			prefix = new TemplateString(localizationString("Mission")("prefix_level")).apply({
				level: lv,
			});
		} else if (this.category == "limit7" || this.category == "treasure") {
			prefix = localizationString("Mission")("prefix_treasure");
		} else if (this.category == "limit6" || this.category == "gemCard") {
			prefix = localizationString("Mission")("prefix_gem");
		}

		const limitations = this.param3.split(";").map((limit) => {
			if (limit.startsWith("LimitTurn")) {
				const turn = limit.replace(/LimitTurn_/g, "");
				return new TemplateString(localizationString("Mission")("limit_turn")).apply({
					turn,
				});
			}
			if (limit.startsWith("LimitDead")) {
				const count = +limit.replace(/LimitDead_/g, "");
				if (!count) {
					return localizationString("Mission")("limit_no_casualties");
				}
				return new TemplateString(
					localizationString("Mission")("limit_casualties_count"),
				).apply({
					casualty: count,
				});
			}
			if (limit.startsWith("Use")) {
				const id = limit.replace(/Use_/g, "");
				return new TemplateString(localizationString("Mission")("use_heroId")).apply({
					characterName: localizationCharacterNameByHeroId()(id),
				});
			}
			if (limit.startsWith("NoUse")) {
				const id = limit.replace(/NoUse_/g, "");
				return new TemplateString(localizationString("Mission")("not_use_heroId")).apply({
					characterName: localizationCharacterNameByHeroId()(id),
				});
			}
			if (limit.startsWith("NoAssistant")) {
				return localizationString("Mission")("no_assistant");
			}
			if (limit.startsWith("NoGuild")) {
				return localizationString("Mission")("no_guild_assistant");
			}
			if (limit.startsWith("CastMore")) {
				const match = limit.match(/^CastMore_(\w+)_(\d+)$/);
				if (match) {
					const skill = match[1];
					const skillCount = +match[2];
					if (skill.startsWith("S")) {
						const block = +skill.substring(1);
						if (block) {
							return new TemplateString(
								localizationString("Mission")("castmore_Skill"),
							).apply({
								block,
								skillCount,
							});
						}
					}
					return new TemplateString(
						localizationString("Mission")(`castmore_${skill}`),
					).apply({
						skillCount,
					});
				}
				debugger;
				return limit;
			}
			if (limit.startsWith("CastLess")) {
				const match = limit.match(/^CastLess_(\w+)_(\d+)$/);
				if (match) {
					const skill = match[1];
					const skillCount = +match[2];
					if (skill.startsWith("S")) {
						const block = +skill.substring(1);
						if (block) {
							if (!skillCount) {
								return new TemplateString(
									localizationString("Mission")("cast_no_erase_Skill"),
								).apply({
									block,
								});
							}
							return new TemplateString(
								localizationString("Mission")("castless_Skill"),
							).apply({
								block,
								skillCount,
							});
						}
					}
					if (!skillCount) {
						return localizationString("Mission")(`cast_no_${skill}`);
					}
					return new TemplateString(
						localizationString("Mission")(`castless_${skill}`),
					).apply({
						skillCount,
					});
				}
				debugger;
				return limit;
			}
			if (limit.startsWith("limitS")) {
				const match = limit.match(/^limitS(\d+)$/);
				if (match) {
					return new TemplateString(
						localizationString("Mission")("cast_no_erase_Skill"),
					).apply({
						block: match[1],
					});
				}
				debugger;
				return limit;
			}
			return limit;
		});

		let clear = `${this.param1}`;
		const quest = Quest.get(clear);
		if (quest && quest.chapter) {
			const questname = wikilink
				? wikiPageLink(quest.getWikiLink(), quest.title)
				: quest.title;
			switch (quest.chapter.group) {
				case ChapterGroup.Region:
					clear = new TemplateString(localizationString("Mission")("clear_region")).apply(
						{
							questname,
						},
					);
					break;
				case ChapterGroup.Challenge:
					clear = new TemplateString(
						localizationString("Mission")("clear_challenge"),
					).apply({
						questname,
					});
					break;
			}
		}

		const and = localizationString("Mission")("and_description");
		return `${prefix} ${limitations.join(` ${and} `)} ${clear}`.trim();
	}
}
