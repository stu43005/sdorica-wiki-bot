import { checkBanner } from "../check-banner.js";
import { isDevMode } from "../utils.js";

await checkBanner(isDevMode());
