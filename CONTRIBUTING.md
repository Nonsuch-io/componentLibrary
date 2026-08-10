# Contributing to @nonsuch/component-library

Welcome! Whether you're a developer, designer, or just getting started with code — we're glad you're here. This guide will walk you through everything you need to add or update components in this library.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22 or later)
- [pnpm](https://pnpm.io/) (v10 or later) — our package manager

### Setup

```bash
# Clone the repo
git clone https://github.com/Nonsuch-io/componentLibrary.git
cd componentLibrary

# Install dependencies
pnpm install

# Start Storybook (your visual dev environment)
pnpm dev
```

Storybook will open at [http://localhost:6006](http://localhost:6006). This is where you'll see your components rendered live as you work.

## How This Library Works

We build on top of [Quasar](https://quasar.dev) — a popular Vue component framework. Our library **wraps** Quasar components with Nonsuch-specific defaults and styles. We prefix ours with `Ns` (so Quasar's `QBtn` becomes our `NsButton`).

**The key idea:** if we haven't customized a Quasar component, consumers use it directly from Quasar. We only add components where we need Nonsuch-specific behavior or styling.

## Adding a New Component

This is the most common task. Let's say you want to add an `NsCard` component.

### 1. Create the component folder

```text
src/components/NsCard/
  NsCard.vue            # The component itself
  NsCard.stories.ts     # Visual examples for Storybook
  NsCard.test.ts        # Automated tests
  index.ts              # Re-export file
```

### 2. Write the component (`NsCard.vue`)

Here's the pattern — wrap a Quasar component, set your defaults, and pass everything else through:

```vue
<template>
  <q-card v-bind="$attrs" class="ns-card">
    <slot />
  </q-card>
</template>

<script setup lang="ts">
/**
 * NsCard - A styled card wrapping Quasar's QCard.
 *
 * Write a short description of what makes this component
 * different from using QCard directly.
 */

export interface NsCardProps {
  /** Describe each prop clearly */
  bordered?: boolean
}

withDefaults(defineProps<NsCardProps>(), {
  bordered: true,
})
</script>

<style lang="sass" scoped>
.ns-card
  // Add Nonsuch-specific styles here
  border-radius: 12px
</style>
```

**Key patterns to follow:**

| Pattern                           | What it means                                       | Why                                                                     |
| --------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------- |
| `v-bind="$attrs"`                 | Passes all extra attributes to the Quasar component | Consumers can use any QCard prop without us explicitly listing each one |
| `<slot />`                        | Passes content through                              | Consumers put whatever they want inside the component                   |
| `withDefaults(...)`               | Sets our opinionated defaults                       | This is the whole reason the wrapper exists                             |
| `export interface`                | Typed props                                         | Gives consumers autocomplete and documentation                          |
| `scoped` styles with `ns-` prefix | Scoped CSS class                                    | Avoids style conflicts                                                  |

### 3. Add a story (`NsCard.stories.ts`)

Stories are visual examples that show up in Storybook. Think of them as a living gallery of your component's variations.

```ts
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsCard from './NsCard.vue'

const meta = {
  title: 'Components/NsCard',
  component: NsCard,
  tags: ['autodocs'], // Auto-generates a docs page
  argTypes: {
    bordered: {
      control: 'boolean',
      description: 'Show a border around the card',
    },
  },
} satisfies Meta<typeof NsCard>

export default meta
type Story = StoryObj<typeof meta>

// A basic example
export const Default: Story = {
  render: (args) => ({
    components: { NsCard },
    setup() {
      return { args }
    },
    template: '<NsCard v-bind="args">Hello from NsCard!</NsCard>',
  }),
}

// Show multiple variations together
export const Variations: Story = {
  render: () => ({
    components: { NsCard },
    template: `
      <div style="display: flex; gap: 16px;">
        <NsCard>Default</NsCard>
        <NsCard :bordered="false">No border</NsCard>
      </div>
    `,
  }),
}
```

**Tips for great stories:**

- Start with a `Default` story that shows the most common usage
- Add a story for each meaningful variation (sizes, colors, states)
- Use `tags: ['autodocs']` to auto-generate a docs page
- Write clear `description` text in `argTypes` — designers and other contributors will read these

### 4. Add tests (`NsCard.test.ts`)

Tests verify your component works correctly. They're simpler than you might think:

```ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsCard from './NsCard.vue'

describe('NsCard', () => {
  it('renders slot content', () => {
    const wrapper = mount(NsCard, {
      slots: { default: 'Hello' },
    })
    expect(wrapper.text()).toContain('Hello')
  })

  it('applies default props', () => {
    const wrapper = mount(NsCard)
    const card = wrapper.find('.q-card')
    expect(card.exists()).toBe(true)
  })

  it('passes through QCard attributes', () => {
    const wrapper = mount(NsCard, {
      props: { flat: true },
    })
    const card = wrapper.find('.q-card')
    expect(card.classes()).toContain('q-card--flat')
  })
})
```

**What to test:**

- Slot content renders
- Default props are applied
- Extra attributes pass through to the Quasar component
- Any custom behavior unique to your component

### 5. Create the re-export (`index.ts`)

```ts
export { default as NsCard } from './NsCard.vue'
```

### 6. Export from the library entry point

Add your component to [src/index.ts](src/index.ts):

```ts
export { default as NsButton } from './components/NsButton/NsButton.vue'
export { default as NsCard } from './components/NsCard/NsCard.vue' // ← add this
```

### 7. Verify everything works

```bash
# Check your component in Storybook
pnpm dev

# Run all the checks
pnpm lint        # Code style
pnpm typecheck   # TypeScript errors
pnpm test        # Unit tests
pnpm build       # Production build
```

All four must pass before your changes can be merged.

## Component Design Guidelines

### Naming

- Always use the `Ns` prefix: `NsButton`, `NsCard`, `NsDialog`
- Match the Quasar component name where possible: `QBtn` → `NsButton`, `QCard` → `NsCard`
- Use PascalCase for component names and filenames

### When to wrap a Quasar component

Ask yourself: **"Does this component need Nonsuch-specific defaults, styles, or behavior?"**

- **Yes** → Create an `Ns` wrapper
- **No** → Consumers just use the Quasar component directly. No wrapper needed!

### Props

- Only declare props your wrapper actually uses (typically for setting defaults)
- Let `v-bind="$attrs"` handle everything else — this keeps your component flexible
- Use TypeScript interfaces with JSDoc comments so IDE autocomplete works nicely
- Always provide sensible defaults with `withDefaults()`

### Slots

- Always include `<slot />` so consumers can pass content through
- If wrapping a component with named slots (like `QCard` with `#header`), pass those through too:

```vue
<template>
  <q-card v-bind="$attrs" class="ns-card">
    <slot name="header" />
    <slot />
    <slot name="actions" />
  </q-card>
</template>
```

### Styles

- Use `<style lang="sass" scoped>` to avoid leaking styles
- Prefix custom classes with `ns-` (e.g., `.ns-card`, `.ns-button`)
- **Use design tokens** (`var(--ns-*)`) instead of hardcoded values — see [Design Tokens](#design-tokens) below
- Keep styles minimal — rely on Quasar's built-in theming where possible
- Avoid `!important` unless absolutely necessary

### Design Tokens

We use CSS custom properties (prefixed `--ns-`) for all shared design values. This keeps components consistent and makes future theming/dark-mode trivial.

**Importing tokens in a consumer app:**

```ts
import '@nonsuch/component-library/tokens.css'
```

**Using tokens in component styles:**

```sass
.ns-card
  border-radius: var(--ns-radius-md)
  box-shadow: var(--ns-shadow-sm)
  font-family: var(--ns-font-family-text)
  padding: var(--ns-space-4)
```

**Token categories:** colours, typography, spacing (4px grid), border-radius, shadows, motion/transitions.

**Naming convention:** `--ns-{category}-{name}` — e.g. `--ns-color-primary`, `--ns-font-size-lg`, `--ns-space-4`.

**Dark mode:** Dark variants are defined under `:root.dark`, `[data-theme="dark"]`, `.q-dark`, and `@media (prefers-color-scheme: dark)`. Only colour and shadow tokens change between modes.

**Adding a new token:**

1. Add the custom property to `src/tokens/tokens.css` under `:root` (and the dark selectors if it's a colour/shadow)
2. Add the name to the `NsToken` union type in `src/tokens/index.ts`
3. Add a test assertion in `src/tokens/tokens.test.ts`
4. Update the Storybook Design Tokens page if it's a new category

> **Note:** Current token values are **placeholders**. Token _names_ are stable — values will be updated when brand designs are finalised.

### Fonts

We use [Fixel](https://fixel.macpaw.com/) as the Nonsuch brand font with Roboto as fallback. When styling components, use design tokens:

```sass
.ns-my-component
  font-family: var(--ns-font-family-text)
```

For headings or large display text, use the display token:

```sass
.ns-hero-title
  font-family: var(--ns-font-family-display)
```

Font files live in `fonts/files/` — see the README there for details on adding weights.

### Strings & i18n

The library **does not depend on vue-i18n**. Instead we follow the same pattern as Quasar, Vuetify, and PrimeVue — we ship our own locale system and let consuming apps integrate it.

**The rule:** Every user-visible string a component introduces should:

1. Be accepted as an **optional prop** (highest priority)
2. Fall back to the **injected Ns locale** (via `provideNsLocale`)
3. Fall back to the **built-in English default** (`nsLocaleEnCA`)

For Quasar-originated strings (e.g. "Close", "Clear"), use `$q.lang.*` directly — don't duplicate them.

**Adding a new Ns string:**

1. Add the key to the `NsLocaleMessages` interface in `src/locale/NsLocaleMessages.ts`
2. Add the English default to `src/locale/en-CA.ts` (and French to `src/locale/fr-CA.ts`)
3. In your component, use the `useNsDefault` composable:

```ts
import { useNsDefault } from '../../composables/useNsDefaults'

const props = defineProps<{ addToCartLabel?: string }>()
const addToCartText = useNsDefault(() => props.addToCartLabel, 'product.addToCart')
// In the template: {{ addToCartText }}
```

**Consuming apps** provide translations like this:

```ts
import { provideNsLocale } from '@nonsuch/component-library'
provideNsLocale(myFrenchLocale)
```

Or pass translated strings directly as props: `<NsProductCard add-to-cart-label="Ajouter" />`.

### RTL Support

We use `postcss-rtlcss` to generate `[dir=rtl]` CSS variants in the build output. Quasar activates RTL automatically when an RTL language pack is loaded.

**When writing component CSS:**

- **Prefer logical properties** over physical ones:
  - `margin-inline-start` instead of `margin-left`
  - `padding-inline-end` instead of `padding-right`
  - `inset-inline-start` instead of `left`
  - `border-inline-start` instead of `border-left`
- If you must use physical properties, `postcss-rtlcss` will auto-generate RTL variants
- To opt a rule out of RTL flipping, add `/* rtl:ignore */`:

```sass
.ns-my-component
  margin-left: 10px /* rtl:ignore */
```

- For directional icons, check `$q.lang.rtl` to flip them
- Test your component in the **Utilities / RTL Support** Storybook page

### Accessibility (a11y)

Every component should be usable by everyone, including people who rely on screen readers, keyboard navigation, or other assistive technologies. We enforce this at three levels:

**1. Lint-time** — `eslint-plugin-vuejs-accessibility` runs as part of `pnpm lint` and catches common issues (missing `alt` attributes, missing `label` associations, etc.).

**2. Storybook** — The `@storybook/addon-a11y` panel (visible in the bottom panel when running Storybook) runs axe-core against every story automatically. Check it when building new stories.

**3. Unit tests** — Each component has an `accessibility` describe block in its test file verifying the correct ARIA attributes are rendered.

**When writing a new component, follow these patterns:**

| Situation                     | What to add                                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Dialogs / modals**          | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the title, `aria-describedby` pointing to the body  |
| **Status banners**            | `role="status"` + `aria-live="polite"` for info/positive; `role="alert"` + `aria-live="assertive"` for warning/negative |
| **Loading states**            | `aria-busy="true"` on the element while loading                                                                         |
| **Decorative elements**       | `aria-hidden="true"` (skeletons, decorative avatars/icons)                                                              |
| **Meaningful images / icons** | `role="img"` + `aria-label="Description"`                                                                               |
| **Named regions**             | `role="region"` + `aria-labelledby` pointing to the heading `id`                                                        |
| **Lists**                     | `role="list"` and optionally `aria-label`                                                                               |
| **Toggle switches**           | `role="switch"` + `aria-checked`                                                                                        |
| **Forms**                     | Accept an `ariaLabel` prop that maps to `aria-label` on the `<form>`                                                    |

**Tips:**

- Use Vue's `useId()` to generate unique IDs for `aria-labelledby` / `aria-describedby` links
- Expose an `ariaLabel` prop (not `aria-label`) — Vue converts camelCase props to kebab-case attributes automatically
- When an element is purely decorative, hide it from screen readers with `aria-hidden="true"`
- Test with the Storybook a11y panel; fix all "Violations" before merging

## Running Quality Checks

Before opening a pull request, make sure everything passes:

```bash
pnpm lint          # Checks code style (ESLint)
pnpm format:check  # Checks formatting (Prettier)
pnpm typecheck     # Checks TypeScript types
pnpm test          # Runs unit tests
pnpm build         # Builds the library
```

**Quick fix commands:**

```bash
pnpm lint:fix      # Auto-fix lint issues
pnpm format        # Auto-format all files
```

## Releasing a New Version

Publishing to npm is fully automated via GitHub Actions using
[Trusted Publishing](https://docs.npmjs.com/trusted-publishers) (OIDC — no tokens or secrets needed).

### Steps

1. **Make sure `main` is clean** — all quality checks should pass.

2. **Bump the version** in `package.json` following [semver](https://semver.org/):
   - **Patch** (`0.2.1` → `0.2.2`) — bug fixes
   - **Minor** (`0.2.2` → `0.3.0`) — new components or features (backwards-compatible)
   - **Major** (`0.3.0` → `1.0.0`) — breaking API changes

3. **Commit, tag, and push:**

   ```bash
   git add package.json
   git commit -m "release: v0.3.0"
   git tag v0.3.0
   git push && git push origin v0.3.0
   ```

4. **The `Publish` workflow runs automatically** when the `v*` tag is pushed. It
   builds the library and publishes to npm under `@nonsuch/component-library`.

5. **Verify** the new version on [npmjs.com](https://www.npmjs.com/package/@nonsuch/component-library).

### What if the publish fails?

Check the [Actions tab](https://github.com/Nonsuch-io/componentLibrary/actions) for logs. Common issues:

- **Version already exists** — you need to bump to a new version number.
- **Authentication error** — verify the Trusted Publisher config on npmjs.com matches
  the workflow filename (`publish.yml`), org (`Nonsuch-io`), and repo (`componentLibrary`).

## Project Structure at a Glance

```text
src/
  index.ts                        # Library entry — exports all components
  components/
    NsButton/
      NsButton.vue                # Component
      NsButton.stories.ts         # Storybook stories
      NsButton.test.ts            # Tests
      index.ts                    # Re-export
    NsCard/                       # (your new component follows the same pattern)
      ...

.storybook/                       # Storybook configuration
fonts/
  fonts.css                       # @font-face declarations
  files/                          # .woff2 font files (Fixel)
test/
  setup.ts                        # Test setup (registers Quasar globally)
```

## Helpful Links

- [Quasar Component Docs](https://quasar.dev/vue-components) — reference for the components we're wrapping
- [Vue 3 Docs](https://vuejs.org/guide/introduction.html) — Vue fundamentals
- [Storybook Docs](https://storybook.js.org/docs) — how stories and addons work
- [Vitest Docs](https://vitest.dev/guide/) — testing framework
- [Live Storybook](https://nonsuch-io.github.io/componentLibrary/) — see the current components in action

## Questions?

If something in this guide is unclear, open an issue! We'd rather improve the docs than have someone stuck.

---

## Keeping Consuming Apps in Sync

The library ships a **component manifest** (`src/manifest.ts`) that maps every Quasar component name to its Nonsuch wrapper. This enables automated enforcement in consuming apps so raw Quasar usage doesn't creep back in once an Ns equivalent exists.

### What the manifest provides

| Export                     | Purpose                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `nsComponentManifest`      | `Record<string, string>` — PascalCase Quasar name → Ns name (e.g. `QBtn` → `NsButton`) |
| `nsTemplateTagManifest`    | Same mapping as kebab-case tags (e.g. `q-btn` → `ns-button`)                           |
| `generateQuasarBanRules()` | Returns an array ready to plug into `vue/no-restricted-html-elements`                  |

### Template-level enforcement (recommended)

In the consuming app's `eslint.config.js`:

```js
import { generateQuasarBanRules } from '@nonsuch/components'

export default [
  // ...your other configs
  {
    rules: {
      'vue/no-restricted-html-elements': ['error', ...generateQuasarBanRules()],
    },
  },
]
```

This will flag any `<q-btn>`, `<q-card>`, etc. in templates when an `<ns-button>`, `<ns-card>` equivalent is available, with a message pointing to the correct Ns component.

### Import-level enforcement

Ban direct Quasar component imports for wrapped components:

```js
{
  rules: {
    'no-restricted-imports': ['error', {
      paths: [{
        name: 'quasar',
        importNames: Object.keys(nsComponentManifest),
        message: 'Import the Ns wrapper from @nonsuch/components instead.',
      }],
    }],
  },
}
```

### CI grep check (lightweight alternative)

For teams that want a quick check without ESLint changes:

```bash
# Fail CI if any raw Quasar tags are used when Ns equivalents exist
node -e "
  const { nsTemplateTagManifest } = require('@nonsuch/components');
  const tags = Object.keys(nsTemplateTagManifest).join('|');
  console.log(tags);
" | xargs -I{} grep -rn --include='*.vue' -E '<({})[\\s>/]' src/
```

### Keeping the manifest up to date

When you add a new component wrapper to this library:

1. Add the `QXxx: 'NsXxx'` entry to `nsComponentManifest` in `src/manifest.ts`
2. The kebab-case mapping and ESLint rule generator update automatically
3. Consuming apps pick up the new rule on their next library version bump
