import { BattleCharacterName } from "./BattleCharacterName";

export interface EnemyCharacterData {
	character: BattleCharacterName;
	disappearAfterDefeat: boolean;
	_initialCdBase: number;
	_level: number;
	xOffset: number;
	zOffset: number;
	_initHpRatio: number;
	_initArmorRatio: number;
}
