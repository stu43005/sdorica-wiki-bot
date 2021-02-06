import { charAssetsDownloader } from "./src/charassets-downloader";
import { registerImperiumLocalLoader } from "./src/imperium-data-local";
import { isDevMode } from "./src/utils";

registerImperiumLocalLoader();
charAssetsDownloader(isDevMode());
