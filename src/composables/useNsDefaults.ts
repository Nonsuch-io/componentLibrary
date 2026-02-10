import { computed, type ComputedRef } from 'vue'
import { useNsLocale } from './useNsLocale'

type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K
    }[keyof T & string]
  : never

/**
 * Resolve a user-visible string with the following priority:
 *   1. Explicit prop value (if not undefined/null)
 *   2. Injected Ns locale (via provideNsLocale)
 *   3. Built-in en-CA default
 *
 * Usage inside a component:
 *
 * ```ts
 * const props = defineProps<{ addToCartLabel?: string }>()
 * const addToCartText = useNsDefault(() => props.addToCartLabel, 'product.addToCart')
 * ```
 *
 * In the template: `{{ addToCartText }}`
 *
 * @param prop - Getter returning the optional prop value
 * @param localeKey - Dot-path key into NsLocaleMessages (e.g. 'product.addToCart')
 * @returns Computed string, always resolved
 */
export function useNsDefault<
  K extends NestedKeyOf<import('../locale/NsLocaleMessages').NsLocaleMessages>,
>(prop: () => string | undefined | null, localeKey: K): ComputedRef<string> {
  const locale = useNsLocale()

  return computed(() => {
    const propValue = prop()
    if (propValue != null) return propValue

    // Walk the dot-path to resolve the locale value
    const keys = (localeKey as string).split('.')
    let result: unknown = locale
    for (const key of keys) {
      result = (result as Record<string, unknown>)[key]
    }
    return result as string
  })
}
