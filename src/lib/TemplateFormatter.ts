import { isEmptyObject, isNumber, objectEach } from "../utils";

export class TemplateFormatter {
	static FORMATSTRING_REGEXP = /^(\n)?(\{\{ *_+)(\n? *\|\n? *_+ *= *)(_+)(\n? *\}\})(\n)?$/;

	name: string;
	format?: {
		startOfLine?: string,
		start: string,
		paramName: string,
		paramValue: string,
		end: string,
		endOfLine?: string,
	};
	params: Record<string, any>;

	constructor() {
		this.name = '';
		this.params = {};
	}

	setTemplateName(newName: string) {
		this.name = newName;
	}

	setParameters(params: Record<string, any>) {
		// If any numbered parameters are set, all lower-numbered ones should be set as well (to blank).
		Object.keys(params).forEach(function (key) {
			if (isNumber(key)) {
				for (let paramNum = 1; paramNum < key; paramNum++) {
					if (params[paramNum] === undefined) {
						params[paramNum] = '';
					}
				}
			}
		});
		this.params = params;
	}

	setFormat(format: string | TemplateFormatter.FORMAT) {
		let inlineFormat = '{{_|_=_}}';
		if (format === 'inline') {
			format = inlineFormat;
		}
		if (format === 'block') {
			format = '{{_\n| _ = _\n}}';
		}
		// Check format string for validity, and fall back to 'inline' if it's not.
		let parsedFormat = format.match(TemplateFormatter.FORMATSTRING_REGEXP);
		if (!parsedFormat) {
			parsedFormat = inlineFormat.match(TemplateFormatter.FORMATSTRING_REGEXP)!;
		}
		this.format = {
			startOfLine: parsedFormat[1],
			start: parsedFormat[2],
			paramName: parsedFormat[3],
			paramValue: parsedFormat[4],
			end: parsedFormat[5],
			endOfLine: parsedFormat[6]
		};
	}

	getFormat() {
		if (!this.format) {
			this.setFormat('inline');
		}
		return this.format!;
	}

	getTemplate() {
		// Before building the template, fall back to inline format
		// if there are no parameters (T190123).
		if (isEmptyObject(this.params)) {
			this.setFormat('inline');
		}
		const format = this.getFormat();

		// Start building the template.
		let template = '';
		if (format.startOfLine) {
			template += '\n';
		}
		template += TemplateFormatter.formatStringSubst(format.start, this.name);

		// Process the parameters.
		// eslint-disable-next-line jquery/no-each-util
		objectEach(this.params, (key: string, val: string) => {
			if (!val) return;
			if (isNumber(key)) {
				// Render numeric/unnamed parameters inline, as Parsoid does it.
				template += TemplateFormatter.formatStringSubst('|', '');
			} else {
				// Non-numeric keys are added as normal.
				template += TemplateFormatter.formatStringSubst(format.paramName, key);
			}
			template += TemplateFormatter.formatStringSubst(format.paramValue, val);
		});

		// End and return the template.
		template += format.end;
		if (format.endOfLine && !template.match(/\n$/)) {
			template += '\n';
		}
		return template;
	}

	/**
	 * Format a part of the template, based on the TemplateData format string.
	 * This method is based on that of the same name in Parsoid:
	 * https://github.com/wikimedia/parsoid/blob/9c80dd597a8c057d43598303fd53e90cbed4ffdb/lib/html2wt/WikitextSerializer.js#L405
	 * @param {string} format
	 * @param {string} value
	 * @return {string}
	 */
	static formatStringSubst(format: string, value: string): string {
		value = ('' + value).trim();
		return format.replace(/_+/, function (hole) {
			if (value === '' || hole.length <= value.length) {
				return value;
			}
			// Right-pad with spaces.
			while (value.length < hole.length) {
				value += ' ';
			}
			return value;
		});
	}
}

export namespace TemplateFormatter {
	export enum FORMAT {
		INLINE = "inline",
		BLOCK = "block",
	}
}
