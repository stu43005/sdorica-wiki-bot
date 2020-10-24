import { BaseScriptableObject } from "../lib/FullInspector/BaseScriptableObject";
import { ActorCharacterName } from "./ActorCharacterName";
import { ActorObjectName } from "./ActorObjectName";

export interface LevelActorAsset extends BaseScriptableObject {
	ActorCharacterTable: Record<string, ActorCharacterName>;
	ActorObjectTable: Record<string, ActorObjectName>;
}
