import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import NsFormSection from './NsFormSection.vue'
import { KNOWN_VARIANTS } from '../NsText/variants'

afterEach(() => {
  vi.restoreAllMocks()
})

const silenced = () => vi.spyOn(console, 'warn').mockImplementation(() => {})

describe('NsFormSection', () => {
  it('renders fields from the default slot', () => {
    const wrapper = mount(NsFormSection, { slots: { default: '<input name="email" />' } })
    expect(wrapper.find('.ns-form-section__fields input').exists()).toBe(true)
  })

  it('renders inside an NsCard', () => {
    expect(mount(NsFormSection).find('.ns-card').exists()).toBe(true)
  })

  it('passes attributes through', () => {
    const wrapper = mount(NsFormSection, { attrs: { 'data-testid': 'section' } })
    expect(wrapper.attributes('data-testid')).toBe('section')
  })

  describe('title and description are INDEPENDENTLY optional', () => {
    // PlanCheckOutPaymentMethod (185:10738) has a title and NO description —
    // the sample that disproved the "one optional pair" reading after three
    // earlier variants all happened to have both. Modelling them as a pair
    // ships an empty descender or a collapsed heading, and it reaches
    // screenshot review looking fine.
    it('renders a title with no description', () => {
      const wrapper = mount(NsFormSection, { props: { title: 'Payment method' } })
      expect(wrapper.find('.ns-form-section__title').text()).toBe('Payment method')
      expect(wrapper.find('.ns-form-section__description').exists()).toBe(false)
    })

    it('renders a description with no title', () => {
      const wrapper = mount(NsFormSection, { props: { description: 'Standalone note' } })
      expect(wrapper.find('.ns-form-section__description').text()).toBe('Standalone note')
      expect(wrapper.find('.ns-form-section__title').exists()).toBe(false)
    })

    it('renders neither, and no empty heading wrapper', () => {
      const wrapper = mount(NsFormSection)
      expect(wrapper.find('.ns-form-section__heading').exists()).toBe(false)
    })

    it('renders both', () => {
      const wrapper = mount(NsFormSection, { props: { title: 'T', description: 'D' } })
      expect(wrapper.find('.ns-form-section__title').text()).toBe('T')
      expect(wrapper.find('.ns-form-section__description').text()).toBe('D')
    })
  })

  describe('an empty string is not a value', () => {
    // `??` would treat '' as present and render an EMPTY heading, announced by
    // a screen reader as a heading with no name. The recurring bug here.
    it.each(['', '   ', '\t\n'])('renders no title for %j', (title) => {
      expect(mount(NsFormSection, { props: { title } }).find('h2').exists()).toBe(false)
    })

    it('renders no description for whitespace', () => {
      const wrapper = mount(NsFormSection, { props: { description: '  ' } })
      expect(wrapper.find('.ns-form-section__description').exists()).toBe(false)
    })
  })

  describe('slot CONTENT, not slot presence', () => {
    // `slots.title !== undefined` is true for a slot the parent merely
    // declares, so `<template #title><span v-if="loaded"/></template>` would
    // render an empty heading — the same bug NsPageTitle shipped once.
    const mountWith = (template: string) => {
      silenced()
      return mount(defineComponent({ components: { NsFormSection }, template }))
    }

    it('renders no heading for a title slot that renders nothing', () => {
      const wrapper = mountWith(
        `<NsFormSection><template #title><span v-if="false">n</span></template></NsFormSection>`,
      )
      expect(wrapper.find('.ns-form-section__title').exists()).toBe(false)
    })

    it('renders no notice for a notice slot that renders nothing', () => {
      const wrapper = mountWith(
        `<NsFormSection><template #notice><span v-if="false">n</span></template></NsFormSection>`,
      )
      expect(wrapper.find('.ns-form-section__notice').exists()).toBe(false)
    })

    it('shows a notice that arrives after mount', async () => {
      // useSlots() is not reactive; a computed would cache forever
      // (NsTable.vue:45). The slot KEY must toggle — a harness that varies only
      // the slot's CONTENT does not reproduce the bug.
      const Harness = defineComponent({
        setup: () => ({ show: ref(false) }),
        render() {
          return h(
            NsFormSection,
            { title: 'T' },
            this.show ? { notice: () => h('p', 'Verification pending') } : {},
          )
        },
      })
      const wrapper = mount(Harness)
      expect(wrapper.find('.ns-form-section__notice').exists()).toBe(false)
      wrapper.vm.show = true
      await nextTick()
      expect(wrapper.find('.ns-form-section__notice').text()).toBe('Verification pending')
    })
  })

  describe('the notice is section-scoped', () => {
    it('renders above the fields, not inside them', () => {
      // Position is the contract. PaymentMethod (185:10738) puts a banner
      // directly in the card ABOVE Fields; StorageLocation (202:23429) puts one
      // INSIDE Fields as a row. Those mean different things — section-wide
      // versus scoped to the input beside it — and they look identical in a
      // screenshot while differing in the DOM order a screen reader walks.
      const wrapper = mount(NsFormSection, {
        props: { title: 'T' },
        slots: { notice: '<p>Plan changed</p>', default: '<input />' },
      })
      const html = wrapper.html()
      expect(html.indexOf('ns-form-section__notice')).toBeLessThan(
        html.indexOf('ns-form-section__fields'),
      )
      expect(wrapper.find('.ns-form-section__fields p').exists()).toBe(false)
    })

    it('has no row-level notice slot, deliberately', () => {
      // A second banner slot here would recreate the ambiguity one level down.
      // A row-level notice belongs to whatever occupies that row.
      const wrapper = mount(NsFormSection, {
        slots: { rowNotice: '<p>should not render</p>' },
      })
      expect(wrapper.text()).not.toContain('should not render')
    })
  })

  describe('accessibility', () => {
    it('renders h2 by default — the page heading owns the h1', () => {
      const wrapper = mount(NsFormSection, { props: { title: 'T' } })
      expect(wrapper.find('.ns-form-section__title').element.tagName).toBe('H2')
    })

    it.each([2, 3, 4, 5, 6] as const)('renders h%s for level %s', (level) => {
      const wrapper = mount(NsFormSection, { props: { title: 'T', level } })
      expect(wrapper.find('.ns-form-section__title').element.tagName).toBe(`H${level}`)
    })

    it('never renders an h1, whatever it is given', () => {
      // A section title is by definition not the page's own title. Offering h1
      // invites a second one on a page that already has NsPageHeading's.
      silenced()
      for (const level of [1, 0, -3, NaN] as unknown as (2 | 3)[]) {
        const wrapper = mount(NsFormSection, { props: { title: 'T', level } })
        expect(wrapper.find('h1').exists()).toBe(false)
      }
    })

    it.each([
      [7, 'H6'],
      [99, 'H6'],
      [1, 'H2'],
      [NaN, 'H2'],
    ])('clamps level %s to %s', (level, tag) => {
      silenced()
      const wrapper = mount(NsFormSection, {
        props: { title: 'T', level: level as unknown as 2 },
      })
      expect(wrapper.find('.ns-form-section__title').element.tagName).toBe(tag)
    })

    it('marks the description as a paragraph, not a second heading', () => {
      const wrapper = mount(NsFormSection, { props: { title: 'T', description: 'D' } })
      expect(wrapper.find('.ns-form-section__description').element.tagName).toBe('P')
      expect(wrapper.findAll('h1, h2, h3, h4, h5, h6')).toHaveLength(1)
    })
  })

  describe('type styles match what was measured', () => {
    // MEASURED on 163:9495 and 164:10056, agreeing: title "Small heading
    // regular" 16/400/20.8, description "Medium body text" 14/400/19.6. Both of
    // the styles first INFERRED from element heights were wrong — heading-sm is
    // weight 600 where the design is 400 — which is why these are pinned.
    it('renders the title as heading-sm-regular', () => {
      const wrapper = mount(NsFormSection, { props: { title: 'T' } })
      expect(wrapper.find('.ns-form-section__title').classes()).toContain('ns-heading-sm-regular')
    })

    it('renders the description as body-md', () => {
      const wrapper = mount(NsFormSection, { props: { title: 'T', description: 'D' } })
      expect(wrapper.find('.ns-form-section__description').classes()).toContain('ns-body-md')
    })

    it.each(['heading-sm-regular', 'body-md'])(
      'depends on %s, which NsText still ships',
      (variant) => {
        // NsText emits `ns-{variant}` for ANY string, so dropping one from its
        // vocabulary leaves the class assertions above green while the type
        // silently dies. typecheck would also catch it; this makes the failure
        // legible at the component that depends on it.
        expect(
          (KNOWN_VARIANTS as readonly string[]).includes(variant),
          `NsFormSection renders ${variant}, which NsText no longer ships`,
        ).toBe(true)
      },
    )
  })
})
