import { dialogDownloader } from "./src/dialog-downloader";
import { registerImperiumLocalLoader } from "./src/imperium-data-local";
import { isDevMode } from "./src/utils";

registerImperiumLocalLoader();
dialogDownloader(isDevMode());
