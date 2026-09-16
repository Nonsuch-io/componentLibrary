import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { QMenu } from 'quasar'
import NsTooltipDetails from './NsTooltipDetails.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleFrCA } from '../../locale/fr-CA'

// QMenu teleports the popup to document.body, so every test mounts the panel
// OPEN (`no-parent-event`: no anchor to listen to) and reads the live DOM.
describe('NsTooltipDetails', () => {
  let wrapper: VueWrapper | undefined

  const mountOpen = (options: Parameters<typeof mount>[1] = {}) => {
    wrapper = mount(NsTooltipDetails, {
      props: { modelValue: true },
      attrs: { 'no-parent-event': true },
      slots: { default: 'Enter the postal code for the card.' },
      attachTo: document.body,
      ...options,
    })
    return wrapper
  }

  const panel = () => document.querySelector('.ns-tooltip-details__panel')
  const closeButton = () =>
    panel()?.querySelector('.ns-tooltip-details__close') as HTMLElement | null

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  it('renders the slot as the panel text, in the popup', async () => {
    mountOpen()
    await nextTick()
    await nextTick()
    expect(panel()).not.toBeNull()
    expect(panel()!.closest('.q-menu')).not.toBeNull()
    expect(panel()!.querySelector('.ns-tooltip-details__text')!.textContent).toBe(
      'Enter the postal code for the card.',
    )
  })

  it('gives the popup its own class so the unscoped chrome rule can reach it', async () => {
    mountOpen()
    await nextTick()
    await nextTick()
    expect(panel()!.closest('.q-menu')!.classList.contains('ns-tooltip-details')).toBe(true)
  })

  it('renders nothing while closed', async () => {
    mountOpen({ props: { modelValue: false } })
    await nextTick()
    await nextTick()
    expect(panel()).toBeNull()
  })

  describe('the Close button', () => {
    it('is named from the locale', async () => {
      mountOpen()
      await nextTick()
      await nextTick()
      expect(closeButton()!.getAttribute('aria-label')).toBe('Close')
    })

    it('is named in French under the fr-CA locale', async () => {
      mountOpen({ global: { provide: { [NsLocaleKey as symbol]: nsLocaleFrCA } } })
      await nextTick()
      await nextTick()
      expect(closeButton()!.getAttribute('aria-label')).toBe('Fermer')
    })

    it("emits update:modelValue false — closing is the consumer's write", async () => {
      const w = mountOpen()
      await nextTick()
      await nextTick()
      closeButton()!.click()
      await nextTick()
      expect(w.emitted('update:modelValue')).toEqual([[false]])
    })
  })

  describe('attrs', () => {
    // The cap is QMenu's `max-width` PROP; its position engine writes it as an
    // inline style only while positioning against an anchor, which jsdom with
    // no anchor never does. The wiring is pinned here; the rendered 450 is the
    // LayoutIsReal story's, in Chromium.
    it('caps the popup at 450 by default and lets an attr override it', async () => {
      const w = mountOpen()
      expect(w.findComponent(QMenu).props('maxWidth')).toBe('450px')
      w.unmount()

      const narrow = mountOpen({ attrs: { 'no-parent-event': true, maxWidth: '300px' } })
      expect(narrow.findComponent(QMenu).props('maxWidth')).toBe('300px')
    })

    it('forwards the rest to the popup (anchor, offset, aria)', async () => {
      mountOpen({ attrs: { 'no-parent-event': true, 'aria-label': 'Postal code help' } })
      await nextTick()
      await nextTick()
      expect(panel()!.closest('.q-menu')!.getAttribute('aria-label')).toBe('Postal code help')
    })
  })
})
