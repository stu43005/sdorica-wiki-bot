import { decode as base64ToArrayBuffer, encode as arrayBufferToBase64 } from "base64-arraybuffer";
import { unzip } from "gzip-js";
import * as idb from "idb";
import JSZip from "jszip";
import { ImperiumData } from "../imperium-data";
import { fsSerializer } from "../lib/FullSerializer/fsSerializer";
import { Logger } from "../logger";
import { objectEach } from "../utils";
import { SdoricaInspectorApi } from './si-api';
import { SiContainer } from "./types/containers";
import { ViewerJSHelper } from "./viewerjs-helper";

const logger = new Logger('viewerjs/utils');

export function siJsonParse(text: string) {
	return JSON.parse(text.replace(/\:(-?)\.(\d)/g, ":$10.$2"));
}

export async function getImperiumName(helper: ViewerJSHelper, typeName: string) {
	const typeId = helper.vue.$imperiumType.indexOf(typeName);
	if (typeId < 0) return "";
	const api = new SdoricaInspectorApi(helper);
	const imperiums = await api.imperium();
	const i = imperiums.find(x => x.type_id === typeId);
	if (i) {
		return `${i.id}::${i.name}`;
	}
	return "";
}

export function getLevelEventPath(level: string) {
	return `assets/game/leveldata/leveleventdata/${level}_levelevent.asset`;
}

let queueTimer: any = null;
let queue: QueueEntry[] = [];
interface QueueEntry {
	path: string;
	resolve: (value: SiContainer | PromiseLike<SiContainer>) => void;
	reject: (reason?: any) => void;
}

export async function containerSearchAuto(helper: ViewerJSHelper, path: string) {
	return new Promise<SiContainer>((resolve, reject) => {
		queue.push({
			path,
			resolve,
			reject
		});
		if (!queueTimer) {
			queueTimer = setTimeout(async () => {
				const queue2 = queue;
				queue = [];
				if (queue2.length > 0) {
					try {
						const results = await containerSearchMultiSplit(helper, queue2.map(q => q.path));
						queue2.forEach((entry, index) => {
							entry.resolve(results[index]);
						});
					}
					catch (error) {
						logger.error(error);
						debugger;
						queue2.forEach((entry) => {
							entry.reject(error);
						});
					}
				}
				queueTimer = null;
			}, 10);
		}
	});
}

export async function containerSearch(helper: ViewerJSHelper, path: string) {
	const api = new SdoricaInspectorApi(helper);
	// step 1: Container Search
	const searchResult = await api.containerSearch(path);
	const resultMatch = searchResult.find(r => r.name.toLowerCase() == path.toLowerCase());
	if (!resultMatch) {
		logger.error(`Not found: ${path}`);
		debugger;
		throw `Not found: ${path}`;
	}
	const assetBundle = resultMatch.asset_bundles[resultMatch.asset_bundles.length - 1];
	// step 2: Get AssetBundle
	const containers = await api.assetbundleContainers(assetBundle.md5);
	let pathId = "";
	objectEach(containers, (id, value) => {
		if (value.name.toLowerCase() == path.toLowerCase()) {
			pathId = id;
		}
	});
	if (!pathId) {
		logger.error(`No pathId: ${path}`);
		debugger;
		throw `No pathId: ${path}`;
	}
	// step 3: Get Container data
	const container = await api.assetbundleContainer(assetBundle.md5, pathId);
	// step 4: Run ViewerJS code
	const interpretedData: SiContainer = helper.getCode(containers[pathId].type) ? await new Promise((resolve) => {
		container.__skip_prompt = true;
		helper.runCode(containers[pathId].type, container, null, (reuslt) => {
			delete reuslt.__skip_prompt;
			resolve(reuslt);
		});
	}) : container;
	return interpretedData;
}

export async function containerSearchData(helper: ViewerJSHelper, path: string) {
	const api = new SdoricaInspectorApi(helper);
	// step 1: Container Search
	const searchResult = await api.containerSearch(path);
	const resultMatch = searchResult.find(r => r.name.toLowerCase() == path.toLowerCase());
	if (!resultMatch) {
		logger.error(`Not found: ${path}`);
		debugger;
		throw `Not found: ${path}`;
	}
	const assetBundle = resultMatch.asset_bundles[resultMatch.asset_bundles.length - 1];
	// step 2: Get AssetBundle
	const containers = await api.assetbundleContainers(assetBundle.md5);
	let pathId = "";
	objectEach(containers, (id, value) => {
		if (value.name.toLowerCase() == path.toLowerCase()) {
			pathId = id;
		}
	});
	if (!pathId) {
		logger.error(`No pathId: ${path}`);
		debugger;
		throw `No pathId: ${path}`;
	}
	// step 3: Get Container data
	const stream = await api.assetbundleContainerData(assetBundle.md5, pathId);
	return stream;
}

