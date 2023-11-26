import { assetBundleDownloader } from "./src/assetbundle-downloader";
import { registerImperiumLocalLoader } from "./src/imperium-data-local";
import { isDevMode } from "./src/utils";

registerImperiumLocalLoader();
assetBundleDownloader(isDevMode());
