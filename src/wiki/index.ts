import * as fs from "node:fs/promises";
import path from "node:path";
import { WIKI_PATH } from "../config.js";
import { wikiPageLink } from "../templates/wikilink.js";
import { wikiul } from "../templates/wikilist.js";

export default async function wikiIndex() {
	const pages: string[] = [];

	const files = await fs.readdir(WIKI_PATH, { withFileTypes: true });
	for (const file of files) {
		if (file.name === "index.html") continue;
		if (file.isFile() && path.extname(file.name) === ".html") {
			const fullpath = path.join(WIKI_PATH, file.name);
			const basename = path.basename(file.name, ".html");
			const content = await fs.readFile(fullpath, { encoding: "utf8" });
			const [, header] = content.match(/<h1.*?>(.*?)<\/h1>/) ?? [];
			pages.push(wikiPageLink(basename, `${basename} - ${header}`));
		}
	}

	return wikiul(pages);
}