export async function containerSearchMultiSplit(helper: ViewerJSHelper, ql: string[], count = 50) {
	let newout: Record<string, any>[] = [];
	let cur = 0;
	while (ql.length > cur) {
		const qll = ql.slice(cur, cur + count);
		const out = await containerSearchMulti(helper, qll);
		newout = newout.concat(out);
		cur += count;
	}
	return newout;
}

export async function containerSearchMulti(helper: ViewerJSHelper, ql: string[]) {
	const api = new SdoricaInspectorApi(helper);
	// step 1: Container Search
	const searchResults = await api.containerMultiSearch(ql);
	const qlmd5: string[] = [];
	const abl = [...searchResults.reduce((prev, curr, index) => {
		const path = ql[index];
		const resultMatch = curr.find(r => r.name.toLowerCase() == path.toLowerCase());
		if (!resultMatch) {
			logger.error(`Not found: ${path}`);
			debugger;
			throw `Not found: ${path}`;
		}
		const assetBundle = resultMatch.asset_bundles[resultMatch.asset_bundles.length - 1];
		prev.add(assetBundle.md5);
		qlmd5[index] = assetBundle.md5;
		return prev;
	}, new Set<string>())];

	// step 2: Get AssetBundle
	const abd = await Promise.all(abl.map(async md5 => await api.assetbundleContainers(md5)));
	const qlpathid: string[] = [];
	const qltype: string[] = [];
	ql.forEach((path, index) => {
		const containers = abd[abl.indexOf(qlmd5[index])];
		objectEach(containers, (id, value) => {
			if (value.name.toLowerCase() == path.toLowerCase()) {
				qlpathid[index] = id;
				qltype[index] = value.type;
			}
		});
		if (!qlpathid[index]) {
			logger.error(`No pathId: ${path}`);
			debugger;
			throw `No pathId: ${path}`;
		}
	});

	// step 3: Get Container data
	const qll = ql.map<[string, string]>((path, index) => [qlmd5[index], qlpathid[index]]);
	const containerResults = await api.assetbundleContainerMultiRetrieve(qll);

	// step 4: Run ViewerJS code
	const interpretedDatas: SiContainer[] = await Promise.all(qll.map(async (q, index) => {
		const container = containerResults[index];
		if (helper.getCode(qltype[index])) {
			return new Promise<Record<string, any>>((resolve) => {
				container.__skip_prompt = true;
				helper.runCode(qltype[index], container, null, (reuslt) => {
					delete reuslt.__skip_prompt;
					resolve(reuslt);
				});
			});
		}
		return container;
	}));
	return interpretedDatas;
}

const dbName = "ViewerJS";
const dbVersion = 1;
export function getDb() {
	return idb.openDB(dbName, dbVersion, {
		upgrade(db) {
			db.createObjectStore('cache');
		}
	});
}

export async function getDataFromCache<T>(key: string, fallback: () => Promise<T>): Promise<T> {
	const db = await getDb();
	let result: T = await db.get('cache', key);
	if (result) {
		logger.log('hit cache:', key);
	} else {
		result = await fallback();
		await db.put('cache', result, key);
	}
	return result;
}

export async function addDataToCache(key: string, value: any) {
	const db = await getDb();
	await db.put('cache', value, key);
}

export async function downloadFileCors(url: string) {
	const corsurl = `https://cors-anywhere.herokuapp.com/${url}`;
	const res = await window.fetch(corsurl);
	const text = await res.arrayBuffer();
	return text;
}

export async function getCharAssets(helper: ViewerJSHelper): Promise<JSZip> {
	const charAssets = ImperiumData.fromCharAssets();
	await charAssets.loadData();

	const asset = charAssets.getAsset("CharAssets.zip");
	const base64 = await getDataFromCache(asset.L, async () => {
		helper.toastMsg("正在下載 CharAssets.zip，請稍等大約1分鐘。。。");
		const buffer = await downloadFileCors(asset.L);
		return arrayBufferToBase64(buffer);
	});
	const buffer = base64ToArrayBuffer(base64);
	const zip = await JSZip.loadAsync(buffer);
	return zip;
}

export async function getCharAsset(zipEntry: JSZip.JSZipObject) {
	const content = await zipEntry.async('uint8array');
	const jsonBuffer = new Uint8Array(unzip(content));
	const jsonString = new TextDecoder("utf-8").decode(jsonBuffer);
	const json = siJsonParse(jsonString);
	const serializer = new fsSerializer();
	const deserialized = serializer.TryDeserialize(json);
	return deserialized;
}
