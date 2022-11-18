import { sumBy } from "lodash";

export type TableCeilTextType = string | number;

export interface TableCeil {
	header?: boolean;
	attributes?: string;
	text: TableCeilTextType;
}

export type WikiTableCeil = TableCeil | TableCeilTextType;

export interface TableRow {
	attributes?: string;
	headerBar?: boolean;
	ceils: WikiTableCeil[];
}

export type WikiTableRow = TableRow | WikiTableCeil[];

export interface Table {
	attributes?: string;
	rows: WikiTableRow[];
}

export type WikiTableStruct = Table | WikiTableRow[];

export function wikitable(table: WikiTableStruct): string {
	const {
		attributes = `class="wikitable"`,
		rows,
	} = Array.isArray(table) ? { rows: table, attributes: void 0 } : table;
	return `<table${attributes ? ` ${attributes}` : ""}>
${rows.map(row => renderTableRow(row)).join("\n")}
</table>`;
}

function renderTableRow(row: WikiTableRow): string {
	const {
		attributes,
		headerBar,
		ceils,
	} = Array.isArray(row) ? { ceils: row, headerBar: void 0, attributes: void 0 } : row;
	const ceilsText = ceils.map(ceil => renderTableCeil(ceil, headerBar));
	const ceilsTextCount = sumBy(ceilsText, "length");
	const isSimpleRow = ceilsTextCount < 80 && ceils.every(ceil => typeof ceil === "string" && !ceil.includes("\n"));
	return `<tr${attributes ? ` ${attributes}` : ""}>
${ceilsText.join(isSimpleRow ? "" : "\n")}
</tr>`;
}

function renderTableCeil(ceil: WikiTableCeil, headerBar?: boolean): string {
	if (typeof ceil === "undefined") ceil = "";
	const {
		header,
		attributes,
		text,
	} = typeof ceil !== "object" ? parseCeilText(ceil) : ceil;
	const tag = (header ?? headerBar) ? "th" : "td";
	const multiLine = typeof text === "string" && text.includes("\n") ? "\n" : "";
	return `<${tag}${attributes ? ` ${attributes}` : ""}>${multiLine}${text}${multiLine}</${tag}>`;
}

const ceilRegexp = /^([\|!]) *(?:([^\|\{|\[]+?) *\|)? *(.*)$/;
function parseCeilText(ceil: TableCeilTextType): TableCeil {
	if (typeof ceil === "number") ceil = ceil.toString();
	const [, header, attributes, text] = ceil.match(ceilRegexp) ?? [];
	if (!text) {
		return { text: ceil };
	}
	return {
		header: header === "!",
		attributes,
		text,
	};
}
