import { localizationItemName } from "../../../localization.js";
import { groupedBuffStringify, singleBuffStringify } from "../buff/BuffStringify.js";
import { BuffEnums } from "../BuffEnums.js";
import { conditionStringify } from "../condition/ConditionStringify.js";
import { StoneType } from "../StoneSystem/StoneType.js";
import { mulitTargetStringify, singleTargetStringify } from "../target/TargetStringify.js";
import { AssignedValue } from "./AssignedValue.js";
import { BattleActionRecordValue } from "./BattleActionRecordValue.js";
import { IBattleActionRecordValue } from "./BattleActionRecordValue/IBattleActionRecordValue.js";
import { ThisBattleTurnCount } from "./BattleActionRecordValue/ThisBattleTurnCount.js";
import { BuffAssignedInteger } from "./BuffAssignedInteger.js";
import { ConditionalInteger } from "./ConditionalInteger.js";
import { ConstanctInt } from "./ConstanctInt.js";
import { ConstantIntB } from "./ConstantIntB.js";
import { ConstantIntC } from "./ConstantIntC.js";
import { CountOfBuffGroup } from "./CountOfBuffGroup.js";
import { CountOfCharGroup } from "./CountOfCharGroup.js";
import { BuffAssignedIntegerGroup } from "./grouped/BuffAssignedIntegerGroup.js";
import { ConstanctIntegerGroup } from "./grouped/ConstanctIntegerGroup.js";
import { IGroupedInteger } from "./grouped/IGroupedInteger.js";
import { IntsOnBuffGroup } from "./grouped/IntsOnBuffGroup.js";
import { IntsOnCharGroup } from "./grouped/IntsOnCharGroup.js";
import { SingleIntegerGroup } from "./grouped/SingleIntegerGroup.js";
import { IntBuffField } from "./IntBuffField.js";
import { IntCharaterField } from "./IntCharaterField.js";
import { IntFieldB } from "./IntFieldB.js";
import { IntFieldC } from "./IntFieldC.js";
import { ISingleInteger } from "./ISingleInteger.js";
import { ISingleIntegerOfBuff } from "./ISingleIntegerOfBuff.js";
import { ISingleIntegerOfCharacter } from "./ISingleIntegerOfCharacter.js";
import { MaxOfInts } from "./MaxOfInts.js";
import { MinOfInts } from "./MinOfInts.js";
import { ModuleInt } from "./ModuleInt.js";
import { ModuleIntB } from "./ModuleIntB.js";
import { ModuleIntC } from "./ModuleIntC.js";
import { MultiplyFloat } from "./MultiplyFloat.js";
import { MultiplyFloatB } from "./MultiplyFloatB.js";
import { MultiplyFloatC } from "./MultiplyFloatC.js";
import { MultiplyInt } from "./MultiplyInt.js";
import { MultiplyIntB } from "./MultiplyIntB.js";
import { MultiplyIntC } from "./MultiplyIntC.js";
import { PlusInt } from "./PlusInt.js";
import { PlusIntB } from "./PlusIntB.js";
import { PlusIntC } from "./PlusIntC.js";
import { RandomInt } from "./RandomInt.js";
import { SkillCasterPower } from "./SkillCasterPower.js";
import { StonePanelColorCount } from "./StonePanelColorCount.js";
import { SumOfInts } from "./SumOfInts.js";
import { ThisBuffLevel } from "./ThisBuffLevel.js";
import { ThisTeamExploreDays } from "./ThisTeamExploreDays.js";
import { ThisTeamExploreFlagValue } from "./ThisTeamExploreFlagValue.js";
import { ThisTeamExploreItemCount } from "./ThisTeamExploreItemCount.js";
import { transitionResultValueStringify } from "./transitionResult/transitionResultStringify.js";
import { TransitionResultValue } from "./TransitionResultValue.js";

function isFloat(constant: ISingleInteger) {
	switch (constant.$type) {
		case "BattleModel.MultiplyFloat":
			return true;
	}
	return false;
}

