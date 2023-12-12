import path from "node:path";
import { __dirname } from "./utilities/node.js";

export const DATA_PATH = path.join(__dirname(import.meta), "../data");
export const ORIGIN_PATH = path.join(DATA_PATH, "origin.json");
export const LATEST_PATH = path.join(DATA_PATH, "client_latest");
export const GAMEDATA_PATH = path.join(DATA_PATH, "client_gamedata");
export const CHARASSETS_PATH = path.join(DATA_PATH, "charassets");
export const DIALOG_PATH = path.join(DATA_PATH, "dialog");
export const WIKI_PATH = path.join(DATA_PATH, "wiki");

export const IMAGES_PATH = path.join(DATA_PATH, "images");
export const BANNERS_PATH = path.join(IMAGES_PATH, "banners");

export const ASSETBUNDLE_PATH = path.join(DATA_PATH, "assetbundle");
export const BUNDLE_DOWNLOAD_PATH = path.join(ASSETBUNDLE_PATH, "download");
export const BUNDLE_EXTRACT_PATH = path.join(ASSETBUNDLE_PATH, "extract");
export const BUNDLE_UPLOAD_PATH = path.join(ASSETBUNDLE_PATH, "upload");

export const API_CONFIG_PATH = path.join(DATA_PATH, "api.json");
export interface ApiConfig {
	host: string;
	app_key: string;
	params: string;
	deviceUniqueIdentifier: string;
	zone: string;
}

export const ASSET_HOSTNAME = "https://d2a7ryqx23ztyg.cloudfront.net";
