import { LevelInfo } from "../Quest/LevelInfo";
import { QuestEntity } from "../QuestEntity";

export interface EnterExploreResult {
	quest: QuestEntity;
	questId: string;
	battleRecordId: string;
	battleTeam: any/*BattleTeamArg*/;
	levelInfo: LevelInfo;
	dropItemChests: any/*DropItemChest*/[];
	guildAssistant: any/*GuildAssistantsData*/;
	encounterEvents: Record<string, any/*QuestEncounterEvent*/>;
	flags: any/*FlagPack*/;
	items: any/*ItemPack*/;
	expItems: any/*ItemPack*/;
}
