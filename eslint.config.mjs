import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	{
		files: ['src/lib/db.ts'],
		rules: {
			'no-var': 'off',
		},
	},
	{
		files: ['src/generated/**/*.{ts,tsx}'],
		rules: {
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},

	{
		ignores: [
			'.*.js',
			'tailwind.config.ts',
			'postcss.config.js',
			'next.config.js',
			'scripts/**',
		],
	},
];

export default eslintConfig;