export function constantStringify(constant: ISingleInteger): string {
	if (!constant) return "";
	if (constant.$type == "BattleModel.ConstanctInt") {
		const obj = constant as ConstanctInt;
		return obj.constant.toString();
	}
	if (constant.$type == "BattleModel.RandomInt") {
		const obj = constant as RandomInt;
		return `隨機0~${obj.randMax - 1}`;
	}
	if (constant.$type == "BattleModel.SkillCasterPower") {
		const obj = constant as SkillCasterPower;
		return `攻擊力`;
	}
	if (constant.$type == "BattleModel.ThisBuffLevel") {
		const obj = constant as ThisBuffLevel;
		return `本狀態的層數`;
	}
	if (constant.$type == "BattleModel.CountOfCharGroup") {
		const obj = constant as CountOfCharGroup;
		return `${mulitTargetStringify(obj.group)}的角色數量`;
	}
	if (constant.$type == "BattleModel.CountOfBuffGroup") {
		const obj = constant as CountOfBuffGroup;
		return `${groupedBuffStringify(obj.group)}的狀態數量`;
	}
	if (constant.$type == "BattleModel.IntCharaterField") {
		const obj = constant as IntCharaterField;
		return `${singleTargetStringify(obj.character)}的${BuffEnums.CharacterIntegerField.toString(
			obj.targetField,
		)}`;
	}
	if (constant.$type == "BattleModel.IntBuffField") {
		const obj = constant as IntBuffField;
		return `${singleBuffStringify(obj.buff)}的${BuffEnums.BuffIntergerField.toString(
			obj.targetField,
		)}`;
	}
	if (constant.$type == "BattleModel.PlusInt") {
		const obj = constant as PlusInt;
		let left = constantStringify(obj.left);
		if (isFloat(obj.left)) {
			left = `floor${left}`;
		}
		let right = constantStringify(obj.right);
		if (isFloat(obj.right)) {
			right = `floor${right}`;
		}
		return `(${left} + ${right})`;
	}
	if (constant.$type == "BattleModel.MultiplyInt") {
		const obj = constant as MultiplyInt;
		let left = constantStringify(obj.left);
		if (isFloat(obj.left)) {
			left = `floor${left}`;
		}
		let right = constantStringify(obj.right);
		if (isFloat(obj.right)) {
			right = `floor${right}`;
		}
		return `(${left} * ${right})`;
	}
	if (constant.$type == "BattleModel.ModuleInt") {
		const obj = constant as ModuleInt;
		let left = constantStringify(obj.left);
		if (isFloat(obj.left)) {
			left = `floor${left}`;
		}
		let right = constantStringify(obj.right);
		if (isFloat(obj.right)) {
			right = `floor${right}`;
		}
		return `(${left} mod ${right})`;
	}
	if (constant.$type == "BattleModel.MultiplyFloat") {
		const obj = constant as MultiplyFloat;
		return `(${constantStringify(obj.left)} * ${obj.ratio})`;
	}
	if (constant.$type == "BattleModel.AssignedValue") {
		const obj = constant as AssignedValue;
		if (!obj._value) {
			console.error(`Unknown AssignedValue value`);
			return JSON.stringify(obj);
		}
		return constantStringify(obj._value);
	}
	if (constant.$type == "BattleModel.BuffAssignedInteger") {
		const obj = constant as BuffAssignedInteger;
		if (!obj._value) {
			console.error(`Unknown BuffAssignedInteger value`);
			return JSON.stringify(obj);
		}
		return constantStringify(obj._value);
	}
	if (constant.$type == "BattleModel.TransitionResultValue") {
		const obj = constant as TransitionResultValue;
		return transitionResultValueStringify(obj.ResultValue);
	}
	if (constant.$type == "BattleModel.ThisTeamExploreDays") {
		const obj = constant as ThisTeamExploreDays;
		return `探索天數`;
	}
	if (constant.$type == "BattleModel.ThisTeamExploreItemCount") {
		const obj = constant as ThisTeamExploreItemCount;
		const itemname = localizationItemName(true)(obj.ExploreItemId);
		return `隊伍攜帶探索道具${obj.ExploreItemId}${itemname ? `(${itemname})` : ""}的數量`;
	}
	if (constant.$type == "BattleModel.ThisTeamExploreFlagValue") {
		const obj = constant as ThisTeamExploreFlagValue;
		return `探索Flag"${obj.ExploreFlagId}"的數值`;
	}
	if (constant.$type == "BattleModel.StonePanelColorCount") {
		const obj = constant as StonePanelColorCount;
		return `${StoneType.toString(obj.Type)}魂芯數量`;
	}
	if (constant.$type == "BattleModel.BattleActionRecordValue") {
		const obj = constant as BattleActionRecordValue;
		return battleActionRecordValueStringify(obj.RecordValue);
	}
	if (constant.$type == "BattleModel.MaxOfInts") {
		const obj = constant as MaxOfInts;
		return `(${groupedIntegerStringify(obj.group)})的最大值`;
	}
	if (constant.$type == "BattleModel.MinOfInts") {
		const obj = constant as MinOfInts;
		return `(${groupedIntegerStringify(obj.group)})的最小值`;
	}
	if (constant.$type == "BattleModel.SumOfInts") {
		const obj = constant as SumOfInts;
		return `(${groupedIntegerStringify(obj.group)})的總和`;
	}
	if (constant.$type == "BattleModel.ConditionalInteger") {
		const obj = constant as ConditionalInteger;
		return `[如果(${conditionStringify(obj.Condition)})條件為真(${constantStringify(
			obj.PassValue,
		)})，否則(${constantStringify(obj.NotPassValue)})]`;
	}
	console.error(`Unknown ISingleInteger type: ${constant.$type}`);
	return JSON.stringify(constant);
}

