import { localizationBuffName } from "../../../localization";
import { buffLabelStringify, singleBuffStringify } from "../buff/BuffStringify";
import { BuffTag } from "../BuffTag";
import { constantBuffStringify, constantCharStringify, constantStringify } from "../constant/ConstantStringify";
import { SkillProperty } from "../SkillProperty";
import { StoneEraseType } from "../StoneSystem/StoneEraseType";
import { StoneType } from "../StoneSystem/StoneType";
import { mulitTargetStringify, singleTargetStringify } from "../target/TargetStringify";
import { AndConditions } from "./AndConditions";
import { AndConditionsB } from "./buff/AndConditionsB";
import { CheckBuffBelongLabel } from "./buff/CheckBuffBelongLabel";
import { CheckBuffHasTag } from "./buff/CheckBuffHasTag";
import { CheckBuffMatchBuffId } from "./buff/CheckBuffMatchBuffId";
import { IntCompareB } from "./buff/IntCompareB";
import { InverseB } from "./buff/InverseB";
import { OrConditionsB } from "./buff/OrConditionsB";
import { BuffCondition } from "./BuffCondition";
import { BuffEqual } from "./BuffEqual";
import { AndConditionsC } from "./character/AndConditionsC";
import { AssetIdHasSubString } from "./character/AssetIdHasSubString";
import { HasAnyConditionalBuff } from "./character/HasAnyConditionalBuff";
import { HasBuff } from "./character/HasBuff";
import { HasConditionalBuff } from "./character/HasConditionalBuff";
import { IntCompareC } from "./character/IntCompareC";
import { InverseC } from "./character/InverseC";
import { IsCharacterDead } from "./character/IsCharacterDead";
import { OrConditionsC } from "./character/OrConditionsC";
import { StoneTypeIs } from "./character/StoneTypeIs";
import { CharacterCondition } from "./CharacterCondition";
import { CharacterEqual } from "./CharacterEqual";
import { CharacterHasBuff } from "./CharacterHasBuff";
import { CharacterInside } from "./CharacterInside";
import { CharGroupCondition } from "./CharGroupCondition";
import { ConsumedStoneEraseTypeEqual } from "./ConsumedStoneEraseTypeEqual";
import { ConsumedStoneTypeEqual } from "./ConsumedStoneTypeEqual";
import { CurrentTurnBelongsTo } from "./CurrentTurnBelongsTo";
import { IConditionOfBuff } from "./IConditionOfBuff";
import { IConditionOfCharacter } from "./IConditionOfCharacter";
import { IConditionOfModel } from "./IConditionOfModel";
import { IntCompare } from "./IntCompare";
import { Inverse } from "./Inverse";
import { NumericCompareOperator } from "./NumericCompareOperator";
import { OrConditions } from "./OrConditions";
import { RandomCondition } from "./RandomCondition";
import { ThisSkillEffectTagContains } from "./ThisSkillEffectTagContains";
import { ThisSkillSetIdEqual } from "./ThisSkillSetIdEqual";

function supportedInverse(condition: IConditionOfModel) {
	switch (condition.$type) {
		case "BattleModel.CharacterHasBuff":
		case "BattleModel.IntCompare":
		case "BattleModel.ThisSkillEffectTagContains":
		case "BattleModel.CharacterEqual":
		case "BattleModel.CharacterInside":
		case "BattleModel.CharacterCondition":
		case "BattleModel.CharGroupCondition":
		case "BattleModel.BuffEqual":
		case "BattleModel.BuffCondition":
		case "BattleModel.ThisSkillSetIdEqual":
		case "BattleModel.RandomCondition":
		case "BattleModel.AlwaysTrue":
			return true;
	}
	return false;
}

