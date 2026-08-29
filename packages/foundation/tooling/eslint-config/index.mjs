import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import turboPlugin from 'eslint-plugin-turbo'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export const baseConfig = [
  js.configs.recommended,
  prettierConfig,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['error', 'info', 'warn'] }],
    },
  },
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
    },
  },
  {
    ignores: ['dist/**', '.next/**', '**/.turbo/**', '**/coverage/**'],
  },
]
