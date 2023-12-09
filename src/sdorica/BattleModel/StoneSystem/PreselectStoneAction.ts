import { BoardModificationStoneAction } from "./BoardModificationStoneAction.js";
import { Constraint } from "./Constraint.js";

export interface PreselectStoneAction extends BoardModificationStoneAction {
	targetStoneCount: number;
	filter: Constraint;
	changeTo: BoardModificationStoneAction.ChangeType;
}
