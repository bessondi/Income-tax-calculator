module.exports = {
  printWidth: 120,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'avoid',
  htmlWhitespaceSensitivity: 'ignore',
  overrides: [
    {
      files: '**/*.html',
      options: {
        trailingComma: 'none',
      },
    },
  ],
};