export function constantCharStringify(constant: ISingleIntegerOfCharacter): string {
	if (!constant) return "";
	if (constant.$type == "BattleModel.ConstanctInt") {
		const obj = constant as ConstanctInt;
		return obj.constant.toString();
	}
	if (constant.$type == "BattleModel.ConstantIntC") {
		const obj = constant as ConstantIntC;
		return obj.constant.toString();
	}
	if (constant.$type == "BattleModel.RandomInt") {
		const obj = constant as RandomInt;
		return `隨機0~${obj.randMax - 1}`;
	}
	if (constant.$type == "BattleModel.IntFieldC") {
		const obj = constant as IntFieldC;
		return BuffEnums.CharacterIntegerField.toString(obj.targetField);
	}
	if (constant.$type == "BattleModel.PlusIntC") {
		const obj = constant as PlusIntC;
		let left = constantCharStringify(obj.left);
		if (isFloat(obj.left)) {
			left = `floor${left}`;
		}
		let right = constantCharStringify(obj.right);
		if (isFloat(obj.right)) {
			right = `floor${right}`;
		}
		return `(${left} + ${right})`;
	}
	if (constant.$type == "BattleModel.MultiplyIntC") {
		const obj = constant as MultiplyIntC;
		let left = constantCharStringify(obj.left);
		if (isFloat(obj.left)) {
			left = `floor${left}`;
		}
		let right = constantCharStringify(obj.right);
		if (isFloat(obj.right)) {
			right = `floor${right}`;
		}
		return `(${left} * ${right})`;
	}
	if (constant.$type == "BattleModel.ModuleIntC") {
		const obj = constant as ModuleIntC;
		let left = constantCharStringify(obj.left);
		if (isFloat(obj.left)) {
			left = `floor${left}`;
		}
		let right = constantCharStringify(obj.right);
		if (isFloat(obj.right)) {
			right = `floor${right}`;
		}
		return `(${left} mod ${right})`;
	}
	if (constant.$type == "BattleModel.MultiplyFloatC") {
		const obj = constant as MultiplyFloatC;
		return `(${constantCharStringify(obj.left)} * ${obj.ratio})`;
	}
	console.error(`Unknown ISingleIntegerOfCharacter type: ${constant.$type}`);
	return JSON.stringify(constant);
}

