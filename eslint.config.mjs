import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const project = resolve(__dirname, 'tsconfig.json')

// import tailwindcssPlugin from 'eslint-plugin-tailwindcss';

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ['src/generated/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project,
      },
      globals: {
        React: true,
        JSX: true,
        NodeJS: true,
        module: true,
      },
    },
    rules: {
      eqeqeq: ['error', 'smart'],
      'no-var': 'off',
      'valid-typeof': ['warn', { requireStringLiterals: true }],
      'no-debugger': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
      'react/no-unescaped-entities': 'off',
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/set-state-in-effect': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/array-type': 'warn',
      '@typescript-eslint/consistent-indexed-object-style': 'warn',
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-expect-error': 'allow-with-description',
        },
      ],
      'import/no-named-as-default-member': 'off',
      'import/no-named-as-default': 'off',
      'tailwindcss/no-contradicting-classname': 'off',
      // 'tailwindcss/no-custom-classname': 'warn',
    },
  },
  {
    files: ['src/generated/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/ban-types': 'off',
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
      '*generated*.*',
      'node_modules/',
      'dist/',
      'src/__tests__/**',
      'src/lib/pdf/**',
      'expo-app/**',
      'src/app/(protected)/admin/**',
    ],
  },
]

export default eslintConfig
