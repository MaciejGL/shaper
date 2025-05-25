module.exports = {
  trailingComma: 'all',
  tabWidth: 2,
  printWidth: 80,
  semi: false,
  singleQuote: true,
  arrowParens: 'always',
  plugins: [
    'prettier-plugin-tailwindcss',
    '@trivago/prettier-plugin-sort-imports',
  ],
  importOrder: ['<THIRD_PARTY_MODULES>', '^@/(.*)$', '^../', '^./'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  tailwindConfig: './tailwind.config.ts',
}
