export function wikiimage(
	filename: string,
	{
		width,
		height,
	}: {
		width?: number;
		height?: number;
	} = {}
) {
	return `[[File:${filename}|${width ? `${width}px` : ""}${height ? `x${height}px` : ""}]]`;
}
