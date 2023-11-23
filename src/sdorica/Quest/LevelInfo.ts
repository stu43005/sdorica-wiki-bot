import { InterpretedObjectBase } from "../../viewerjs/leveldata-tarns-event";
import { LevelEventModel } from "../LevelEventModel";

export interface LevelInfo {
	name: string;

	/* json */
	actor: string;
	event: string;
	waves: Record<string, string>;
	enemySet: Record<string, string>;

	/* data */
	actorData?: any /*LevelActorModel*/;
	eventData?: LevelEventModel;
	battleWavesData?: Record<string, any /*BattleWave*/>;
	enemySetData?: Record<string, any /*EnemySetModel*/>;

	$interpreted?: InterpretedObjectBase[];
}
