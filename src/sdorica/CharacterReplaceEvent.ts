import { LevelEvent } from "./LevelEvent.js";
import { BattleHeroMask } from "./Quest/BattleHeroMask.js";

export interface CharacterReplaceEvent extends LevelEvent {
	GoldMask: BattleHeroMask;
	BlackMask: BattleHeroMask;
	WhiteMask: BattleHeroMask;
	Assistant1Mask: BattleHeroMask;
	Assistant2Mask: BattleHeroMask;
}
