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

  describe('slot content detection sees through fragments', () => {
    // The `renders()` walk recurses into Fragment vnodes, and NOTHING tested
    // that branch: every other "renders nothing" case here uses a single
    // `v-if`, which Vue compiles to one bare Comment, never a Fragment.
    // Deleting the recursion would have left the whole suite green.
    it('treats a v-for over an empty list as no content', () => {
      silenced()
      const wrapper = mount(
        defineComponent({
          components: { NsFormSection },
          template: `<NsFormSection><template #title><span v-for="n in []" :key="n">{{ n }}</span></template></NsFormSection>`,
        }),
      )
      expect(wrapper.find('.ns-form-section__title').exists()).toBe(false)
    })

    it('sees content inside a v-for that does render', () => {
      const wrapper = mount(
        defineComponent({
          components: { NsFormSection },
          template: `<NsFormSection><template #title><span v-for="n in [1]" :key="n">Title {{ n }}</span></template></NsFormSection>`,
        }),
      )
      expect(wrapper.find('.ns-form-section__title').text()).toBe('Title 1')
    })
  })

  describe('the title names the fields', () => {
    // THE BLOCKER FROM REVIEW. A visible title with no programmatic tie to its
    // inputs is the commonest failure of exactly this component: someone
    // tabbing straight into a field hears its own label and never the section's.
    // Verified absent before the fix — the root had no role and no
    // aria-labelledby at all.
    it('groups the card and points its name at the title', () => {
      const wrapper = mount(NsFormSection, {
        props: { title: 'Business details' },
        slots: { default: '<input />' },
      })
      const root = wrapper.element as HTMLElement
      const titleId = wrapper.find('.ns-form-section__title').attributes('id')
      expect(root.getAttribute('role')).toBe('group')
      expect(titleId).toBeTruthy()
      expect(root.getAttribute('aria-labelledby')).toBe(titleId)
    })

    it('gives each section on a page a distinct name target', () => {
      // A hardcoded id would make every section name itself after the first
      // one's title — and a form page carries several of these.
      //
      // BOTH IN ONE APP, deliberately. `useId()` counts per app, so two
      // separate `mount()` calls each restart at v-0 and would fail this while
      // the component is correct. Measured: that is exactly what happened when
      // this test was first written the naive way.
      const wrapper = mount(
        defineComponent({
          components: { NsFormSection },
          template: `<div>
            <NsFormSection title="A" />
            <NsFormSection title="B" />
          </div>`,
        }),
      )
      const ids = wrapper.findAll('.ns-form-section__title').map((t) => t.attributes('id'))
      expect(ids).toHaveLength(2)
      expect(ids[0]).toBeTruthy()
      expect(ids[0]).not.toBe(ids[1])

      // And each card points at its OWN title, not at the first one.
      const cards = wrapper.findAll('.ns-form-section')
      expect(cards.map((c) => c.attributes('aria-labelledby'))).toEqual(ids)
    })

    it('adds no group when there is no title', () => {
      // A group whose name points at nothing is announced as an unnamed group:
      // noise rather than structure.
      const wrapper = mount(NsFormSection, { slots: { default: '<input />' } })
      expect((wrapper.element as HTMLElement).getAttribute('role')).toBeNull()
      expect((wrapper.element as HTMLElement).getAttribute('aria-labelledby')).toBeNull()
    })

    it("lets a consumer's own role win", () => {
      const wrapper = mount(NsFormSection, {
        props: { title: 'T' },
        attrs: { role: 'none' },
      })
      expect((wrapper.element as HTMLElement).getAttribute('role')).toBe('none')
    })

    it.each([undefined, '', '   '])('keeps the group when a consumer passes role=%j', (role) => {
      // MEASURED before the fix: `:role="cond ? 'presentation' : undefined"` with
      // cond false fell through as role: undefined and OVERWROTE 'group', so the
      // consumer lost the association in the exact state where they meant "no
      // override". Plain attribute fallthrough cannot distinguish "not set"
      // from "set to nothing"; the component now can.
      const wrapper = mount(NsFormSection, { props: { title: 'T' }, attrs: { role } })
      expect((wrapper.element as HTMLElement).getAttribute('role')).toBe('group')
    })

    it('still passes every other attribute through', () => {
      // `inheritAttrs: false` is now on, so this is no longer automatic — the
      // component re-binds everything except `role` by hand, and a typo there
      // would silently drop data-testids, ids, and event listeners.
      const wrapper = mount(NsFormSection, {
        props: { title: 'T' },
        attrs: { 'data-testid': 'section', 'aria-describedby': 'hint' },
      })
      expect(wrapper.attributes('data-testid')).toBe('section')
      expect(wrapper.attributes('aria-describedby')).toBe('hint')
    })

    describe('role and name stay in step when the title slot KEY toggles', () => {
      // THE BLOCKER'S SECOND COAT. The first fix computed the role in a
      // `computed` over `hasTitle()`, which reads the non-reactive slots
      // object — so on this exact path the template's aria-labelledby updated
      // and the role did not, leaving a name with no role to carry it. Every
      // other test stayed green, because a `v-if` INSIDE the slot happens to
      // let the computed track the parent's ref by accident. The key toggling
      // is what a data-loaded `<template v-if="loaded" #title>` actually does.
      const Harness = defineComponent({
        setup: () => ({ show: ref(false) }),
        render() {
          return h(NsFormSection, {}, this.show ? { title: () => 'Loaded title' } : {})
        },
      })

      it('gains BOTH role and name when the title arrives after mount', async () => {
        silenced()
        const wrapper = mount(Harness)
        const root = wrapper.element as HTMLElement
        expect(root.getAttribute('role')).toBeNull()
        wrapper.vm.show = true
        await nextTick()
        expect(root.getAttribute('role')).toBe('group')
        expect(root.getAttribute('aria-labelledby')).toBe(
          wrapper.find('.ns-form-section__title').attributes('id'),
        )
      })

      it('loses BOTH when the title leaves', async () => {
        silenced()
        const wrapper = mount(Harness)
        wrapper.vm.show = true
        await nextTick()
        expect((wrapper.element as HTMLElement).getAttribute('role')).toBe('group')
        wrapper.vm.show = false
        await nextTick()
        const root = wrapper.element as HTMLElement
        expect(root.getAttribute('role')).toBeNull()
        expect(root.getAttribute('aria-labelledby')).toBeNull()
      })
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

    it('exposes exactly one notice region, not one per row', () => {
      // REPLACES A TEST THAT COULD NOT FAIL. It used to mount with an
      // undeclared `rowNotice` slot and assert the content did not appear —
      // but Vue drops content passed under ANY name a template does not
      // declare, so it passed identically whether the design decision had been
      // made, reversed, or never considered. It proved nothing.
      //
      // What is actually worth pinning at runtime is that a section renders
      // ONE notice region. The "no row-level slot" decision itself is a
      // TYPE-level contract — `defineSlots` declares four names and TypeScript
      // rejects a fifth — not a runtime-observable one; a per-row slot under a
      // different class would leave this count at exactly one.
      const wrapper = mount(NsFormSection, {
        props: { title: 'T' },
        slots: { notice: '<p>Section-wide</p>', default: '<input /><input />' },
      })
      expect(wrapper.findAll('.ns-form-section__notice')).toHaveLength(1)
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
