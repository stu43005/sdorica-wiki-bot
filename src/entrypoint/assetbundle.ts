import "../imperium-data-local.js";
//
import { assetBundleDownloader } from "../assetbundle-downloader.js";
import { isDevMode } from "../utils.js";

assetBundleDownloader(isDevMode());
