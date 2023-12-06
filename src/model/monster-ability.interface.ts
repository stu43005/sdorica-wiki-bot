import { MonsterSkillIconParams } from "../templates/monster-skill-icon";

export interface IMonsterAbility {
	id: string;
	name: string;
	description: string;
	iconKey: string;
	getIconAssetUrl(): string | undefined;
	toWiki(options?: MonsterSkillIconParams): string;
}
