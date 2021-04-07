export class TemplateString extends String {
	constructor(str: string) {
		super(str);
	}

	apply(variables: Record<string, any>) {
		let result = this.toString();
		for (const key of Object.keys(variables)) {
			const value = variables[key];
			result = result.replace(new RegExp(`\\{\\[${key}\\]\\}`, 'g'), value);
		}
		return result;
	}
}
