import { localizationBuffName } from "../../../localization";
import { BuffEnums } from "../BuffEnums";
import { BuffTag } from "../BuffTag";
import { conditionBuffStringify } from "../condition/ConditionStringify";
import { AssignedValue } from "../constant/AssignedValue";
import { constantStringify } from "../constant/ConstantStringify";
import { ISingleInteger } from "../constant/ISingleInteger";
import { addBuff, skillEffectStringify } from "../skilleffect/SkillEffectStringify";
import { SkillProperty } from "../SkillProperty";
import { skillUnitStringify } from "../SkillUnit";
import { mulitTargetStringify, singleTargetStringify } from "../target/TargetStringify";
import { AssignParameterSkillEffect } from "./AssignParameterSkillEffect";
import { BonusEffectForSkillProperty } from "./BonusEffectForSkillProperty";
import { CharacterAddPower } from "./CharacterAddPower";
import { DirectSkillEffect } from "./DirectSkillEffect";
import { ExtraPowerForSkillEffect } from "./ExtraPowerForSkillEffect";
import { IBaseOperation } from "./IBaseOperation";
import { ImmediatelySkillEffect } from "./ImmediatelySkillEffect";
import { IOperationToBuff } from "./operateBuff/IOperationToBuff";
import { ReplaceBuffTag } from "./operateBuff/ReplaceBuffTag";
import { SetBuffField } from "./operateBuff/SetBuffField";
import { OperateCharacter } from "./OperateCharacter";
import { AddBuff } from "./operateCharacter/AddBuff";
import { CastSkillSet } from "./operateCharacter/CastSkillSet";
import { IOperationToCharacter } from "./operateCharacter/IOperationToCharacter";
import { OperateCharacterAllConditionalBuffs } from "./operateCharacter/OperateCharacterAllConditionalBuffs";
import { RemoveBuff } from "./operateCharacter/RemoveBuff";
import { OperateCharacterGroup } from "./OperateCharacterGroup";
import { OperateThisBuff } from "./OperateThisBuff";

export function operationStringify(operation: IBaseOperation) {
	if (!operation) return "";
	if (operation.$type == "BattleModel.OperateCharacter") {
		const obj = operation as OperateCharacter;
		return `對${singleTargetStringify(obj.character)}${operateCharacterStringify(obj.operation)}`;
	}
	if (operation.$type == "BattleModel.OperateCharacterGroup") {
		const obj = operation as OperateCharacterGroup;
		return `對${mulitTargetStringify(obj.group)}所有角色${operateCharacterStringify(obj.operation)}`;
	}
	if (operation.$type == "BattleModel.OperateThisBuff") {
		const obj = operation as OperateThisBuff;
		return `對本狀態${operateBuffStringify(obj.operation)}`;
	}
	if (operation.$type == "BattleModel.BonusEffectForSkillProperty") {
		const obj = operation as BonusEffectForSkillProperty;
		return `技能${obj.property > 0 ? `的(${SkillProperty.toString(obj.property)})屬性` : ""}效果增加(${constantStringify(obj.value)})${obj.isPercent ? "%" : ""}`;
	}
	if (operation.$type == "BattleModel.ExtraPowerForSkillEffect") {
		const obj = operation as ExtraPowerForSkillEffect;
		return `技能係數增加(${constantStringify(obj.value)})${obj.isPercent ? "%" : ""}`;
	}
	if (operation.$type == "BattleModel.CharacterAddPower") {
		const obj = operation as CharacterAddPower;
		return `${singleTargetStringify(obj.character)}的攻擊力增加(${constantStringify(obj.value)})${obj.isPercent ? "%" : ""}`;
	}
	if (operation.$type == "BattleModel.DirectSkillEffect") {
		const obj = operation as DirectSkillEffect;
		return `立即施展技能：${skillUnitStringify(obj.skillUnit)}`;
	}
	if (operation.$type == "BattleModel.AssignParameterSkillEffect") {
		const obj = operation as AssignParameterSkillEffect;
		assignValue(obj.SkillUnit, obj.AssignValue);
		return `立即施展技能：${skillUnitStringify(obj.SkillUnit)}`;
	}
	if (operation.$type == "BattleModel.ImmediatelySkillEffect") {
		const obj = operation as ImmediatelySkillEffect;
		return `立即施展技能效果：${obj.SkillEffect.map((effect) => {
			return `${skillEffectStringify(effect)}`;
		}).join("、")}`;
	}
	console.error(`Unknown IBaseOperation type: ${operation.$type}`);
	return JSON.stringify(operation);
}

function assignValue(obj: any, value: ISingleInteger) {
	if (obj && typeof obj == "object") {
		if (obj instanceof Array) {
			for (let index = 0; index < obj.length; index++) {
				const element = obj[index];
				assignValue(element, value);
			}
		}
		else if (obj.$type == "BattleModel.AssignedValue") {
			const assignedValue = obj as AssignedValue;
			assignedValue._value = value;
		}
		else {
			for (const key in obj) {
				if (obj.hasOwnProperty(key)) {
					const element = obj[key];
					assignValue(element, value);
				}
			}
		}
	}
}

export function operateCharacterStringify(operation: IOperationToCharacter) {
	if (!operation) return "";
	if (operation.$type == "BattleModel.RemoveBuff") {
		const obj = operation as RemoveBuff;
		return `移除狀態${localizationBuffName(true)(obj.buffId)}`;
	}
	if (operation.$type == "BattleModel.AddBuff") {
		const obj = operation as AddBuff;
		return addBuff(obj.buffToAdd);
	}
	if (operation.$type == "BattleModel.CastSkillSet") {
		const obj = operation as CastSkillSet;
		return `觸發${obj.skillsetId}${obj.resetCasterCD ? "，並重設冷卻時間" : ""}`;
	}
	if (operation.$type == "BattleModel.OperateCharacterAllConditionalBuffs") {
		const obj = operation as OperateCharacterAllConditionalBuffs;
		return `符合(${conditionBuffStringify(obj.condition)})的狀態${operateBuffStringify(obj.operation)}`;
	}
	console.error(`Unknown IOperationToCharacter type: ${operation.$type}`);
	return JSON.stringify(operation);
}

export function operateBuffStringify(operation: IOperationToBuff) {
	if (!operation) return "";
	if (operation.$type == "BattleModel.SetBuffField") {
		const obj = operation as SetBuffField;
		return `的${BuffEnums.BuffIntergerField.toString(obj.targetField)}${BuffEnums.SetterOp.toString(obj.setOperator)}${constantStringify(obj.value)}`;
	}
	if (operation.$type == "BattleModel.ReplaceBuffTag") {
		const obj = operation as ReplaceBuffTag;
		return `覆蓋標籤為(${BuffTag.toString(obj.newTag)})`;
	}
	console.error(`Unknown IOperationToBuff type: ${operation.$type}`);
	return JSON.stringify(operation);
}
