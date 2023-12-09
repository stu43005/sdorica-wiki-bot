import { IGroupedBuffId } from "../buff/buffid/IGroupedBuffId.js";
import { BaseSkillEffect } from "./BaseSkillEffect.js";

export interface RemoveBuffFromGroupedBuffIdSkillEffect extends BaseSkillEffect {
	BuffGroupIds: IGroupedBuffId;
	RemoveAllBuff: boolean;
	RandomRemoveCount: number;
}
