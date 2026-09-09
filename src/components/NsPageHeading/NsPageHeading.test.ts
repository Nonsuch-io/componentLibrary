import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import NsPageHeading from './NsPageHeading.vue'
import NsPageTitle from './../NsPageTitle/NsPageTitle.vue'
import { NsLocaleKey } from '../../composables/useNsLocale'
import { nsLocaleEnCA } from '../../locale/en-CA'

afterEach(() => {
  vi.restoreAllMocks()
})

const silenced = () => vi.spyOn(console, 'warn').mockImplementation(() => {})

describe('NsPageHeading', () => {
  it('renders the title through NsPageTitle', () => {
    const wrapper = mount(NsPageHeading, { props: { title: 'Account settings' } })
    expect(wrapper.find('.ns-page-title__title').text()).toBe('Account settings')
  })

  it('renders controls above the title', () => {
    const wrapper = mount(NsPageHeading, {
      props: { title: 'T' },
      slots: { controls: '<button>Back</button>' },
    })
    const html = wrapper.html()
    expect(html.indexOf('ns-page-heading__controls')).toBeLessThan(
      html.indexOf('ns-page-heading__title'),
    )
  })

  it('renders a header landmark', () => {
    expect(mount(NsPageHeading, { props: { title: 'T' } }).element.tagName).toBe('HEADER')
  })

  it('passes attributes through to the root', () => {
    const wrapper = mount(NsPageHeading, {
      props: { title: 'T' },
      attrs: { 'data-testid': 'heading' },
    })
    expect(wrapper.attributes('data-testid')).toBe('heading')
  })

  describe('forwards everything to NsPageTitle rather than reimplementing it', () => {
    // THE DRIFT THIS GUARDS, and what the first version of it MISSED. The props
    // are declared here rather than extended from NsPageTitleProps, because
    // Vue's defineProps macro cannot resolve an interface extending a type
    // imported from another SFC — it compiles to a component with no props at
    // all. That workaround invites one specific bug: a prop added to
    // NsPageTitle and never forwarded.
    //
    // A KEY-SET COMPARISON ALONE DOES NOT CATCH THAT. Proved in review by
    // adding an `eyebrow` prop to the interface and wiring it nowhere: all 16
    // tests passed, because the key existed. The comment claimed the guard
    // "fails if a prop is added there and not forwarded here" — true only for a
    // MISSING key, not for a declared-but-unwired one, which is the failure
    // that actually reaches a consumer.
    //
    // So the guard is two halves now: every NsPageTitle prop must exist here,
    // AND must have a sample value below, which forces a real pass-through
    // assertion for each. Adding a prop to NsPageTitle without wiring it fails
    // at the sample check; wiring it wrongly fails at the pass-through.
    const SAMPLES: Record<string, unknown> = {
      title: 'a title',
      subtitle: 'a subtitle',
      level: 3,
    }

    const propsOf = (component: unknown) =>
      Object.keys((component as { props: Record<string, unknown> }).props)

    it('accepts every prop NsPageTitle accepts', () => {
      const titleProps = propsOf(NsPageTitle)
      expect(titleProps.length).toBeGreaterThan(0)
      for (const prop of titleProps) {
        expect(
          propsOf(NsPageHeading),
          `NsPageTitle accepts "${prop}" and NsPageHeading does not declare it — a ` +
            'consumer setting it here would be silently ignored',
        ).toContain(prop)
      }
    })

    it('has a sample value for every NsPageTitle prop, so each gets a real assertion', () => {
      for (const prop of propsOf(NsPageTitle)) {
        expect(
          Object.keys(SAMPLES),
          `no sample for "${prop}", so nothing below proves NsPageHeading actually ` +
            'passes it through. Add one — a declared-but-unwired prop type-checks, ' +
            'renders, and silently ignores the consumer',
        ).toContain(prop)
      }
    })

    it.each(Object.keys(SAMPLES))('actually passes %s through to NsPageTitle', (prop) => {
      silenced()
      // `props()` returns RESOLVED props, so an unwired prop reads as
      // NsPageTitle's OWN DEFAULT rather than as absent. If a sample happens to
      // equal that default — `undefined` for any optional string, or the literal
      // default for `level` — the assertion below passes with the binding gone,
      // and the sample check above reports the prop covered. Measured in review:
      // adding `eyebrow` wired nowhere with `eyebrow: undefined` in SAMPLES left
      // all 26 tests green. That is the same overclaim this describe block was
      // rewritten to remove, one level down.
      //
      // So the sample must DIFFER from the default, and this asserts it. Today's
      // three all do ('a title'/undefined, 'a subtitle'/undefined, 3/1); the gap
      // was entirely in the future state the guard exists for.
      const bare = mount(NsPageHeading, { props: { title: 'T' } })
      const defaults = bare.findComponent(NsPageTitle).props() as Record<string, unknown>
      expect(
        defaults[prop],
        `the sample for "${prop}" equals NsPageTitle's own default, so an unwired ` +
          'prop would still pass the assertion below. Pick a sample that differs',
      ).not.toStrictEqual(SAMPLES[prop])

      const wrapper = mount(NsPageHeading, { props: { title: 'T', [prop]: SAMPLES[prop] } })
      const forwarded = wrapper.findComponent(NsPageTitle).props() as Record<string, unknown>
      expect(forwarded[prop]).toStrictEqual(SAMPLES[prop])
    })

    it('forwards the subtitle', () => {
      const wrapper = mount(NsPageHeading, { props: { title: 'T', subtitle: 'S' } })
      expect(wrapper.find('.ns-page-title__subtitle').text()).toBe('S')
    })

    it('forwards the heading level', () => {
      const wrapper = mount(NsPageHeading, { props: { title: 'T', level: 3 } })
      expect(wrapper.find('.ns-page-title__title').element.tagName).toBe('H3')
    })

    it('inherits the clamp rather than repeating it', () => {
      silenced()
      const wrapper = mount(NsPageHeading, {
        props: { title: 'T', level: 9 as unknown as 1 },
      })
      expect(wrapper.find('.ns-page-title__title').element.tagName).toBe('H6')
    })

    it('inherits the empty-title handling', () => {
      silenced()
      const wrapper = mount(NsPageHeading, { props: { title: '   ' } })
      expect(wrapper.find('h1').exists()).toBe(false)
    })

    it('forwards the default and subtitle slots', () => {
      const wrapper = mount(NsPageHeading, {
        slots: { default: 'Slot title', subtitle: '<a href="/x">link</a>' },
      })
      expect(wrapper.find('.ns-page-title__title').text()).toBe('Slot title')
      expect(wrapper.find('.ns-page-title__subtitle').html()).toContain('<a href="/x">')
    })
  })

  describe('forwarding an empty slot does not create an empty element', () => {
    // THE INTERACTION A REVIEW WENT LOOKING FOR AND WAS INTERRUPTED MID-CHASE.
    // NsPageHeading gates its forwarded slots on `$slots.X` — PRESENCE — while
    // controls use a content walk. The worry was that forwarding a declared-but-
    // empty slot would make NsPageTitle see content where there is none, and
    // render an empty <p> or <h1>: the exact bug NsPageTitle's own walk exists
    // to stop, reintroduced one level up by the wrapper.
    //
    // MEASURED, and it does not happen. NsPageTitle runs its own content
    // detection on whatever it receives, and Vue's `<slot>fallback</slot>`
    // covers the prop case. Presence is sufficient HERE only because content is
    // checked THERE — so these tests pin that dependency rather than the
    // wrapper's own logic, and they are the ones that break if NsPageTitle ever
    // stops doing its own detection.
    const mountWith = (template: string) => {
      silenced()
      return mount(defineComponent({ components: { NsPageHeading }, template }))
    }

    it('renders no subtitle for an empty subtitle slot and no subtitle prop', () => {
      const wrapper = mountWith(
        `<NsPageHeading title="T"><template #subtitle><span v-if="false">n</span></template></NsPageHeading>`,
      )
      expect(wrapper.find('.ns-page-title__subtitle').exists()).toBe(false)
    })

    it('renders no heading for an empty default slot and no title prop', () => {
      const wrapper = mountWith(
        `<NsPageHeading><template #default><span v-if="false">n</span></template></NsPageHeading>`,
      )
      expect(wrapper.find('h1').exists()).toBe(false)
    })

    it('falls back to the title prop when the default slot renders nothing', () => {
      // Standard Vue slot-fallback semantics, and worth pinning: a consumer who
      // passes both a prop and a conditional slot gets the prop while the slot
      // is empty, rather than nothing at all.
      const wrapper = mountWith(
        `<NsPageHeading title="PROPTITLE"><template #default><span v-if="false">n</span></template></NsPageHeading>`,
      )
      expect(wrapper.find('h1').text()).toBe('PROPTITLE')
    })
  })

  describe('the controls row is a named group', () => {
    // A bare div of buttons gives a screen-reader user no signal that they are
    // one related set. That matters most on a page carrying several of these,
    // where "Cancel" and "Save changes" repeat with nothing to tell them apart.
    // NsBreadcrumbs already solves the same problem the same way, with a
    // locale-sourced default that a consumer can override per instance.
    it('exposes the controls as a group with a name', () => {
      const wrapper = mount(NsPageHeading, {
        props: { title: 'T' },
        slots: { controls: '<button>Save</button>' },
      })
      const controls = wrapper.find('.ns-page-heading__controls')
      expect(controls.attributes('role')).toBe('group')
      expect(controls.attributes('aria-label')).toBe('Page actions')
    })

    it('lets a consumer name the group', () => {
      const wrapper = mount(NsPageHeading, {
        props: { title: 'T', controlsLabel: 'Billing actions' },
        slots: { controls: '<button>Save</button>' },
      })
      expect(wrapper.find('.ns-page-heading__controls').attributes('aria-label')).toBe(
        'Billing actions',
      )
    })

    it.each(['', '   '])('falls back to the locale name for %j', (controlsLabel) => {
      // `??` would treat '' as a value and emit an EMPTY aria-label, naming the
      // group nothing while looking set — the recurring bug in this library.
      const wrapper = mount(NsPageHeading, {
        props: { title: 'T', controlsLabel },
        slots: { controls: '<button>Save</button>' },
      })
      expect(wrapper.find('.ns-page-heading__controls').attributes('aria-label')).toBe(
        'Page actions',
      )
    })

    it('takes the group name from the injected locale, not a hardcoded string', () => {
      // Replacing `locale.navigation.pageActions` with the literal 'Page actions'
      // passed every other test here — measured in review. A later refactor that
      // inlines the string, or reads the wrong key, would ship English to fr-CA
      // users with nothing going red. NsBreadcrumbs pins its own name this way.
      //
      // SPREAD `navigation`, do not replace it: replacing drops every other key,
      // `pageActions` becomes undefined, and the `||` fallback then emits no
      // label at all — the test would pass for the wrong reason.
      const wrapper = mount(NsPageHeading, {
        props: { title: 'T' },
        slots: { controls: '<button>Save</button>' },
        global: {
          provide: {
            [NsLocaleKey as symbol]: {
              ...nsLocaleEnCA,
              navigation: { ...nsLocaleEnCA.navigation, pageActions: 'Actions de la page' },
            },
          },
        },
      })
      expect(wrapper.find('.ns-page-heading__controls').attributes('aria-label')).toBe(
        'Actions de la page',
      )
    })

    it('is not a nav landmark — these are page actions, not navigation', () => {
      const wrapper = mount(NsPageHeading, {
        props: { title: 'T' },
        slots: { controls: '<button>Save</button>' },
      })
      expect(wrapper.find('nav').exists()).toBe(false)
    })
  })

  describe('controls are content, not presence', () => {
    // Same failure as NsPageTitle's: a declared-but-empty slot would render an
    // empty controls row that still takes its gap, pushing the title down for
    // no reason and looking like a spacing bug rather than a slot bug.
    it('renders no controls row when the slot renders nothing', () => {
      const wrapper = mount(NsPageHeading, {
        props: { title: 'T' },
        slots: { controls: '<button v-if="false">never</button>' },
      })
      expect(wrapper.find('.ns-page-heading__controls').exists()).toBe(false)
    })

    it('renders no controls row when no slot is given', () => {
      const wrapper = mount(NsPageHeading, { props: { title: 'T' } })
      expect(wrapper.find('.ns-page-heading__controls').exists()).toBe(false)
    })

    it('shows controls that arrive after mount', async () => {
      // useSlots() is not reactive; a computed here would cache forever.
      // NsTable.vue:45. The slot KEY must toggle, not just its content — a
      // harness that varies content only does not reproduce the bug.
      const Harness = defineComponent({
        setup: () => ({ show: ref(false) }),
        render() {
          return h(
            NsPageHeading,
            { title: 'T' },
            this.show ? { controls: () => h('button', 'Back') } : {},
          )
        },
      })
      const wrapper = mount(Harness)
      expect(wrapper.find('.ns-page-heading__controls').exists()).toBe(false)
      wrapper.vm.show = true
      await nextTick()
      expect(wrapper.find('.ns-page-heading__controls').text()).toBe('Back')
      wrapper.vm.show = false
      await nextTick()
      expect(wrapper.find('.ns-page-heading__controls').exists()).toBe(false)
    })
  })
})
