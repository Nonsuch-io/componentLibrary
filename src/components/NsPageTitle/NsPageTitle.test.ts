import { describe, it, expect, vi, afterEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import NsPageTitle from './NsPageTitle.vue'
import { KNOWN_VARIANTS } from '../NsText/variants'

afterEach(() => {
  vi.restoreAllMocks()
})

const silenced = () => vi.spyOn(console, 'warn').mockImplementation(() => {})

describe('NsPageTitle', () => {
  it('renders the title', () => {
    const wrapper = mount(NsPageTitle, { props: { title: 'Account settings' } })
    expect(wrapper.text()).toContain('Account settings')
  })

  it('renders the subtitle', () => {
    const wrapper = mount(NsPageTitle, {
      props: { title: 'Account settings', subtitle: 'Manage your profile.' },
    })
    expect(wrapper.text()).toContain('Manage your profile.')
  })

  it('renders no subtitle element when none is given', () => {
    const wrapper = mount(NsPageTitle, { props: { title: 'Only a title' } })
    expect(wrapper.find('.ns-page-title__subtitle').exists()).toBe(false)
  })

  it('passes attributes through to the root', () => {
    const wrapper = mount(NsPageTitle, {
      props: { title: 'T' },
      attrs: { 'data-testid': 'page-title' },
    })
    expect(wrapper.attributes('data-testid')).toBe('page-title')
  })

  describe('slots override the props', () => {
    it('uses the default slot for the title', () => {
      const wrapper = mount(NsPageTitle, {
        props: { title: 'from prop' },
        slots: { default: 'from slot' },
      })
      expect(wrapper.find('.ns-page-title__title').text()).toBe('from slot')
    })

    it('uses the subtitle slot', () => {
      const wrapper = mount(NsPageTitle, {
        props: { title: 'T', subtitle: 'from prop' },
        slots: { subtitle: '<a href="/x">a link</a>' },
      })
      expect(wrapper.find('.ns-page-title__subtitle').html()).toContain('<a href="/x">')
    })

    it('renders a title from the slot alone, with no title prop', () => {
      const wrapper = mount(NsPageTitle, { slots: { default: 'Slot only' } })
      expect(wrapper.find('h1').text()).toBe('Slot only')
    })
  })

  describe('accessibility', () => {
    it('renders an h1 by default', () => {
      const wrapper = mount(NsPageTitle, { props: { title: 'T' } })
      expect(wrapper.find('.ns-page-title__title').element.tagName).toBe('H1')
    })

    it.each([1, 2, 3, 4, 5, 6] as const)('renders an h%s when level is %s', (level) => {
      const wrapper = mount(NsPageTitle, { props: { title: 'T', level } })
      expect(wrapper.find('.ns-page-title__title').element.tagName).toBe(`H${level}`)
    })

    it('keeps the type style when the level changes, so appearance and outline stay independent', () => {
      // The regression: tying the type ramp to the heading level. A consumer
      // dropping to h2 inside a shell would silently get smaller text and would
      // then reach back for h1 to get the design right, producing two h1s.
      const h1 = mount(NsPageTitle, { props: { title: 'T', level: 1 } })
      const h3 = mount(NsPageTitle, { props: { title: 'T', level: 3 } })
      expect(h1.find('.ns-page-title__title').classes()).toContain('ns-heading-xl')
      expect(h3.find('.ns-page-title__title').classes()).toContain('ns-heading-xl')
    })

    it('marks the subtitle as a paragraph, not a second heading', () => {
      // A subtitle marked up as a heading puts a phantom entry in the outline
      // between the page title and its first real section.
      const wrapper = mount(NsPageTitle, { props: { title: 'T', subtitle: 'S' } })
      expect(wrapper.find('.ns-page-title__subtitle').element.tagName).toBe('P')
      expect(wrapper.findAll('h1, h2, h3, h4, h5, h6')).toHaveLength(1)
    })
  })

  describe('an empty title is not a title', () => {
    // `??` would treat '' as present and render an EMPTY heading, which a screen
    // reader announces as a heading with no name — worse than no heading, since
    // it still lands in the outline. The recurring bug in this library.
    it.each(['', '   ', '\t\n'])('renders no heading for %j', (title) => {
      silenced()
      const wrapper = mount(NsPageTitle, { props: { title } })
      expect(wrapper.find('h1').exists()).toBe(false)
    })

    it('renders no empty subtitle either', () => {
      const wrapper = mount(NsPageTitle, { props: { title: 'T', subtitle: '   ' } })
      expect(wrapper.find('.ns-page-title__subtitle').exists()).toBe(false)
    })

    it('warns that a title-less page title has no title in the outline', () => {
      const warn = silenced()
      mount(NsPageTitle, { props: { title: '  ' } })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('[NsPageTitle] No title'))
    })

    it('does not warn when a title is present', () => {
      const warn = silenced()
      mount(NsPageTitle, { props: { title: 'A real title' } })
      expect(warn).not.toHaveBeenCalled()
    })

    it('does not warn when only the slot supplies the title', () => {
      const warn = silenced()
      mount(NsPageTitle, { slots: { default: 'Slot title' } })
      expect(warn).not.toHaveBeenCalled()
    })
  })

  describe('a slot that renders nothing is not content', () => {
    // BOTH BLOCKERS FROM REVIEW LIVED HERE. `slots.default !== undefined` is true
    // for any slot the parent DECLARES, so an all-v-if slot produced <h1></h1>
    // with no text and no warning — the exact empty heading the trim() guard
    // exists to prevent, reached through the other input.

    it('renders no heading when the default slot renders nothing', () => {
      silenced()
      const wrapper = mount(NsPageTitle, {
        slots: { default: '<span v-if="false">never</span>' },
      })
      expect(wrapper.find('h1').exists()).toBe(false)
    })

    it('warns when the default slot renders nothing', () => {
      const warn = silenced()
      mount(NsPageTitle, { slots: { default: '<span v-if="false">never</span>' } })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('[NsPageTitle] No title'))
    })

    it('renders no subtitle when the subtitle slot renders nothing', () => {
      const wrapper = mount(NsPageTitle, {
        props: { title: 'T' },
        slots: { subtitle: '<span v-if="false">never</span>' },
      })
      expect(wrapper.find('.ns-page-title__subtitle').exists()).toBe(false)
    })

    it('falls back to the title prop when the slot renders nothing', () => {
      const wrapper = mount(NsPageTitle, {
        props: { title: 'From prop' },
        slots: { default: '<span v-if="false">never</span>' },
      })
      expect(wrapper.find('h1').text()).toBe('From prop')
    })
  })

  describe('slots that change after mount', () => {
    // THE SECOND BLOCKER. useSlots() returns a NON-reactive object, so a computed
    // over it evaluates once and never again — NsTable.vue:45 documents this same
    // trap and this component re-shipped it. A subtitle toggled on after mount
    // never appeared; one toggled off left an empty <p> behind.
    // THE SLOT KEY ITSELF MUST APPEAR AND DISAPPEAR, which is what
    // `<template v-if="show" #subtitle>` compiles to and what NsTable hit.
    // A harness that always passes the slot and only varies its CONTENT does
    // NOT reproduce the bug: invoking that slot inside a computed reads the
    // parent's ref and so tracks it, and the computed invalidates correctly.
    // Measured — an earlier version of these tests used that shape and passed
    // against a deliberately reintroduced computed. With the key absent, the
    // computed reads a plain property of a non-reactive object, takes no
    // dependency, and caches its answer forever.
    const harness = (slotName: 'default' | 'subtitle') =>
      defineComponent({
        setup() {
          const show = ref(false)
          return { show }
        },
        render() {
          return h(
            NsPageTitle,
            { title: slotName === 'subtitle' ? 'A title' : undefined },
            this.show ? { [slotName]: () => 'now here' } : {},
          )
        },
      })

    it('shows a subtitle that arrives after mount', async () => {
      const wrapper = mount(harness('subtitle'))
      expect(wrapper.find('.ns-page-title__subtitle').exists()).toBe(false)
      wrapper.vm.show = true
      await nextTick()
      expect(wrapper.find('.ns-page-title__subtitle').text()).toBe('now here')
    })

    it('removes the subtitle element when its slot empties', async () => {
      const wrapper = mount(harness('subtitle'))
      wrapper.vm.show = true
      await nextTick()
      wrapper.vm.show = false
      await nextTick()
      expect(wrapper.find('.ns-page-title__subtitle').exists()).toBe(false)
    })

    it('shows a title that arrives after mount', async () => {
      silenced()
      const wrapper = mount(harness('default'))
      expect(wrapper.find('h1').exists()).toBe(false)
      wrapper.vm.show = true
      await nextTick()
      expect(wrapper.find('h1').text()).toBe('now here')
    })
  })

  describe('level is a union to TypeScript and a bare Number at runtime', () => {
    // <h7> and <h0> are not elements: they render inline and contribute NOTHING
    // to the outline, while looking almost right. A JS consumer or a bound value
    // can hand us either.
    it.each([
      [7, 'H6'],
      [0, 'H1'],
      [-2, 'H1'],
      [99, 'H6'],
      // NaN survives both clamps and would index past the end of the tag list,
      // rendering `<undefined>`; Infinity does the same at the other end.
      [NaN, 'H1'],
      // Non-finite is garbage input, so it falls back to the documented default
      // of 1 rather than being clamped at either end.
      [Infinity, 'H1'],
      [-Infinity, 'H1'],
      // A fraction from a computed level rounds rather than producing `h2.4`.
      [2.4, 'H2'],
      [2.6, 'H3'],
    ])('clamps level %s to %s', (level, tag) => {
      silenced()
      const wrapper = mount(NsPageTitle, {
        props: { title: 'T', level: level as unknown as 1 },
      })
      expect(wrapper.find('.ns-page-title__title').element.tagName).toBe(tag)
    })

    it('warns that an out-of-range level was clamped', () => {
      const warn = silenced()
      mount(NsPageTitle, { props: { title: 'T', level: 7 as unknown as 1 } })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('is not a heading level'))
    })

    it('does not warn for a level in range', () => {
      const warn = silenced()
      mount(NsPageTitle, { props: { title: 'T', level: 3 } })
      expect(warn).not.toHaveBeenCalled()
    })
  })

  describe('type styles match the measured design', () => {
    // Figma 265:30901: title "XL heading" 32/36.8 w600, subtitle
    // "Medium heading regular" 20/25 w400. These map to NsText variants; if
    // either variant is renamed or dropped, this component silently falls back
    // to browser-default type and nothing else would notice.
    it('renders the title as heading-xl', () => {
      const wrapper = mount(NsPageTitle, { props: { title: 'T' } })
      expect(wrapper.find('.ns-page-title__title').classes()).toContain('ns-heading-xl')
    })

    it('renders the subtitle as heading-md-regular', () => {
      const wrapper = mount(NsPageTitle, { props: { title: 'T', subtitle: 'S' } })
      expect(wrapper.find('.ns-page-title__subtitle').classes()).toContain('ns-heading-md-regular')
    })

    // The class assertions above cannot catch this on their own: NsText emits
    // `ns-{variant}` for ANY string it is handed, so dropping `heading-xl` from
    // its vocabulary would leave them green while this rendered at the browser
    // default. `pnpm typecheck` WOULD catch it (vue-tsc rejects an unknown
    // variant literal in the template with TS2820) — this is a second, cheaper
    // alarm that makes the failure legible at the component that depends on it,
    // rather than the only thing standing between us and the bug.
    it.each(['heading-xl', 'heading-md-regular'])(
      'depends on %s, which NsText still ships',
      (variant) => {
        expect(
          (KNOWN_VARIANTS as readonly string[]).includes(variant),
          `NsPageTitle renders ${variant}, which is no longer an NsText variant — the ` +
            'class assertions above would still pass while the type silently died',
        ).toBe(true)
      },
    )
  })
})
