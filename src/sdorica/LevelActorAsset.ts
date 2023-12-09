import { BaseScriptableObject } from "../lib/FullInspector/BaseScriptableObject.js";
import { ActorCharacterName } from "./ActorCharacterName.js";
import { ActorObjectName } from "./ActorObjectName.js";

export interface LevelActorAsset extends BaseScriptableObject {
	ActorCharacterTable: Record<string, ActorCharacterName>;
	ActorObjectTable: Record<string, ActorObjectName>;
}
