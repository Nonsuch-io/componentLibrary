import type { App, Plugin } from 'vue'
import type { NsLocaleMessages } from './locale/NsLocaleMessages'
import { nsLocaleEnCA } from './locale/en-CA'
import { NsLocaleKey } from './composables/useNsLocale'
import { warnIfNsStylesheetMissing } from './composables/useNsStylesheetWarning'

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
  const { locale = nsLocaleEnCA } = options

  return {
    install(app: App) {
      // Provide locale messages to all Ns components via inject
      app.provide(NsLocaleKey, locale)

      // Dev-only, once-per-app check that the consumer actually loaded
      // `style.css`. See useNsStylesheetWarning.ts / componentLibrary-07u.
      warnIfNsStylesheetMissing()
    },
  }
}
