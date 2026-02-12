# @nonsuch/component-library

A Vue 3 component library built on top of [Quasar](https://quasar.dev), providing customized components with opinionated defaults.

**Quasar components you haven't customized are used directly** — this library only adds or overrides the ones with Nonsuch-specific styling and behavior. Tree-shaking is fully preserved.

## Installation

```bash
# Install the library and its peer dependencies
pnpm add @nonsuch/component-library
pnpm add quasar @quasar/extras @quasar/vite-plugin
```

### Quick Start (Recommended)

#### Vite Configuration

```ts
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue({ template: { transformAssetUrls } }), quasar()],
})
```

#### App Entry

```ts
import { createApp } from 'vue'
import { Quasar } from 'quasar'
import { createNonsuch, createQuasarConfig } from '@nonsuch/component-library'
import '@nonsuch/component-library/tokens.css'
import 'quasar/src/css/index.sass'

const app = createApp(App)
app.use(Quasar, createQuasarConfig()) // Token-aligned Quasar brand colours
app.use(createNonsuch()) // Locale + library setup
app.mount('#app')
```

That's it — components, tokens, locale (defaults to `en-CA`), and Quasar brand colours are all wired up.

#### Use Components

```vue
<script setup>
import { NsButton, NsInput, NsCard } from '@nonsuch/component-library'
</script>

<template>
  <NsCard title="Welcome">
    <NsInput v-model="name" label="Your name" />
    <template #actions>
      <NsButton label="Submit" />
    </template>
  </NsCard>
</template>
```

### Plugin Options

`createNonsuch()` accepts options for locale:

```ts
import { createNonsuch, nsLocaleFrCA } from '@nonsuch/component-library'

app.use(createNonsuch({ locale: nsLocaleFrCA }))
```

`createQuasarConfig()` accepts brand colour overrides and extra Quasar config:

```ts
import { createQuasarConfig } from '@nonsuch/component-library'

app.use(
  Quasar,
  createQuasarConfig({
    brand: { primary: '#1a73e8' },
    plugins: { Notify: {} },
  }),
)
```

### Dark Mode

```ts
import { useNsDarkMode } from '@nonsuch/component-library'

const { isDark, toggle, useSystem } = useNsDarkMode()
```

The composable persists the user's choice to `localStorage` and syncs with `prefers-color-scheme`. Design tokens switch automatically via the `dark` class on `<html>`.

### NsThemeProvider

For section-level locale overrides without a plugin:

```vue
<script setup>
import { NsThemeProvider, nsLocaleFrCA } from '@nonsuch/component-library'
</script>

<template>
  <NsThemeProvider :locale="nsLocaleFrCA">
    <!-- All Ns components here use French strings -->
  </NsThemeProvider>
</template>
```

### Manual Setup (Advanced)

### Fonts (Optional)

The library ships [Fixel](https://fixel.macpaw.com/) as the Nonsuch brand font with Roboto as a fallback. Three integration options:

**Option 1: Global CSS (recommended)** — makes Fixel the default for your entire app:

```ts
import '@nonsuch/component-library/fonts/global.css'
```

This loads all `@font-face` declarations and sets `Fixel Text` on `body` and `Fixel Display` on headings.

**Option 2: Font faces only** — load the fonts without applying them globally, then use them where you choose:

```ts
import '@nonsuch/component-library/fonts.css'
```

```css
.my-element {
  font-family: 'Fixel Text', 'Roboto', sans-serif;
}
```

**Option 3: Quasar Sass variables** — integrates with Quasar's typography system:

```sass
// src/quasar-variables.sass
@use '@nonsuch/component-library/fonts/quasar-overrides' as *
```

```ts
// vite.config.ts
quasar({ sassVariables: 'src/quasar-variables.sass' })
```

Or use Quasar components directly — they aren't re-exported through this library, so you import them from `quasar` as normal:

```ts
import { QInput, QSelect } from 'quasar'
```

### Translations (i18n)

The library ships its own locale system — **no dependency on vue-i18n**. Components that render user-visible text accept optional string props with built-in defaults from the active locale.

**Built-in locales:** `en-CA` (default) and `fr-CA`.

**Option 1: Use the defaults** — components use English (Canada) strings out of the box with no setup:

```vue
<NsButton>Add to cart</NsButton>
<!-- internal labels like loading text already default to English -->
```

**Option 2: Switch locale globally** — provide a locale pack at the app root:

```ts
import { createApp } from 'vue'
import { provideNsLocale, nsLocaleFrCA } from '@nonsuch/component-library'

const app = createApp(App)

// Inside your root component's setup():
provideNsLocale(nsLocaleFrCA)
```

**Option 3: Custom / partial locale** — supply your own translations by implementing the `NsLocaleMessages` interface:

```ts
import type { NsLocaleMessages } from '@nonsuch/component-library'
import { nsLocaleEnCA, provideNsLocale } from '@nonsuch/component-library'

const myLocale: NsLocaleMessages = {
  ...nsLocaleEnCA,
  product: {
    ...nsLocaleEnCA.product,
    addToCart: 'Add to bag', // override just what you need
  },
}

provideNsLocale(myLocale)
```

**Option 4: Override per-component** — pass a string prop directly to bypass the locale:

```vue
<!-- This label is always "Ajouter" regardless of the active locale -->
<NsButton label="Ajouter" />
```

The locale interface covers four sections: `common`, `product`, `media`, and `validation`. See the full type in `NsLocaleMessages`.

### Design Tokens (Optional)

Import CSS custom properties for colours, typography, spacing, border-radius, shadows, and motion:

```ts
import '@nonsuch/component-library/tokens.css'
```

All tokens use the `--ns-` prefix and support light/dark mode automatically. Current values are placeholders — token names are stable.

```css
.my-card {
  border-radius: var(--ns-radius-md);
  box-shadow: var(--ns-shadow-sm);
  padding: var(--ns-space-4);
}
```

Dark mode activates via `class="dark"`, `data-theme="dark"`, Quasar's `.q-dark`, or `prefers-color-scheme: dark`.

## Development

```bash
# Install dependencies
pnpm install

# Run Storybook (dev mode)
pnpm dev

# Run tests
pnpm test
pnpm test:watch

# Build the library
pnpm build

# Build Storybook for deployment
pnpm build:storybook
```

## Project Structure

```markdown
src/
index.ts # Library entry — exports all public API
plugin.ts # createNonsuch() Vue plugin
quasarConfig.ts # createQuasarConfig() helper
components/
NsButton/ # Styled QBtn wrapper
NsCard/ # Card with title/subtitle/actions slots
NsInput/ # Styled QInput wrapper
NsSkeleton/ # Loading skeleton with animation
NsThemeProvider/ # Renderless locale provider
composables/
useNsLocale.ts # Locale injection/provision
useNsDarkMode.ts # Dark mode with persistence
useNsDefaults.ts # Default value helper
locale/ # en-CA, fr-CA string packs
tokens/ # Design token CSS + TS helpers
fonts/ # Fixel font files + CSS
```

Each custom component lives in its own directory with co-located story and test files. The `Ns` prefix distinguishes library components from Quasar's `Q` prefix.

## Adding a New Component

1. Create `src/components/NsMyComponent/NsMyComponent.vue`
2. Add a story: `NsMyComponent.stories.ts`
3. Add tests: `NsMyComponent.test.ts`
4. Add a re-export: `index.ts`
5. Export from `src/index.ts`

## Architecture

- **Quasar is a peer dependency** — consumers install it normally and get full tree-shaking via `@quasar/vite-plugin`
- **Custom components compose Quasar** — they wrap or extend Quasar components with opinionated defaults
- **Vite library mode** — builds to ES modules with externalized `vue` and `quasar`
- **TypeScript** — strict mode with emitted `.d.ts` declarations

## Contributing

Want to add or improve components? Check out [CONTRIBUTING.md](./CONTRIBUTING.md) for a friendly step-by-step guide — no deep Vue experience required!

## License

MIT — see [LICENSE](./LICENSE)
