import js from '@eslint/js'
import ts from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'
import prettier from 'eslint-config-prettier'

export default ts.config(
  // Global ignores
  {
    ignores: [
      'dist/',
      'storybook-static/',
      'coverage/',
      'node_modules/',
      '*.config.ts',
      '*.config.js',
    ],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...ts.configs.recommended,

  // Vue 3 recommended rules (includes vue-eslint-parser)
  ...vue.configs['flat/recommended'],

  // Accessibility rules for Vue templates
  ...vuejsAccessibility.configs['flat/recommended'],

  // Vue files: use typescript parser inside <script> blocks
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
    rules: {
      // no-useless-assignment doesn't see Vue template usage of <script> variables
      'no-useless-assignment': 'off',
    },
  },

  // Project-specific rule overrides
  {
    rules: {
      // Allow unused vars prefixed with _
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Allow `any` in stories and tests (common pattern)
      '@typescript-eslint/no-explicit-any': 'warn',
      // Vue component naming
      'vue/multi-word-component-names': 'off',
      // Allow v-bind with same-name shorthand
      'vue/attribute-hyphenation': ['error', 'always'],
    },
  },

  // Disable rules that conflict with Prettier (must be last)
  prettier,
)
