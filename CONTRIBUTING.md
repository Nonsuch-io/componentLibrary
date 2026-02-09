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

```markdown
src/components/NsCard/
NsCard.vue # The component itself
NsCard.stories.ts # Visual examples for Storybook
NsCard.test.ts # Automated tests
index.ts # Re-export file
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
- Keep styles minimal — rely on Quasar's built-in theming where possible
- Avoid `!important` unless absolutely necessary

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

## Project Structure at a Glance

```markdown
src/
index.ts # Library entry — exports all components
components/
NsButton/
NsButton.vue # Component
NsButton.stories.ts # Storybook stories
NsButton.test.ts # Tests
index.ts # Re-export
NsCard/ # (your new component follows the same pattern)
...

.storybook/ # Storybook configuration
test/
setup.ts # Test setup (registers Quasar globally)
```

## Helpful Links

- [Quasar Component Docs](https://quasar.dev/vue-components) — reference for the components we're wrapping
- [Vue 3 Docs](https://vuejs.org/guide/introduction.html) — Vue fundamentals
- [Storybook Docs](https://storybook.js.org/docs) — how stories and addons work
- [Vitest Docs](https://vitest.dev/guide/) — testing framework
- [Live Storybook](https://nonsuch-io.github.io/componentLibrary/) — see the current components in action

## Questions?

If something in this guide is unclear, open an issue! We'd rather improve the docs than have someone stuck.
