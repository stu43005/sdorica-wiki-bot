import { HeroIconParams } from "../templates/hero-icon.js";
import { HeroRank } from "./enums/custom/hero-rank.enum.js";
import { HeroSkillType } from "./enums/hero-skill-type.enum.js";
import { Hero } from "./hero.js";
import { HeroInfo } from "./hero-info.js";
import { HeroSkill } from "./hero-skill.js";

export interface IHeroSkillSet {
	hero?: Hero;
	model: string;
	heroSd?: string;
	name?: string;

	type?: HeroSkillType;
	rank?: HeroRank;
	rankPlus: string;
	isBook?: boolean;
	isAlt?: boolean;
	isSkin?: boolean;

	revive?: number;
	initCD: number;
	skillLv: number;

	P1: HeroSkill;
	A1: HeroSkill;
	S1: HeroSkill;
	S2: HeroSkill;
	S3: HeroSkill;

	info?: HeroInfo;

	toWiki(options?: HeroIconParams): string;
	getSdAssetUrl(): string | undefined;
}
