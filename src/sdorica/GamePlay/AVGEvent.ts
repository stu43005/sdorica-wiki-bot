import { LevelEvent } from "../LevelEvent.js";
import { AVGOption } from "./AVGOption.js";

export interface AVGEvent extends LevelEvent {
	_avgOption: AVGOption;
}
