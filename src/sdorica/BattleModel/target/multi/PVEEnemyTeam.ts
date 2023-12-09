import { IGroupedCharacter } from "../IGroupedCharacter.js";

export interface PVEEnemyTeam extends IGroupedCharacter {
	includeDead: boolean;
	includeEmpty: boolean;
}
