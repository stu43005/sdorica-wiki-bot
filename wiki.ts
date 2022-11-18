import { registerImperiumLocalLoader } from "./src/imperium-data-local";
import { isDevMode } from "./src/utils";
import { wikiMain } from "./src/wiki";

registerImperiumLocalLoader();
wikiMain(!isDevMode());
