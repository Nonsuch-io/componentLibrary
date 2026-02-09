# @nonsuch/component-library

A Vue 3 component library built on top of [Quasar](https://quasar.dev), providing customized components with opinionated defaults.

**Quasar components you haven't customized are used directly** — this library only adds or overrides the ones with Nonsuch-specific styling and behavior. Tree-shaking is fully preserved.

## Installation

```bash
# Install the library and its peer dependencies
pnpm add @nonsuch/component-library
pnpm add quasar @quasar/extras @quasar/vite-plugin
```

### Vite Configuration

In your `vite.config.ts`, register the Quasar Vite plugin as usual:

```ts
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue({ template: { transformAssetUrls } }), quasar()],
})
```

### App Entry

Register Quasar in your Vue app:

```ts
import { createApp } from 'vue'
import { Quasar } from 'quasar'
import 'quasar/src/css/index.sass'

const app = createApp(App)
app.use(Quasar, { plugins: {} })
```

Then import custom components as needed:

```ts
import { NsButton } from '@nonsuch/component-library'
```

Or use Quasar components directly — they aren't re-exported through this library, so you import them from `quasar` as normal:

```ts
import { QInput, QSelect } from 'quasar'
```

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
index.ts # Library entry — exports all custom components
components/
NsButton/
NsButton.vue # Component implementation
NsButton.stories.ts # Storybook story
NsButton.test.ts # Vitest unit test
index.ts # Re-export
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
