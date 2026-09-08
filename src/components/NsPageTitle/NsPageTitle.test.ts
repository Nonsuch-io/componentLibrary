import { describe, it, expect, vi, afterEach } from 'vitest'
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

    // THE ASSERTIONS ABOVE CANNOT CATCH THIS ON THEIR OWN. NsText emits
    // `ns-{variant}` for ANY string it is handed — an unknown variant warns but
    // still renders the class. So dropping `heading-xl` from NsText's vocabulary
    // would leave both class assertions green while this component rendered at
    // the browser default. Assert the variants we depend on are real.
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
