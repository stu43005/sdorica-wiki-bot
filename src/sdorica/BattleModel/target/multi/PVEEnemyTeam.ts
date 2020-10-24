import { IGroupedCharacter } from "../IGroupedCharacter";

export interface PVEEnemyTeam extends IGroupedCharacter {
	includeDead: boolean;
	includeEmpty: boolean;
}
