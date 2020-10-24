export interface BattleCharacterName {
	name: string;
	type: BattleCharacterName.Type;
}

export namespace BattleCharacterName {
	export enum Type {
		Asset,
		Actor,
		Summon,
	}
}
