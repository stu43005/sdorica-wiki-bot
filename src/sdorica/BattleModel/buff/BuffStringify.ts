import { localizationBuffName } from "../../../localization";
import { BuffLabelData } from "../BuffLabelData";
import { conditionBuffStringify } from "../condition/ConditionStringify";
import { singleTargetStringify } from "../target/TargetStringify";
import { BuffIdFromLabelList } from "./buffid/BuffIdFromLabelList";
import { GeneralGroupedBuffId } from "./buffid/GeneralGroupedBuffId";
import { IGroupedBuffId } from "./buffid/IGroupedBuffId";
import { AllBuffsOnChar } from "./grouped/AllBuffsOnChar";
import { BuffGroupWhere } from "./grouped/BuffGroupWhere";
import { IGroupedBuff } from "./grouped/IGroupedBuff";
import { BuffOnCharater } from "./single/BuffOnCharater";
import { ISingleBuff } from "./single/ISingleBuff";
import { SpecifiedBuff } from "./single/SpecifiedBuff";
import { ThisBuff } from "./single/ThisBuff";

export function singleBuffStringify(buff: ISingleBuff) {
	if (!buff) return "";
	if (buff.$type == "BattleModel.ThisBuff") {
		const obj = buff as ThisBuff;
		return `本狀態`;
	}
	if (buff.$type == "BattleModel.SpecifiedBuff") {
		const obj = buff as SpecifiedBuff;
		return `當前事件的狀態`;
	}
	if (buff.$type == "BattleModel.BuffOnCharater") {
		const obj = buff as BuffOnCharater;
		return `在${singleTargetStringify(obj.character)}的${localizationBuffName(true)(obj.buffId)}狀態`;
	}
	console.error(`Unknown condition type: ${buff.$type}`);
	debugger;
	return JSON.stringify(buff);
}

export function groupedBuffStringify(buff: IGroupedBuff): string {
	if (!buff) return "";
	if (buff.$type == "BattleModel.AllBuffsOnChar") {
		const obj = buff as AllBuffsOnChar;
		return `${singleTargetStringify(obj.character)}持有的Buff`;
	}
	if (buff.$type == "BattleModel.BuffGroupWhere") {
		const obj = buff as BuffGroupWhere;
		return `${groupedBuffStringify(obj.group)}中${conditionBuffStringify(obj.condition)}的Buff`;
	}
	console.error(`Unknown condition type: ${buff.$type}`);
	debugger;
	return JSON.stringify(buff);
}

export function groupedBuffIdStringify(buff: IGroupedBuffId) {
	if (!buff) return "";
	if (buff.$type == "BattleModel.BuffIdFromLabelList") {
		const obj = buff as BuffIdFromLabelList;
		return `${buffLabelStringify(obj.BuffLabel)}列表的Buff`;
	}
	if (buff.$type == "BattleModel.GeneralGroupedBuffId") {
		const obj = buff as GeneralGroupedBuffId;
		return groupedBuffStringify(obj.BuffGroup);
	}
	console.error(`Unknown condition type: ${buff.$type}`);
	debugger;
	return JSON.stringify(buff);
}

export function buffLabelStringify(buffLabel: BuffLabelData) {
	const buffList = buffLabel.BuffIdList.map(b => localizationBuffName()(b));
	let prefix = "";
	let separator = ", ";
	let suffix = "";
	if (buffList.some((value) => value.length > 10)) {
		prefix = "\n\t";
		separator = ",\n\t";
		suffix = "\n";
	}
	return `${buffLabel.BuffLabel}[${prefix}${buffList.join(separator)}${suffix}]`;
}
