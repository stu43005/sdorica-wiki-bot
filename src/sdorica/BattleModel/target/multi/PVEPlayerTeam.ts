import { IGroupedCharacter } from "../IGroupedCharacter";

export interface PVEPlayerTeam extends IGroupedCharacter {
	includeDead: boolean;
	includeEmpty: boolean;
}
