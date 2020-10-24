import { BoardModificationStoneAction } from "./BoardModificationStoneAction";
import { Constraint } from "./Constraint";

export interface PreselectStoneAction extends BoardModificationStoneAction {
	targetStoneCount: number;
	filter: Constraint;
	changeTo: BoardModificationStoneAction.ChangeType;
}