export function conditionStringify(condition: IConditionOfModel, isInverse = false): string {
	if (!condition) return "";
	if (condition.$type == "BattleModel.Inverse") {
		const obj = condition as Inverse;
		if (supportedInverse(obj.condition)) {
			return `${conditionStringify(obj.condition, true)}`;
		}
		return `相反(${conditionStringify(obj.condition)})`;
	}
	if (condition.$type == "BattleModel.AlwaysTrue") {
		return `永遠為${isInverse ? "假" : "真"}`;
	}
	if (condition.$type == "BattleModel.IntCompare") {
		const obj = condition as IntCompare;
		const op = isInverse ? NumericCompareOperator.inverse(obj.op) : obj.op;
		return `${constantStringify(obj.left)} ${NumericCompareOperator.toString(op)} ${constantStringify(obj.right)}`;
	}
	if (condition.$type == "BattleModel.AndConditions") {
		const obj = condition as AndConditions;
		return `(${conditionStringify(obj.cond1)}) 且 (${conditionStringify(obj.cond2)})`;
	}
	if (condition.$type == "BattleModel.OrConditions") {
		const obj = condition as OrConditions;
		return `(${conditionStringify(obj.cond1)}) 或 (${conditionStringify(obj.cond2)})`;
	}
	if (condition.$type == "BattleModel.CharacterHasBuff") {
		const obj = condition as CharacterHasBuff;
		return `${singleTargetStringify(obj.character)}${isInverse ? "沒有" : "擁有"}${localizationBuffName(true)(obj.buffId)}狀態`;
	}
	if (condition.$type == "BattleModel.CurrentTurnBelongsTo") {
		const obj = condition as CurrentTurnBelongsTo;
		return `目前回合輪到${singleTargetStringify(obj.character)}`;
	}
	if (condition.$type == "BattleModel.ThisSkillEffectTagContains") {
		const obj = condition as ThisSkillEffectTagContains;
		return `施展的技能效果中${isInverse ? "不" : ""}包含(${SkillProperty.toString(obj.containsAll)})屬性`;
	}
	if (condition.$type == "BattleModel.CharacterEqual") {
		const obj = condition as CharacterEqual;
		return `${singleTargetStringify(obj.left)}${isInverse ? "不" : ""}是${singleTargetStringify(obj.right)}`;
	}
	if (condition.$type == "BattleModel.CharacterInside") {
		const obj = condition as CharacterInside;
		return `${singleTargetStringify(obj.left)}${isInverse ? "不" : ""}是${mulitTargetStringify(obj.group)}的一員`;
	}
	if (condition.$type == "BattleModel.CharacterCondition") {
		const obj = condition as CharacterCondition;
		if (supportedInverseChar(obj.condition)) {
			return `${singleTargetStringify(obj.character)} ${conditionCharStringify(obj.condition, isInverse)}`;
		}
		if (isInverse) {
			return `${singleTargetStringify(obj.character)} 相反(${conditionCharStringify(obj.condition)})`;
		}
		return `${singleTargetStringify(obj.character)} ${conditionCharStringify(obj.condition)}`;
	}
	if (condition.$type == "BattleModel.CharGroupCondition") {
		const obj = condition as CharGroupCondition;
		if (supportedInverseChar(obj.condition)) {
			return `${mulitTargetStringify(obj.group)}中的${obj.everybody ? "所有角色皆" : "任意角色"} ${conditionCharStringify(obj.condition, isInverse)}`;
		}
		if (isInverse) {
			return `${mulitTargetStringify(obj.group)}中的${obj.everybody ? "所有角色皆" : "任意角色"} 相反(${conditionCharStringify(obj.condition)})`;
		}
		return `${mulitTargetStringify(obj.group)}中的${obj.everybody ? "所有角色皆" : "任意角色"} ${conditionCharStringify(obj.condition)}`;
	}
	if (condition.$type == "BattleModel.BuffEqual") {
		const obj = condition as BuffEqual;
		return `${singleBuffStringify(obj.left)}${isInverse ? "不" : ""}是${singleBuffStringify(obj.right)}`;
	}
	if (condition.$type == "BattleModel.BuffCondition") {
		const obj = condition as BuffCondition;
		if (supportedInverseBuff(obj.condition)) {
			return `${singleBuffStringify(obj.buff)} ${conditionBuffStringify(obj.condition, isInverse)}`;
		}
		if (isInverse) {
			return `${singleBuffStringify(obj.buff)} 相反(${conditionBuffStringify(obj.condition)})`;
		}
		return `${singleBuffStringify(obj.buff)} ${conditionBuffStringify(obj.condition)}`;
	}
	if (condition.$type == "BattleModel.ThisSkillSetIdEqual") {
		const obj = condition as ThisSkillSetIdEqual;
		return `施展的技能組${isInverse ? "不" : ""}是${obj.id}`;
	}
	if (condition.$type == "BattleModel.RandomCondition") {
		const obj = condition as RandomCondition;
		if (obj.randBase == 0) {
			console.error(`BattleModel.RandomCondition Error: randBase == 0`);
			debugger;
			return JSON.stringify(condition);
		}
		const pa = Math.floor(obj.lessThan / obj.randBase * 10000) / 100;
		return `${isInverse ? 100 - pa : pa}%機率`;
	}
	if (condition.$type == "BattleModel.ConsumedStoneEraseTypeEqual") {
		const obj = condition as ConsumedStoneEraseTypeEqual;
		return `消耗${StoneEraseType.toString(obj.EraseType)}魂芯`;
	}
	if (condition.$type == "BattleModel.ConsumedStoneTypeEqual") {
		const obj = condition as ConsumedStoneTypeEqual;
		return `消耗${StoneType.toString(obj.Type)}魂芯`;
	}
	console.error(`Unknown IConditionOfModel type: ${condition.$type}`);
	return JSON.stringify(condition);
}

function supportedInverseChar(condition: IConditionOfCharacter) {
	switch (condition.$type) {
		case "BattleModel.IntCompareC":
		case "BattleModel.StoneTypeIs":
		case "BattleModel.AssetIdHasSubString":
		case "BattleModel.HasAnyConditionalBuff":
		case "BattleModel.HasConditionalBuff":
		case "BattleModel.HasBuff":
		case "BattleModel.IsCharacterDead":
			return true;
	}
	return false;
}

