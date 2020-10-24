import { IGroupedBuffId } from "../buff/buffid/IGroupedBuffId";
import { BaseSkillEffect } from "./BaseSkillEffect";

export interface AddBuffFromGroupedBuffIdSkillEffect extends BaseSkillEffect {
	BuffGroupIds: IGroupedBuffId;
	AddAllBuff: boolean;
	RandomAddCount: number;
	NotRepeatSameBuffId: boolean;
	Forever: boolean;
	OverwriteDuration: number;
	LevelStack: number;
}
