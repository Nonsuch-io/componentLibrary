/**
 * Proof for componentLibrary-wer: a component genuinely resolves through
 * global registration, and — critically — the same template does NOT
 * resolve without the plugin, so this test can actually tell the
 * difference (it isn't structurally guaranteed to pass either way).
 *
 * `UnimportedKebabBanner.vue` uses `<ns-banner>` (kebab-case) and imports
 * NOTHING — this mirrors butiq's AutoPromotionsPage.vue exactly.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createNonsuch } from './plugin'
import { nsComponentRegistry } from './component-registry'
import UnimportedKebabBanner from './__fixtures__/UnimportedKebabBanner.vue'

describe('createNonsuch() global component registration', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('resolves an unimported <ns-banner> to the real NsBanner when the plugin is installed', () => {
    const wrapper = mount(UnimportedKebabBanner, {
      global: {
        plugins: [createNonsuch({ components: nsComponentRegistry })],
      },
    })

    // The real NsBanner renders `.ns-banner` (and a type-variant modifier
    // class) from its own <style scoped> block — an unresolved custom
    // element could never produce this, since NsBanner is the only thing
    // in the tree that knows to add it.
    const banner = wrapper.find('.ns-banner')
    expect(banner.exists()).toBe(true)
    expect(banner.classes()).toContain('ns-banner--error')
    // NsBanner derives role/aria-live from `type` — proof this is the real
    // component and not a coincidental div, and proof the a11y behaviour
    // the bug report says was lost is actually present.
    expect(banner.attributes('role')).toBe('alert')
    expect(banner.attributes('aria-live')).toBe('assertive')
    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('does NOT resolve <ns-banner> without the plugin — proving the assertion above can fail', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // No `createNonsuch()` in `global.plugins` here (test/setup.ts registers
    // only Quasar globally, which does not touch Ns component resolution).
    const wrapper = mount(UnimportedKebabBanner)

    // Real NsBanner never rendered: no `.ns-banner`, none of its
    // token-driven styling classes, none of the role/aria-live it derives.
    expect(wrapper.find('.ns-banner').exists()).toBe(false)
    expect(wrapper.attributes('role')).toBeUndefined()

    // Vue rendered the bare, unresolved tag as a literal (inert) element —
    // this is the actual symptom from the bug report: not a banner at all,
    // just a tag nobody recognizes.
    expect(wrapper.html()).toContain('<ns-banner')

    // And Vue's dev-mode warning fired, which is what the bug report says
    // consumers never see today for exactly this scenario.
    const warnedAboutUnresolvedBanner = warnSpy.mock.calls.some(
      (call) =>
        typeof call[0] === 'string' && call[0].includes('Failed to resolve component: ns-banner'),
    )
    expect(warnedAboutUnresolvedBanner).toBe(true)
  })
})
