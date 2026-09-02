import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, provide } from 'vue'
import { NsLocaleKey, provideNsLocale, useNsLocale } from './useNsLocale'
import { nsLocaleEnCA } from '../locale/en-CA'
import type { NsLocaleMessages } from '../locale/NsLocaleMessages'

/**
 * THE KEY MUST SURVIVE TWO COPIES OF THIS LIBRARY IN ONE APP.
 *
 * The @nonsuch/component-library -> @nonsuch/uniq dual-publish puts two copies
 * of this module in a consumer's graph on purpose, for as long as butiq needs
 * to migrate. A bare `Symbol()` mints one key per module INSTANCE, so provide
 * from one specifier and inject from the other silently misses: inject returns
 * the en-CA fallback, the app renders correctly, and fr-CA users quietly read
 * English. Nothing throws.
 *
 * Found by butiq-agent reviewing the rename contract, in our source rather than
 * theirs. Story: componentLibrary-b5h.4.
 */
describe('NsLocaleKey survives a second copy of the library (componentLibrary-b5h.4)', () => {
  const fr: NsLocaleMessages = {
    ...nsLocaleEnCA,
    common: { ...nsLocaleEnCA.common, loading: 'Chargement…' },
  }

  it('is registry-backed, not module-local', () => {
    // Reverting to Symbol('…') fails here: a fresh Symbol is never === the
    // registry entry for the same description.
    expect(NsLocaleKey).toBe(Symbol.for('@nonsuch/ns-locale'))
  })

  it('receives a value provided by a SEPARATE copy of the library', () => {
    // This is the dual-publish scenario in miniature. The parent provides using
    // a key it minted independently — standing in for the other published
    // package — and the child injects through OUR module's key. They must be
    // the same symbol for this to work.
    const otherCopysKey = Symbol.for('@nonsuch/ns-locale')
    expect(otherCopysKey).not.toBe(Symbol('@nonsuch/ns-locale')) // sanity: bare Symbol differs

    const Child = defineComponent({
      setup: () => {
        const locale = useNsLocale()
        return () => h('span', locale.common.loading)
      },
    })
    const Parent = defineComponent({
      setup: () => {
        provide(otherCopysKey, fr)
        return () => h(Child)
      },
    })

    expect(mount(Parent).text()).toBe('Chargement…')
  })

  it('still falls back to en-CA when nothing is provided', () => {
    // The fix must not turn a missing provide into a crash — the fallback is
    // the documented behaviour for consumers who never call provideNsLocale.
    const Child = defineComponent({
      setup: () => {
        const locale = useNsLocale()
        return () => h('span', locale.common.loading)
      },
    })
    expect(mount(Child).text()).toBe(nsLocaleEnCA.common.loading)
  })

  it('provideNsLocale still works normally within one copy', () => {
    const Child = defineComponent({
      setup: () => {
        const locale = useNsLocale()
        return () => h('span', locale.common.loading)
      },
    })
    const Parent = defineComponent({
      setup: () => {
        provideNsLocale(fr)
        return () => h(Child)
      },
    })
    expect(mount(Parent).text()).toBe('Chargement…')
  })
})
