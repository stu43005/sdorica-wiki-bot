import { LevelEvent } from "./LevelEvent";
import { RoadDistance } from "./RoadDistance";

export interface TransportEvent extends LevelEvent {
	destination: RoadDistance;
}
