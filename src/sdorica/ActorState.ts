import { Vector3 } from "../lib/Unity/Vector3";
import { LevelActorName } from "./LevelActorName";

export interface ActorState {
	actorName: LevelActorName;
	setPosition: boolean;
	pos: Vector3;
	scale: Vector3;
	isVisible: boolean;
	rotate: ActorState.Rotate;
}

export namespace ActorState {
	export enum Rotate {
		Right = "Right",
		Left = "Left",
	}
}
