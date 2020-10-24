import { IGroupedBuffId } from "../buff/buffid/IGroupedBuffId";
import { BaseSkillEffect } from "./BaseSkillEffect";

export interface RemoveBuffFromGroupedBuffIdSkillEffect extends BaseSkillEffect {
	BuffGroupIds: IGroupedBuffId;
	RemoveAllBuff: boolean;
	RandomRemoveCount: number;
}
