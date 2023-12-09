import "../imperium-data-local.js";
//
import { kebabCase } from "change-case";
import fsp from "node:fs/promises";
import path from "node:path";
import { ImperiumData } from "../imperium-data.js";
import { __dirname } from "../utilities/node.js";

const dist = path.join(__dirname(import.meta), "src/model/enums");

const gamedata = ImperiumData.fromGamedata();

const index: {
	name: string;
	enumName: string;
	filename: string;
}[] = [];

if (gamedata.data) {
	console.log(gamedata.data.E);

	for (const [enumName, values] of Object.entries(gamedata.data.E)) {
		const name = enumName.replace("enum:", "");
		const filename = kebabCase(name);
		const content = [
			`export enum ${name} {`,
			...values.map((value) => `	${value} = "${value}",`),
			`}`,
			"",
		].join("\n");
		await fsp.writeFile(path.join(dist, `${filename}.enum.ts`), content, { encoding: "utf8" });
		index.push({
			name: name,
			enumName: enumName,
			filename: filename,
		});
	}
}

const indexContent = [
	...index.map((r) => `import { ${r.name} } from "./${r.filename}.enum.js";`),
	"",
	`export type EnumList = {`,
	...index.map((r) => `	"${r.enumName}": ${r.name};`),
	`};`,
	"",
].join("\n");
await fsp.writeFile(path.join(dist, `index.ts`), indexContent, { encoding: "utf8" });
