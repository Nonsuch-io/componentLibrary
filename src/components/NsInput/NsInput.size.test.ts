import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import NsInput from './NsInput.vue'

/**
 * componentLibrary-b5e — Figma specifies three sizes (Dense 38px / Default 50px
 * / Large 120px) and the code had a `dense` boolean, which cannot carry three
 * states.
 *
 * NOTHING HERE ASSERTS A COMPUTED HEIGHT, deliberately. jsdom has no layout
 * engine and loads no stylesheet, so `getComputedStyle(...).height` returns the
 * same value whether the CSS exists or not — a test that passes on the bug. Two
 * of three tests I wrote for NsTooltip failed exactly that way. So: behaviour is
 * asserted through what reaches QInput, and the measurements are asserted
 * against the style block's SOURCE, which is the thing that would actually be
 * deleted or mistyped.
 */
const SFC = readFileSync(resolve(__dirname, 'NsInput.vue'), 'utf-8')

describe('NsInput size (componentLibrary-b5e)', () => {
  afterEach(() => vi.restoreAllMocks())

  describe('what reaches QInput', () => {
    it('size="dense" makes the field dense', () => {
      const wrapper = mount(NsInput, { props: { size: 'dense' } })
      expect(wrapper.find('.q-field--dense').exists()).toBe(true)
      expect(wrapper.find('.ns-input--dense').exists()).toBe(true)
    })

    it('size="default" is NOT dense, even though `dense` defaults to false', () => {
      // Weak on its own — it would pass with `size` doing nothing at all. It
      // earns its place next to the override test below, which pins the case
      // where the two disagree.
      const wrapper = mount(NsInput, { props: { size: 'default' } })
      expect(wrapper.find('.q-field--dense').exists()).toBe(false)
      expect(wrapper.find('.ns-input--default').exists()).toBe(true)
    })

    it('size="large" renders a TEXTAREA, not a tall single-line box', () => {
      // The measurement is only half of Large. A 120px field that still accepts
      // one line satisfies the height and misses the intent entirely — the
      // design's Large IS the prose field (identical type/padding/colour tokens
      // to Default; only height moves).
      const wrapper = mount(NsInput, { props: { size: 'large' } })
      expect(wrapper.find('textarea').exists()).toBe(true)
      expect(wrapper.find('.ns-input--large').exists()).toBe(true)
    })

    it("an explicit `type` beats large's textarea, because that is the consumer's call", () => {
      const wrapper = mount(NsInput, { props: { size: 'large' }, attrs: { type: 'number' } })
      expect(wrapper.find('textarea').exists()).toBe(false)
      expect(wrapper.find('input[type="number"]').exists()).toBe(true)
    })
  })

  describe('backwards compatibility — 369 call sites predate this prop', () => {
    it('no `size` renders exactly what it did before: dense follows the old prop', () => {
      expect(
        mount(NsInput, { props: { dense: true } })
          .find('.q-field--dense')
          .exists(),
      ).toBe(true)
      expect(
        mount(NsInput, { props: { dense: false } })
          .find('.q-field--dense')
          .exists(),
      ).toBe(false)
    })

    it('adds NO size class when `size` is absent, so unsized inputs keep Quasar metrics', () => {
      // The load-bearing half of the opt-in decision. Quasar's control is 56px
      // and Figma's Default is 50px; if an unsized input picked up
      // .ns-input--default it would silently restyle every form in the consumer.
      const html = mount(NsInput, { props: { dense: true } }).html()
      expect(html).not.toContain('ns-input--')
    })

    it('`size` wins over `dense` when they disagree, and says so', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = mount(NsInput, { props: { dense: true, size: 'large' } })
      expect(wrapper.find('.q-field--dense').exists()).toBe(false)
      expect(warn.mock.calls.flat().join(' ')).toContain('`dense` and `size` were both set')
    })

    it('does not warn when only one of them is used', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount(NsInput, { props: { dense: true } })
      mount(NsInput, { props: { size: 'large' } })
      expect(warn.mock.calls.flat().join(' ')).not.toContain('were both set')
    })
  })

  describe("the measurements themselves, asserted where they'd actually break", () => {
    it.each([
      ['dense', '38px'],
      ['default', '50px'],
    ])("%s pins Figma's %s on .q-field__control", (size, height) => {
      const block = SFC.slice(SFC.indexOf(`&--${size}`))
      expect(block.slice(0, 160)).toContain(`min-height: ${height}`)
    })

    it('large uses min-height only, so autogrow is not capped', () => {
      const block = SFC.slice(SFC.indexOf('&--large'), SFC.indexOf('&--large') + 400)
      expect(block).toContain('min-height: 120px')
      // `height: auto` matters: a fixed 120px height on a textarea clips the
      // prose the field exists to hold, and the clipping only appears once a
      // user types past four lines — invisible to every test that renders empty.
      expect(block).toContain('height: auto')
      // `[^-]` matters: `min-height: 120px` contains the substring `height: 120px`,
      // so the naive negation failed against correct code. A wrong assertion that
      // fails is cheap; the same mistake inverted would have passed on a fixed height.
      expect(block).not.toMatch(/[^-]height: 120px/)
    })

    it('defines exactly the three sizes Figma specifies — no more, no fewer', () => {
      const sizes = [...SFC.matchAll(/&--(\w+)\n/g)].map((m) => m[1]).sort()
      expect(sizes).toEqual(['default', 'dense', 'large'])
    })
  })
})
