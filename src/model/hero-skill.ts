import { localizationString } from "../localization";
import { skillinfo } from "../wiki-hero";
import { HeroRank } from "./enums/hero-rank.enum";
import { SkillId } from "./enums/skill-id.enum";
import { SkillType } from "./enums/skill-type.enum";
import { StoneEraseShape } from "./enums/stone-erase-shape.enum";
import { StoneEraseType } from "./enums/stone-erase-type.enum";
import { IHeroSkillSet } from "./hero-skillset.interface";

export class HeroSkill {
	public static getSkillType(stoneEraseType: StoneEraseType) {
		switch (stoneEraseType) {
			case StoneEraseType.O1:
				return SkillType.O1;
			case StoneEraseType.O2:
				return SkillType.O2;
			case StoneEraseType.O3A:
			case StoneEraseType.O3I:
			case StoneEraseType.O3L:
				return SkillType.O3;
			case StoneEraseType.O4:
			case StoneEraseType.O4A:
			case StoneEraseType.O4I:
			case StoneEraseType.O4L:
				return SkillType.O4;
			case StoneEraseType.O6:
				return SkillType.O6;
		}
	}

	public static getStoneEraseShape(stoneEraseType: StoneEraseType) {
		switch (stoneEraseType) {
			case StoneEraseType.O3I:
			case StoneEraseType.O4I:
				return StoneEraseShape.I;
			case StoneEraseType.O3L:
			case StoneEraseType.O4L:
				return StoneEraseShape.L;
			case StoneEraseType.O3A:
			case StoneEraseType.O4A:
				return StoneEraseShape.Any;
			case StoneEraseType.O4:
				return StoneEraseShape.Square;
		}
		return StoneEraseShape.None;
	}

	public static createByEraseType(skillSet: IHeroSkillSet, skillId: SkillId, stoneEraseType: StoneEraseType, tips = false) {
		const type = HeroSkill.getSkillType(stoneEraseType);
		const shape = HeroSkill.getStoneEraseShape(stoneEraseType);
		return new HeroSkill(skillSet, skillId, type, shape, tips);
	}

	name: string;
	info: string;

	triggerLimit = '';
	counterAttackLimit = false;
	unlockRank?: HeroRank;

	constructor(
		public skillSet: IHeroSkillSet,
		public skillId: SkillId,
		public type: SkillType,
		public shape: StoneEraseShape = StoneEraseShape.None,
		public tips: boolean = false,
	) {
		this.name = localizationString("MetagameSkillInfo")(`${skillSet.model}_${skillId}_name`);
		this.info = localizationString("MetagameSkillInfo")(`${skillSet.model}_${skillId}_skillinfo`);

		const triggerMatch = this.info.match(/(^|\n+)\s*【觸發限制】：([^$\n]*)($|\n)/);
		if (triggerMatch) {
			this.triggerLimit = triggerMatch[2];
		}
		const counterattackMatch = this.info.match(/(^|\n+)\s*【反擊限制】：([^$\n]*)($|\n)/);
		if (counterattackMatch) {
			this.counterAttackLimit = true;
		}

		if (skillId == SkillId.P1) {
			const p1match = this.info.match(/(.階)共鳴時解鎖/);
			if (p1match) {
				this.info = '';
				this.unlockRank = p1match[1] as HeroRank;
			}
		}
	}

	getSkillInfo() {
		return skillinfo(this.info, this.skillId);
	}

	getWikiTemplateParams(sample = false) {
		if (sample) {
			return {
				[`${this.type}技能`]: this.name || '{{?}}',
				[`${this.type}類型`]: this.shape,
			};
		}

		const params: Record<string, any> = {
			[`${this.type}技能`]: this.name || '{{?}}',
			[`${this.type}類型`]: this.shape,
			[`${this.type}說明`]: this.getSkillInfo() || ' ',
			[`${this.type}提示`]: !!(this.skillSet.skillLv && this.tips),
			[`${this.type}觸發限制`]: this.triggerLimit,
			[`${this.type}反擊限制`]: this.counterAttackLimit,
		};
		if (this.unlockRank) {
			params.解鎖被動階級 = this.unlockRank;
		}
		return params;
	}
}
