import { IGroupedBuffId } from "../buff/buffid/IGroupedBuffId.js";
import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface AddBuffFromGroupedBuffIdSkillEffect extends BaseSkillEffect {
	BuffGroupIds: IGroupedBuffId;
	AddAllBuff: boolean;
	RandomAddCount: number;
	NotRepeatSameBuffId: boolean;
	Forever: boolean;
	OverwriteDuration: number;
	LevelStack: number;
}
