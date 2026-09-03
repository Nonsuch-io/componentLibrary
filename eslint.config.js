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
      // Isolated reviewer worktrees are full copies of this repo living INSIDE
      // it. Gitignored, but eslint does not read .gitignore — so without this
      // every file is linted once per live worktree. Measured: 45 problems with
      // three present, 15 after pruning.
      //
      // NARROW ON PURPOSE. The first version of this ignored all of `.claude/`,
      // which also silently dropped five tracked files (settings.json, the agent
      // briefs, the skills) that prettier had genuinely been checking — a
      // quality gate quietly narrowed, which is the failure this repo names
      // switchboard-87q. `worktrees/` suppresses the duplication just as
      // completely. componentLibrary-o0n.
      '.claude/worktrees/',
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
      // ACCEPT for/id AS A VALID LABEL ASSOCIATION, not just nesting.
      //
      // The rule's default demands the control be NESTED inside the <label>.
      // That is one valid association; `for`/`id` is the other, and it is the
      // one NsInput needs — the label sits above a QInput whose native <input>
      // is several elements deep inside Quasar's markup, so wrapping is not
      // available to us.
      //
      // Narrowed rather than disabled: a label with NEITHER is still an error,
      // which is the case that actually matters. NsInput's association is also
      // asserted directly in its tests (for and id must match), because a lint
      // rule cannot tell whether the id it sees is the right one.
      // componentLibrary-eag.
      'vuejs-accessibility/label-has-for': ['error', { required: { some: ['nesting', 'id'] } }],
    },
  },

  // Disable rules that conflict with Prettier (must be last)
  prettier,
)
