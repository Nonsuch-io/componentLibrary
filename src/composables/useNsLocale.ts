import { inject, provide, type InjectionKey } from 'vue'
import type { NsLocaleMessages } from '../locale/NsLocaleMessages'
import { nsLocaleEnCA } from '../locale/en-CA'

/**
 * Namespaced so the global symbol registry cannot collide with an unrelated
 * package that also reaches for 'ns-locale'. The string is the identity — it
 * must stay stable across versions and across BOTH published package names, or
 * the two copies stop matching and this fix stops working.
 */
const NS_LOCALE_KEY_ID = '@nonsuch/ns-locale'

/**
 * Injection key for the Ns locale messages.
 * Components use this internally — consumers call provideNsLocale().
 *
 * `Symbol.for`, NOT `Symbol`. A bare Symbol() mints a new one per module
 * INSTANCE, so two copies of this library in one app — which is exactly what
 * the @nonsuch/component-library to @nonsuch/uniq dual-publish creates — mint
 * two different keys. An app that provides from one specifier and injects from
 * the other gets undefined back.
 *
 * It does not throw. It falls through to the default en-CA strings and renders
 * correctly, so a half-migrated app silently serves English to fr-CA users.
 * The global registry is keyed by the string, so both copies resolve to the
 * same symbol and partial migration is safe. Found by butiq-agent reviewing the
 * rename contract. Story: componentLibrary-b5h.4.
 */
export const NsLocaleKey: InjectionKey<NsLocaleMessages> = Symbol.for(NS_LOCALE_KEY_ID)

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
