import { BaseScriptableObject } from "../lib/FullInspector/BaseScriptableObject.js";
import { InterpretedBattleCharacter } from "../viewerjs/interpreted-battle-character.js";
import { BattleCharacter } from "./BattleModel/BattleCharacter.js";

export interface BattleCharacterAsset extends BaseScriptableObject {
	character: BattleCharacter;
	prefab?: /* GameObject */ any;
	ReferenceCharacterKeysForBattle?: string[];
	ReferenceEffectKeysForBattle?: string[];
	ReferenceBuffKeysForBattle?: string[];
	ReferenceSFXKeysForBattle?: string[];
	ReferenceVoiceSFXKeysForBattle?: string[];
	ReferenceCharacterKeysForAssist?: string[];
	ReferenceEffectKeysForAssist?: string[];
	ReferenceBuffKeysForAssist?: string[];
	ReferenceSFXKeysForAssist?: string[];
	ReferenceVoiceSFXKeysForAssist?: string[];

	$interpreted?: InterpretedBattleCharacter;
}
