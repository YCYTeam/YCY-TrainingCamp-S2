module.exports = {
	printWidth: 140,
	tabWidth: 2,
	useTabs: true,
	semi: true,
	singleQuote: true,
	jsxSingleQuote: true,
	quoteProps: 'consistent',
	trailingComma: 'es5',
	bracketSpacing: true,
	jsxBracketSameLine: true,
	arrowParens: 'always',
	vueIndentScriptAndStyle: false,
	endOfLine: 'lf',
	embeddedLanguageFormatting: 'auto',
	htmlWhitespaceSensitivity: 'css',
	proseWrap: 'never',
	overrides: [
		{
			files: 'package*.json',
			options: {
				printWidth: 1000,
			},
		},
	],
};
