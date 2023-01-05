import { registerImperiumLocalLoader } from "./src/imperium-data-local";
import { wikiMain } from "./src/wiki";

registerImperiumLocalLoader();
// wikiMain(!isDevMode());
wikiMain();
