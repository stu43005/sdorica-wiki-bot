export function wikiH1(text: string): string {
	headerIds.clear();
	return `<h1 id="${getHeaderId(text)}">${fixText(text)}</h1>`;
	// return `# ${fixText(text)}`;
}

export function wikiH2(text: string, id?: string, norm?: boolean): string;
export function wikiH2(text: string, norm: boolean): string;
export function wikiH2(text: string, arg2?: string | boolean, arg3?: boolean): string {
	const [id, norm] = typeof arg2 === "boolean" ? [, arg2] : [arg2, arg3];
	return `<h2 id="${getHeaderId(id || text)}"${norm ? ` class="norm"` : ""}>${id && id != text ? `<span id="${getHeaderId(text)}"></span>` : ""}${fixText(text)}</h2>`;
	// return `## ${fixText(text)}`;
}

export function wikiH3(text: string, id?: string, norm?: boolean): string;
export function wikiH3(text: string, norm: boolean): string;
export function wikiH3(text: string, arg2?: string | boolean, arg3?: boolean): string {
	const [id, norm] = typeof arg2 === "boolean" ? [, arg2] : [arg2, arg3];
	return `<h3 id="${getHeaderId(id || text)}"${norm ? ` class="norm"` : ""}>${id && id != text ? `<span id="${getHeaderId(text)}"></span>` : ""}${fixText(text)}</h3>`;
	// return `### ${fixText(text)}`;
}

export function wikiH4(text: string, id?: string, norm?: boolean): string;
export function wikiH4(text: string, norm: boolean): string;
export function wikiH4(text: string, arg2?: string | boolean, arg3?: boolean): string {
	const [id, norm] = typeof arg2 === "boolean" ? [, arg2] : [arg2, arg3];
	return `<h4 id="${getHeaderId(id || text)}"${norm ? ` class="norm"` : ""}>${id && id != text ? `<span id="${getHeaderId(text)}"></span>` : ""}${fixText(text)}</h4>`;
	// return `#### ${fixText(text)}`;
}

export function wikiH5(text: string, id?: string, norm?: boolean): string;
export function wikiH5(text: string, norm: boolean): string;
export function wikiH5(text: string, arg2?: string | boolean, arg3?: boolean): string {
	const [id, norm] = typeof arg2 === "boolean" ? [, arg2] : [arg2, arg3];
	return `<h5 id="${getHeaderId(id || text)}"${norm ? ` class="norm"` : ""}>${id && id != text ? `<span id="${getHeaderId(text)}"></span>` : ""}${fixText(text)}</h5>`;
	// return `##### ${fixText(text)}`;
}

export function wikiHr(): string {
	return `<hr />`;
}

export function normalizationHeaderId(text: string) {
	return encodeURIComponent(text.replace(/<(.*?)>/g, "")).replace(/%/g, ".");
}

const headerIds = new Set<string>();
export function getHeaderId(text: string) {
	let id = normalizationHeaderId(text);
	if (headerIds.has(id)) {
		for (let i = 2;; i++) {
			const newId = `${id}_${i}`;
			if (!headerIds.has(newId)) {
				id = newId;
				break;
			}
		}
	}
	headerIds.add(id);
	return id;
}

function fixText(text: string) {
	return text.replace(/\n/g, "");
}
