import Vue from "vue";
import VueAxios from "vue-axios";
import { ImperiumDataRaw } from "../data-raw-type";

export interface ViewerJSCode {
	javascript: string;
	id: string;
}

export interface ViewerJSHelper {
	vue: Vue & VueAxios & VueExtends;
	viewerJS: Record<string, ViewerJSCode>;
	evalData: Record<string, any>;
	dbName: string;
	dbVersion: number;

	fetchViewerJS(): Promise<void>;
	getCode(type: string): ViewerJSCode;
	getTypes(): string[];
	submitViewerJS(type: string, code: string): void;
	getImperium(typeName: string): Promise<ImperiumDataRaw>;
	toastMsg(msg: string): void;
	runCode(type: string | null, data: any, extraCode: string | null, callback: (result: Record<string, any>) => void): void;
}

export interface VueExtends {
	$imperiumType: string[];
}
