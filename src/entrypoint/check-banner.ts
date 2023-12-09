import { checkBanner } from "../check-banner.js";
import { isDevMode } from "../utils.js";

checkBanner(isDevMode());
