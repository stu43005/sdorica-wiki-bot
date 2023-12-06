import { HeroIconParams } from "../templates/hero-icon";
import { HeroRank } from "./enums/hero-rank.enum";
import { HeroSkillType } from "./enums/hero-skill-type.enum";
import { Hero } from "./hero";
import { HeroInfo } from "./hero-info";
import { HeroSkill } from "./hero-skill";

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
