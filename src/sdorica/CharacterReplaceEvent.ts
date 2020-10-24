import { LevelEvent } from "./LevelEvent";
import { BattleHeroMask } from "./Quest/BattleHeroMask";

export interface CharacterReplaceEvent extends LevelEvent {
	GoldMask: BattleHeroMask;
	BlackMask: BattleHeroMask;
	WhiteMask: BattleHeroMask;
	Assistant1Mask: BattleHeroMask;
	Assistant2Mask: BattleHeroMask;
}
