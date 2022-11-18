export function wikiul(list: string[]) {
	// const indentText = indent ? " ".repeat(indent) : "";
	// return list.map(item => `${indentText}* ${item}`).join("\n");
	if (!list.length) return `<ul></ul>`;
	return `<ul>
${list.map(item => `<li>${item}</li>`).join("\n")}
</ul>`;
}