export function conditionCharStringify(condition: IConditionOfCharacter, isInverse = false): string {
	if (!condition) return "";
	if (condition.$type == "BattleModel.InverseC") {
		const obj = condition as InverseC;
		if (supportedInverseChar(obj.condition)) {
			return `${conditionCharStringify(obj.condition, true)}`;
		}
		return `相反(${conditionCharStringify(obj.condition)})`;
	}
	if (condition.$type == "BattleModel.IntCompareC") {
		const obj = condition as IntCompareC;
		return `${isInverse ? "不" : ""}符合條件 ${constantCharStringify(obj.left)} ${NumericCompareOperator.toString(obj.op)} ${constantCharStringify(obj.right)}`;
	}
	if (condition.$type == "BattleModel.AndConditionsC") {
		const obj = condition as AndConditionsC;
		return `(${conditionCharStringify(obj.cond1)}) 且 (${conditionCharStringify(obj.cond2)})`;
	}
	if (condition.$type == "BattleModel.OrConditionsC") {
		const obj = condition as OrConditionsC;
		return `(${conditionCharStringify(obj.cond1)}) 或 (${conditionCharStringify(obj.cond2)})`;
	}
	if (condition.$type == "BattleModel.StoneTypeIs") {
		const obj = condition as StoneTypeIs;
		return `${isInverse ? "不" : ""}是${StoneType.toString(obj.type)}`;
	}
	if (condition.$type == "BattleModel.AssetIdHasSubString") {
		const obj = condition as AssetIdHasSubString;
		return `的AssetId${isInverse ? "不" : ""}包含＂${obj.subString}＂字串`;
	}
	if (condition.$type == "BattleModel.HasAnyConditionalBuff") {
		const obj = condition as HasAnyConditionalBuff;
		return `${isInverse ? "沒" : "擁"}有任何一個 ${conditionBuffStringify(obj.buffCondition)} 的狀態`;
	}
	if (condition.$type == "BattleModel.HasConditionalBuff") {
		const obj = condition as HasConditionalBuff;
		return `狀態${localizationBuffName(true)(obj.buffId)} ${conditionBuffStringify(obj.buffCondition, isInverse)}`;
	}
	if (condition.$type == "BattleModel.HasBuff") {
		const obj = condition as HasBuff;
		return `${isInverse ? "沒" : "擁"}有${localizationBuffName(true)(obj.buffId)}狀態`;
	}
	if (condition.$type == "BattleModel.IsCharacterDead") {
		const obj = condition as IsCharacterDead;
		return `${isInverse ? "沒有" : "已經"}死亡`;
	}
	console.error(`Unknown IConditionOfCharacter type: ${condition.$type}`);
	return JSON.stringify(condition);
}

function supportedInverseBuff(condition: IConditionOfBuff) {
	switch (condition.$type) {
		case "BattleModel.IntCompareB":
		case "BattleModel.CheckBuffHasTag":
		case "BattleModel.CheckBuffMatchBuffId":
			return true;
	}
	return false;
}

export function conditionBuffStringify(condition: IConditionOfBuff, isInverse = false): string {
	if (!condition) return "";
	if (condition.$type == "BattleModel.InverseB") {
		const obj = condition as InverseB;
		if (supportedInverseBuff(obj.condition)) {
			return `${conditionBuffStringify(obj.condition, true)}`;
		}
		return `相反(${conditionBuffStringify(obj.condition)})`;
	}
	if (condition.$type == "BattleModel.IntCompareB") {
		const obj = condition as IntCompareB;
		return `${isInverse ? "不" : ""}符合條件 ${constantBuffStringify(obj.left)} ${NumericCompareOperator.toString(obj.op)} ${constantBuffStringify(obj.right)}`;
	}
	if (condition.$type == "BattleModel.AndConditionsB") {
		const obj = condition as AndConditionsB;
		return `(${conditionBuffStringify(obj.cond1)}) 且 (${conditionBuffStringify(obj.cond2)})`;
	}
	if (condition.$type == "BattleModel.OrConditionsB") {
		const obj = condition as OrConditionsB;
		return `(${conditionBuffStringify(obj.cond1)}) 或 (${conditionBuffStringify(obj.cond2)})`;
	}
	if (condition.$type == "BattleModel.CheckBuffHasTag") {
		const obj = condition as CheckBuffHasTag;
		return `${isInverse ? "沒" : ""}有(${BuffTag.toString(obj.tag)})標籤`;
	}
	if (condition.$type == "BattleModel.CheckBuffMatchBuffId") {
		const obj = condition as CheckBuffMatchBuffId;
		return `${isInverse ? "不" : ""}是＂${localizationBuffName(true)(obj.subString)}＂`;
	}
	if (condition.$type == "BattleModel.CheckBuffBelongLabel") {
		const obj = condition as CheckBuffBelongLabel;
		return `${isInverse ? "沒" : ""}有在${buffLabelStringify(obj.BuffLabel)}列表內`;
	}
	console.error(`Unknown IConditionOfBuff type: ${condition.$type}`);
	return JSON.stringify(condition);
}
