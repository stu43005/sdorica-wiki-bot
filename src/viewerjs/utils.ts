import bson from "bson";
import * as idb from "idb";
import { CharAssetsRaw } from "../data-raw-type";
import { ImperiumData } from "../imperium-data";
import { objectEach } from "../utils";
import { SdoricaInspectorApi } from './si-api';
import { SiContainer } from "./types/containers";
import { ViewerJSHelper } from "./viewerjs-helper";

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
	resolve: (value?: SiContainer | PromiseLike<SiContainer>) => void;
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
						console.error(error);
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
		console.error(`Not found: ${path}`);
		debugger;
		throw `Not found: ${path}`;
	}
	const assetBundle = resultMatch.asset_bundles[resultMatch.asset_bundles.length - 1];
	// step 2: Get AssetBundle
	const containers = await api.assetbundleContainers(assetBundle.md5);
	let pathId: string = "";
	objectEach(containers, (id, value) => {
		if (value.name.toLowerCase() == path.toLowerCase()) {
			pathId = id;
		}
	});
	if (!pathId) {
		console.error(`No pathId: ${path}`);
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
		console.error(`Not found: ${path}`);
		debugger;
		throw `Not found: ${path}`;
	}
	const assetBundle = resultMatch.asset_bundles[resultMatch.asset_bundles.length - 1];
	// step 2: Get AssetBundle
	const containers = await api.assetbundleContainers(assetBundle.md5);
	let pathId: string = "";
	objectEach(containers, (id, value) => {
		if (value.name.toLowerCase() == path.toLowerCase()) {
			pathId = id;
		}
	});
	if (!pathId) {
		console.error(`No pathId: ${path}`);
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
			console.error(`Not found: ${path}`);
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
			console.error(`No pathId: ${path}`);
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

export async function getDataFromCache(key: string) {
	const db = await getDb();
	return await db.get('cache', key);
}

export async function addDataToCache(key: string, value: any) {
	const db = await getDb();
	await db.put('cache', value, key);
}

function _base64ToArrayBuffer(base64: string) {
	const binary_string = window.atob(base64);
	const len = binary_string.length;
	const bytes = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		bytes[i] = binary_string.charCodeAt(i);
	}
	return bytes;
}

export async function downloadFileCors(url: string) {
	const corsurl = `https://cors-anywhere.herokuapp.com/${url}`;
	const res = await window.fetch(corsurl);
	const text = await res.text();
	return text;
}

export async function getCharAssets(helper: ViewerJSHelper): Promise<CharAssetsRaw> {
	const charAssets = ImperiumData.fromCharAssets();
	await charAssets.loadData();
	const asset = charAssets.getAsset("charAssets.bson");

	const json = await getDataFromCache(asset.L);
	if (json) {
		console.log('hit cache:', asset.L);
		return json;
	} else {
		helper.toastMsg("正在下載 charAssets.bson，請稍等大約1分鐘。。。");
		const b64content = await downloadFileCors(asset.L);
		const buf = _base64ToArrayBuffer(b64content);
		const data = bson.deserialize(buf as Buffer) as CharAssetsRaw;
		await addDataToCache(asset.L, data);
		return data;
	}
}
