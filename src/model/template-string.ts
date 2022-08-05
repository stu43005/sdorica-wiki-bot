export class TemplateString extends String {
	constructor(str: string) {
		super(str);
	}

	apply(variables: Record<string, unknown> | unknown[]) {
		let result = this.toString();
		if (Array.isArray(variables)) {
			for (let index = 0; index < variables.length; index++) {
				const value = variables[index];
				result = result.replace(new RegExp(`\\{${index}\\}`, 'g'), value as string);
			}
		} else {
			for (const key of Object.keys(variables)) {
				const value = variables[key];
				result = result.replace(new RegExp(`\\{\\[${key}\\]\\}`, 'g'), value as string);
			}
		}
		return result;
	}
}
