import { ActorState } from "./ActorState";
import { CutsceneName } from "./CutsceneName";
import { LevelEvent } from "./LevelEvent";

export interface CutsceneEventPoint extends LevelEvent {
	SequenceKey: CutsceneName;
	actorState: ActorState[];
}
