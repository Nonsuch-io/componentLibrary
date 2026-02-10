import { inject, provide, type InjectionKey } from 'vue'
import type { NsLocaleMessages } from '../locale/NsLocaleMessages'
import { nsLocaleEnCA } from '../locale/en-CA'

/**
 * Injection key for the Ns locale messages.
 * Components use this internally — consumers call provideNsLocale().
 */
export const NsLocaleKey: InjectionKey<NsLocaleMessages> = Symbol('ns-locale')

/**
 * Provide Ns locale messages to all descendant Ns components.
 *
 * Call this in your app's root setup (e.g. App.vue or a boot file):
 *
 * ```ts
 * import { provideNsLocale } from '@nonsuch/component-library'
 * import { myFrenchLocale } from './locales/fr'
 *
 * // In setup()
 * provideNsLocale(myFrenchLocale)
 * ```
 */
export function provideNsLocale(messages: NsLocaleMessages): void {
  provide(NsLocaleKey, messages)
}

/**
 * Internal composable — used by Ns components to read locale strings.
 *
 * Returns the injected locale or falls back to en-CA defaults.
 * Components should NOT re-export this — it's an implementation detail.
 */
export function useNsLocale(): NsLocaleMessages {
  return inject(NsLocaleKey, nsLocaleEnCA)
}
