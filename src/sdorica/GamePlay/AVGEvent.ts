import { LevelEvent } from "../LevelEvent";
import { AVGOption } from "./AVGOption";

export interface AVGEvent extends LevelEvent {
	_avgOption: AVGOption;
}
