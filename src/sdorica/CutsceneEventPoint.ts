import { ActorState } from "./ActorState.js";
import { CutsceneName } from "./CutsceneName.js";
import { LevelEvent } from "./LevelEvent.js";

export interface CutsceneEventPoint extends LevelEvent {
	SequenceKey: CutsceneName;
	actorState: ActorState[];
}
