import { checkBanner } from "./src/check-banner";
import { isDevMode } from "./src/utils";

checkBanner(isDevMode());
