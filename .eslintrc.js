module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		sourceType: "module",
	},
	plugins: ["@typescript-eslint/eslint-plugin"],
	extends: [
		"plugin:@typescript-eslint/recommended",
		"plugin:react/jsx-runtime",
		"plugin:react-hooks/recommended",
	],
	root: true,
	env: {
		browser: true,
		node: true,
	},
	settings: {
		react: {
			// eslint-plugin-preact interprets this as "h.createElement",
			// however we only care about marking h() as being a used variable.
			pragma: "h",
			// We use "react 16.0" to avoid pushing folks to UNSAFE_ methods.
			version: "16.0",
		},
	},
	ignorePatterns: [".eslintrc.js", "data"],
	rules: {
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-unused-vars": [
			"warn",
			{
				argsIgnorePattern: "^_",
			},
		],
	},
};
