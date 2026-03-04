import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import NsCard from './NsCard.vue'

// Stub QCard + section/actions to render all slots directly (covers v8 template branches)
const QCardStub = defineComponent({
  name: 'QCard',
  inheritAttrs: true,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'div',
        {
          class: ['q-card', ...(Array.isArray(attrs.class) ? attrs.class : [attrs.class])].filter(
            Boolean,
          ),
          ...attrs,
        },
        slots.default?.(),
      )
  },
})
const QCardSectionStub = defineComponent({
  name: 'QCardSection',
  inheritAttrs: true,
  setup(_, { slots, attrs }) {
    return () => h('div', { class: 'q-card__section', ...attrs }, slots.default?.())
  },
})
const QCardActionsStub = defineComponent({
  name: 'QCardActions',
  inheritAttrs: true,
  setup(_, { slots, attrs }) {
    return () => h('div', { class: 'q-card__actions', ...attrs }, slots.default?.())
  },
})

describe('NsCard', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsCard, {
      slots: { default: 'Card body content' },
    })
    expect(wrapper.text()).toContain('Card body content')
  })

  it('renders title when provided', () => {
    const wrapper = mount(NsCard, {
      props: { title: 'My Card' },
    })
    expect(wrapper.text()).toContain('My Card')
  })

  it('renders subtitle when provided', () => {
    const wrapper = mount(NsCard, {
      props: { title: 'Title', subtitle: '$29.99' },
    })
    expect(wrapper.text()).toContain('$29.99')
  })

  it('does not render header section when no title or header slot', () => {
    const wrapper = mount(NsCard, {
      slots: { default: 'Body only' },
    })
    expect(wrapper.find('.ns-card__header').exists()).toBe(false)
  })

  it('applies ns-card class', () => {
    const wrapper = mount(NsCard)
    expect(wrapper.find('.ns-card').exists()).toBe(true)
  })

  it('applies flat modifier class', () => {
    const wrapper = mount(NsCard, { props: { flat: true } })
    expect(wrapper.find('.ns-card--flat').exists()).toBe(true)
  })

  it('renders actions slot', () => {
    const wrapper = mount(NsCard, {
      slots: {
        default: 'Body',
        actions: '<button>Action</button>',
      },
    })
    expect(wrapper.find('.q-card__actions').exists()).toBe(true)
    expect(wrapper.text()).toContain('Action')
  })

  it('renders custom header slot', () => {
    const wrapper = mount(NsCard, {
      slots: {
        header: '<div class="custom-header">Custom!</div>',
        default: 'Body',
      },
    })
    expect(wrapper.find('.custom-header').text()).toBe('Custom!')
  })

  it('renders title, subtitle, and actions together', () => {
    const wrapper = mount(NsCard, {
      props: { title: 'Full Card', subtitle: 'With everything' },
      slots: {
        default: 'Full body',
        actions: '<button>Action</button>',
      },
    })
    expect(wrapper.text()).toContain('Full Card')
    expect(wrapper.text()).toContain('With everything')
    expect(wrapper.find('.q-card__actions').exists()).toBe(true)
  })

  describe('accessibility', () => {
    it('sets role="region" and aria-labelledby when title is provided', () => {
      const wrapper = mount(NsCard, {
        props: { title: 'Settings' },
        slots: { default: 'Body' },
      })
      const card = wrapper.find('.q-card')
      expect(card.attributes('role')).toBe('region')
      const headerId = wrapper.find('.ns-card__header').attributes('id')
      expect(headerId).toBeTruthy()
      expect(card.attributes('aria-labelledby')).toBe(headerId)
    })

    it('omits role and aria-labelledby when no title', () => {
      const wrapper = mount(NsCard, {
        slots: { default: 'Body only' },
      })
      const card = wrapper.find('.q-card')
      expect(card.attributes('role')).toBeUndefined()
      expect(card.attributes('aria-labelledby')).toBeUndefined()
    })
  })

  describe('with stubs (template branch coverage)', () => {
    const stubs = {
      QCard: QCardStub,
      QCardSection: QCardSectionStub,
      QCardActions: QCardActionsStub,
    }

    it('renders header section with title through template', () => {
      const wrapper = mount(NsCard, {
        props: { title: 'Stub Title', subtitle: 'Sub' },
        slots: { default: 'Body' },
        global: { stubs },
      })
      expect(wrapper.find('.ns-card__header').exists()).toBe(true)
      expect(wrapper.text()).toContain('Stub Title')
      expect(wrapper.text()).toContain('Sub')
    })

    it('renders without header when no title or header slot', () => {
      const wrapper = mount(NsCard, {
        slots: { default: 'Body only' },
        global: { stubs },
      })
      expect(wrapper.find('.ns-card__header').exists()).toBe(false)
    })

    it('renders actions slot through template', () => {
      const wrapper = mount(NsCard, {
        slots: { default: 'Body', actions: '<button class="stub-act">Go</button>' },
        global: { stubs },
      })
      expect(wrapper.find('.stub-act').exists()).toBe(true)
    })

    it('omits actions when no actions slot', () => {
      const wrapper = mount(NsCard, {
        slots: { default: 'Body' },
        global: { stubs },
      })
      expect(wrapper.find('.q-card__actions').exists()).toBe(false)
    })

    it('renders with header slot instead of title', () => {
      const wrapper = mount(NsCard, {
        slots: { default: 'Body', header: '<h3 class="stub-hdr">Custom</h3>' },
        global: { stubs },
      })
      expect(wrapper.find('.stub-hdr').exists()).toBe(true)
    })
  })
})
