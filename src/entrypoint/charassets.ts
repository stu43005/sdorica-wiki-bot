import "../imperium-data-local.js";
//
import { charAssetsDownloader } from "../charassets-downloader.js";
import { isDevMode } from "../utils.js";

charAssetsDownloader(isDevMode());
