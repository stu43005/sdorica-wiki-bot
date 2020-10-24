import { BaseScriptableObject } from "../lib/FullInspector/BaseScriptableObject";
import { EnemyCharacterData } from "./EnemyCharacterData";

export interface EnemySetAsset extends BaseScriptableObject {
	enemyList: EnemyCharacterData[];
}
