import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'playwright-report', 'test-results'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  // Architecture guard (docs/architecture.md §2): core/ is pure TypeScript.
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['three', 'three/*'], message: 'core/ must not depend on Three.js' },
            { group: ['react', 'react-dom', 'react/*'], message: 'core/ must not depend on React' },
            { group: ['**/render/**', '**/ui/**', '**/audio/**', '**/app/**'], message: 'core/ must not import presentation layers' },
          ],
        },
      ],
    },
  },
  // Children-facing strings live in src/content (CLAUDE.md rule 4).
);
