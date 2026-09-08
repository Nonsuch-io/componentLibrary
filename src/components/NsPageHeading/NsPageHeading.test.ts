import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import NsPageHeading from './NsPageHeading.vue'
import NsPageTitle from './../NsPageTitle/NsPageTitle.vue'

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
    // THE DRIFT THIS GUARDS. The props are declared here rather than extended
    // from NsPageTitleProps, because Vue's defineProps macro cannot resolve an
    // interface extending a type imported from another SFC — it compiles to a
    // component with no props at all. That workaround invites exactly one bug:
    // a prop added to NsPageTitle and never forwarded, which type-checks,
    // renders, and silently ignores the consumer.
    it('accepts every prop NsPageTitle accepts', () => {
      const titleProps = Object.keys(
        (NsPageTitle as unknown as { props: Record<string, unknown> }).props,
      )
      const headingProps = Object.keys(
        (NsPageHeading as unknown as { props: Record<string, unknown> }).props,
      )
      expect(titleProps.length).toBeGreaterThan(0)
      for (const prop of titleProps) {
        expect(
          headingProps,
          `NsPageTitle accepts "${prop}" and NsPageHeading does not forward it — a ` +
            'consumer setting it here would be silently ignored',
        ).toContain(prop)
      }
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
