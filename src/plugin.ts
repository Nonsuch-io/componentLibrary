import type { App, Component, Plugin } from 'vue'
import type { NsLocaleMessages } from './locale/NsLocaleMessages'
import { nsLocaleEnCA } from './locale/en-CA'
import { NsLocaleKey } from './composables/useNsLocale'

/**
 * Options accepted by the `createNonsuch()` plugin.
 *
 * Every option has a sensible default — calling `app.use(createNonsuch())`
 * with no arguments is valid and gives you English (Canada) strings.
 */
export interface NsPluginOptions {
  /**
   * Locale messages provided to all Ns components.
   * @default nsLocaleEnCA
   */
  locale?: NsLocaleMessages
  /**
   * Components to register globally, so unimported `<ns-*>` tags resolve.
   *
   * PASS `nsComponentRegistry` TO OPT IN — the import is the opt-in, and your
   * bundler can see it. This replaced a `registerComponents: boolean`, which
   * could not work: the registry's 70 imports are static, so the flag gated
   * only the `app.component()` calls while every caller paid the bytes
   * regardless. Measured at 17.5 kB gzipped for `createNonsuch` alone.
   *
   *   import { createNonsuch, nsComponentRegistry } from '@nonsuch/component-library'
   *   app.use(createNonsuch({ components: nsComponentRegistry }))
   *
   * Omitted by default: without this, nothing is registered and an unimported
   * `<ns-*>` stays a LOUD "Failed to resolve component" warning rather than a
   * silent no-op. That warning is the only thing that surfaced butiq's 163
   * unresolved tags across three live pages, so it is worth keeping loud.
   */
  components?: Readonly<Record<string, Component>>
}

/**
 * Create the Nonsuch component-library Vue plugin.
 *
 * This is the recommended one-line setup for consuming apps:
 *
 * ```ts
 * import { createApp } from 'vue'
 * import { Quasar } from 'quasar'
 * import { createNonsuch } from '@nonsuch/component-library'
 * import '@nonsuch/component-library/tokens.css'
 *
 * const app = createApp(App)
 * app.use(Quasar, { plugins: {} })
 * app.use(createNonsuch())
 * ```
 *
 * With options:
 *
 * ```ts
 * import { createNonsuch, nsLocaleFrCA } from '@nonsuch/component-library'
 *
 * app.use(createNonsuch({
 *   locale: nsLocaleFrCA,
 * }))
 * ```
 */
export function createNonsuch(options: NsPluginOptions = {}): Plugin {
  const { locale = nsLocaleEnCA, components } = options

  return {
    install(app: App) {
      // Provide locale messages to all Ns components via inject
      app.provide(NsLocaleKey, locale)

      // Register every Ns* component globally, so unimported tags resolve.
      if (components) {
        for (const [name, component] of Object.entries(components)) {
          app.component(name, component)
        }
      }
    },
  }
}
