import { BaseScriptableObject } from "../lib/FullInspector/BaseScriptableObject.js";
import { EnemyCharacterData } from "./EnemyCharacterData.js";

export interface EnemySetAsset extends BaseScriptableObject {
	enemyList: EnemyCharacterData[];
}