export function constantBuffStringify(constant: ISingleIntegerOfBuff): string {
	if (!constant) return "";
	if (constant.$type == "BattleModel.ConstanctInt") {
		const obj = constant as ConstanctInt;
		return obj.constant.toString();
	}
	if (constant.$type == "BattleModel.ConstantIntB") {
		const obj = constant as ConstantIntB;
		return obj.constant.toString();
	}
	if (constant.$type == "BattleModel.RandomInt") {
		const obj = constant as RandomInt;
		return `隨機0~${obj.randMax - 1}`;
	}
	if (constant.$type == "BattleModel.IntFieldB") {
		const obj = constant as IntFieldB;
		return BuffEnums.BuffIntergerField.toString(obj.targetField);
	}
	if (constant.$type == "BattleModel.PlusIntB") {
		const obj = constant as PlusIntB;
		let left = constantBuffStringify(obj.left);
		if (isFloat(obj.left)) {
			left = `floor${left}`;
		}
		let right = constantBuffStringify(obj.right);
		if (isFloat(obj.right)) {
			right = `floor${right}`;
		}
		return `(${left} + ${right})`;
	}
	if (constant.$type == "BattleModel.MultiplyIntB") {
		const obj = constant as MultiplyIntB;
		let left = constantBuffStringify(obj.left);
		if (isFloat(obj.left)) {
			left = `floor${left}`;
		}
		let right = constantBuffStringify(obj.right);
		if (isFloat(obj.right)) {
			right = `floor${right}`;
		}
		return `(${left} * ${right})`;
	}
	if (constant.$type == "BattleModel.ModuleIntB") {
		const obj = constant as ModuleIntB;
		let left = constantBuffStringify(obj.left);
		if (isFloat(obj.left)) {
			left = `floor${left}`;
		}
		let right = constantBuffStringify(obj.right);
		if (isFloat(obj.right)) {
			right = `floor${right}`;
		}
		return `(${left} mod ${right})`;
	}
	if (constant.$type == "BattleModel.MultiplyFloatB") {
		const obj = constant as MultiplyFloatB;
		return `(${constantBuffStringify(obj.left)} * ${obj.ratio})`;
	}
	console.error(`Unknown ISingleIntegerOfBuff type: ${constant.$type}`);
	return JSON.stringify(constant);
}

export function battleActionRecordValueStringify(constant: IBattleActionRecordValue) {
	if (!constant) return "";
	if (constant.$type == "BattleModel.ThisBattleTurnCount") {
		const obj = constant as ThisBattleTurnCount;
		return `目前戰鬥回合數`;
	}
	console.error(`Unknown IBattleActionRecordValue type: ${constant.$type}`);
	return JSON.stringify(constant);
}

export function groupedIntegerStringify(constant: IGroupedInteger) {
	if (!constant) return "";
	if (constant.$type == "BattleModel.IntsOnBuffGroup") {
		const obj = constant as IntsOnBuffGroup;
		return `${groupedBuffStringify(obj.group)}中的${BuffEnums.BuffIntergerField.toString(
			obj.targetField,
		)}`;
	}
	if (constant.$type == "BattleModel.IntsOnCharGroup") {
		const obj = constant as IntsOnCharGroup;
		return `${mulitTargetStringify(obj.group)}中的${BuffEnums.CharacterIntegerField.toString(
			obj.targetField,
		)}`;
	}
	if (constant.$type == "BattleModel.BuffAssignedIntegerGroup") {
		const obj = constant as BuffAssignedIntegerGroup;
		if (!obj._value) {
			console.error(`Unknown BuffAssignedIntegerGroup value`);
			return JSON.stringify(obj);
		}
		return groupedIntegerStringify(obj._value);
	}
	if (constant.$type == "BattleModel.SingleIntegerGroup") {
		const obj = constant as SingleIntegerGroup;
		return obj.SingleIntegers.map(
			(singleInteger) => `(${constantStringify(singleInteger)})`,
		).join("、");
	}
	if (constant.$type == "BattleModel.ConstanctIntegerGroup") {
		const obj = constant as ConstanctIntegerGroup;
		return JSON.stringify(obj.Group);
	}
	console.error(`Unknown IGroupedInteger type: ${constant.$type}`);
	return JSON.stringify(constant);
}
