import { localizationCharacterNameWithDefault, localizationString } from "../localization";
import { ItemPayType } from "../model/enums/item-pay-type.enum";
import { ItemPayRef } from "../model/item-pay-ref";
import { BattleEventPoint } from "../sdorica/BattleEventPoint";
import { conditionStringify } from "../sdorica/BattleModel/condition/ConditionStringify";
import { AVGEvent } from "../sdorica/GamePlay/AVGEvent";
import { EncounterEvent } from "../sdorica/GamePlay/EncounterEvent";
import { LevelEvent } from "../sdorica/LevelEvent";
import { LevelEventModel } from "../sdorica/LevelEventModel";
import { SceneSwitchEventPoint } from "../sdorica/SceneSwitchEventPoint";

function OpTrans(opstr: string) {
	switch (opstr) {
		case "Equal":
			return "==";
		case "NotEqual":
			return "!=";
		case "LessThan":
			return "<";
		case "GreaterThan":
			return ">";
		case "GreaterThanOrEqual":
			return ">=";
		case "LessThanOrEqual":
			return "<=";
	}
}

const eventFunction: Record<
	string,
	((event: LevelEvent, index: number) => InterpretedObjectBase) | boolean
> = {
	LevelBeginEventPoint: false,
	LevelEndEventPoint: false,
	BattleEventPoint: function (event: LevelEvent, index: number): InterpretedObjectBase {
		const battleEventPoint = event as BattleEventPoint;
		const out: InterpretedBattleEventPointObject = {
			類型: "戰鬥",
			BattleGroup: battleEventPoint._GroupName.Name,
		};
		if (battleEventPoint.endCondition) {
			out.結束條件 = conditionStringify(battleEventPoint.endCondition);
		}
		if (battleEventPoint._failCondition) {
			out.失敗條件 = conditionStringify(battleEventPoint._failCondition);
		}
		return out;
	},
	SceneSwitchEventPoint: function (event: LevelEvent, index: number): InterpretedObjectBase {
		const encounterEvent = event as SceneSwitchEventPoint;
		const out: InterpretedSceneSwitchEventPointObject = {
			類型: "關卡切換",
			SceneName: encounterEvent.SceneName,
			LevelName: String(encounterEvent.LevelName).replace(/\//g, "_"),
			DropItemGroupId: encounterEvent.DropItemGroupId,
		};
		return out;
	},
	"GamePlay.EncounterEvent": function (event: LevelEvent, index: number): InterpretedObjectBase {
		const encounterEvent = event as EncounterEvent;
		const out: InterpretedEncounterEventObject = {
			類型: "遭遇事件",
			optionSet: [],
		};
		for (const optionSetId in encounterEvent._encounterGroup._optionSets) {
			if (encounterEvent._encounterGroup._optionSets.hasOwnProperty(optionSetId)) {
				const optionSet = encounterEvent._encounterGroup._optionSets[optionSetId];
				if (typeof optionSet == "object" && optionSet._encounterOptionList) {
					const objectId = optionSet._encounterObjectId;
					const optionSetOut: InterpretedOptionSet = {
						groupId: optionSet._groupId,
						物件: localizationCharacterNameWithDefault()(objectId),
						標題: localizationString("EncounterEvent")(optionSet._titleLocalizationKey),
						點擊型: !optionSet._mustTrigger,
						選項: [],
					};
					for (let k = 0; k < optionSet._encounterOptionList.length; k++) {
						const option = optionSet._encounterOptionList[k];
						const optionOut: InterpretedOption = {
							圖示: option._optionIconKey,
							選項: localizationString("EncounterEvent")(
								option._optionLocalizationKey
							),
							效果: [],
						};
						if (option._conditionId) {
							if (option._conditionId == "cheat") {
								// 跳過作弊
								continue;
							}
							optionOut["條件Id"] = option._conditionId;
						}
						if (option._weight != 10000) {
							optionOut["比重"] = option._weight;
						}
						for (let l = 0; l < option._optionEffectList.length; l++) {
							const effect = option._optionEffectList[l];
							switch (effect.Category) {
								case "getExpItem":
								case "loseExpItem":
								case "getItem":
								case "loseItem": {
									const isLose = effect.Category.startsWith("lose");
									const isExplore = effect.Category.includes("Exp");
									const items = effect.EffectValue.split("&");
									for (let m = 0; m < items.length; m++) {
										const values = items[m].split(";");
										const itemId = values[0];
										const itemCount = Number(values[1]);
										const item = new ItemPayRef(
											isExplore ? ItemPayType.ExploreItem : ItemPayType.Item,
											itemId,
											itemCount
										);
										optionOut["效果"].push(
											`${isLose ? "lose" : "get"} ${item.toWiki()}`
										);
									}
									break;
								}
								case "flagOperation": {
									const items = effect.EffectValue.split("&");
									for (let m = 0; m < items.length; m++) {
										const value = items[m];
										optionOut["效果"].push(`${effect.Category}(${value})`);
									}
									break;
								}
								case "sceneSwitch": {
									const ss = effect.EffectValue.split(";");
									ss[0] = `[SceneName]${ss[0]}`;
									ss[1] = `[LevelName]${ss[1]}`;
									ss[2] = `[DropItemGroupId]${ss[2]}`;
									optionOut["效果"].push(`${effect.Category}(${ss.join(";")})`);
									break;
								}
								default:
									if (effect.Category.match(/^\d+;\d+$/)) {
										/* loseExpItem */
										const values = effect.Category.split(";");
										const itemId = values[0];
										const itemCount = Number(values[1]);
										const item = new ItemPayRef(
											ItemPayType.ExploreItem,
											itemId,
											itemCount
										);
										optionOut["效果"].push(`lose ${item.toWiki()}`);
									} else {
										optionOut["效果"].push(
											`${effect.Category}(${effect.EffectValue})`
										);
										// console.log(`Unknown effect: ${effect.Category}`);
									}
									break;
							}
						}
						optionSetOut["選項"].push(optionOut);
					}
					out.optionSet.push(optionSetOut);
				}
			}
		}
		if (out.optionSet.length > 1) {
			out.多個optionSet = true;
		}
		return out;
	},
	"GamePlay.AVGEvent": function (event: LevelEvent, index: number): InterpretedObjectBase {
		const AVGEvent = event as AVGEvent;
		const objectId = AVGEvent._avgOption._encounterObjectId;
		const out: InterpretedAVGEventObject = {
			類型: "AVGEvent",
			avgGroupId: AVGEvent._avgOption._avgGroupId,
			物件: localizationCharacterNameWithDefault()(objectId),
		};
		return out;
	},
};

export function tarnsEvent(obj: LevelEventModel) {
	if (!obj || !obj.eventPoints) return;
	const out: InterpretedObjectBase[] = [];
	for (let i = 0; i < obj.eventPoints.length; i++) {
		const eventPoint = obj.eventPoints[i];
		for (let j = 0; j < eventPoint.events.length; j++) {
			const event = eventPoint.events[j];
			if (event.$type in eventFunction) {
				const func = eventFunction[event.$type];
				if (typeof func == "function") {
					out.push(func(event, eventPoint.RoadPointIndex));
				}
			} else {
				const unknown: UnknownEventPointObject = {
					類型: event.$type,
					event: event,
				};
				out.push(unknown);
				console.error(`Unknown event type: ${event.$type}`);
				debugger;
			}
		}
	}
	return out;
}

export interface InterpretedObjectBase {
	類型: string;
}

export interface UnknownEventPointObject extends InterpretedObjectBase {
	event: LevelEvent;
}

export interface InterpretedSceneSwitchEventPointObject extends InterpretedObjectBase {
	SceneName: string;
	LevelName: string;
	DropItemGroupId: string | null;
}

export interface InterpretedBattleEventPointObject extends InterpretedObjectBase {
	BattleGroup: string;
	結束條件?: string;
	失敗條件?: string;
}

export interface InterpretedAVGEventObject extends InterpretedObjectBase {
	avgGroupId: string;
	物件: string;
}

export interface InterpretedEncounterEventObject extends InterpretedObjectBase {
	optionSet: InterpretedOptionSet[];
	多個optionSet?: boolean;
}

export interface InterpretedOptionSet {
	groupId: string;
	物件: string;
	標題: string;
	點擊型?: boolean;
	選項: InterpretedOption[];
}

export interface InterpretedOption {
	圖示: string;
	選項: string;
	效果: string[];
	條件Id?: string;
	條件?: string;
	比重?: number;
}
