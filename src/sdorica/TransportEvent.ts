import { LevelEvent } from "./LevelEvent.js";
import { RoadDistance } from "./RoadDistance.js";

export interface TransportEvent extends LevelEvent {
	destination: RoadDistance;
}
