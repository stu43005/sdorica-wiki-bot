import { IGroupedCharacter } from "../IGroupedCharacter.js";

export interface PVEPlayerTeam extends IGroupedCharacter {
	includeDead: boolean;
	includeEmpty: boolean;
}
