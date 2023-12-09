import "../imperium-data-local.js";
//
import { dialogDownloader } from "../dialog-downloader.js";
import { isDevMode } from "../utils.js";

await dialogDownloader(isDevMode());
