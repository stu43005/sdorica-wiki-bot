import { HeroRank } from "./enums/hero-rank.enum";
import { Hero } from "./hero";
import { HeroInfo } from "./hero-info";
import { HeroSkill } from "./hero-skill";

export interface IHeroSkillSet {
	hero?: Hero;
	model: string;
	name?: string;

	rank?: HeroRank;
	rankPlus: string;
	isBook?: boolean;
	isAlt?: boolean;
	isSkin?: boolean;

	revive?: number;
	skillLv: number;

	P1: HeroSkill;
	A1: HeroSkill;
	S1: HeroSkill;
	S2: HeroSkill;
	S3: HeroSkill;

	info?: HeroInfo;
}
