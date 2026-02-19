import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import NsBanner from './NsBanner.vue'

// Stub QBanner to render all slots directly (avoids v8 template branch artifacts)
const QBannerStub = defineComponent({
  name: 'QBanner',
  inheritAttrs: true,
  setup(_, { slots, attrs }) {
    return () =>
      h(
        'div',
        {
          class: ['q-banner', ...(Array.isArray(attrs.class) ? attrs.class : [attrs.class])].filter(
            Boolean,
          ),
        },
        [
          slots.avatar ? h('div', { class: 'q-banner__avatar' }, slots.avatar()) : null,
          slots.default?.(),
          slots.action ? h('div', { class: 'q-banner__action' }, slots.action()) : null,
        ],
      )
  },
})

describe('NsBanner', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsBanner, { slots: { default: 'Notice' } })
    expect(wrapper.find('.ns-banner').exists()).toBe(true)
    expect(wrapper.text()).toContain('Notice')
  })

  it('applies info type class by default', () => {
    const wrapper = mount(NsBanner, { slots: { default: 'Info' } })
    expect(wrapper.find('.ns-banner--info').exists()).toBe(true)
  })

  it('applies success type class', () => {
    const wrapper = mount(NsBanner, {
      props: { type: 'success' },
      slots: { default: 'Saved!' },
    })
    expect(wrapper.find('.ns-banner--success').exists()).toBe(true)
  })

  it('applies warning type class', () => {
    const wrapper = mount(NsBanner, {
      props: { type: 'warning' },
      slots: { default: 'Careful' },
    })
    expect(wrapper.find('.ns-banner--warning').exists()).toBe(true)
  })

  it('applies error type class', () => {
    const wrapper = mount(NsBanner, {
      props: { type: 'error' },
      slots: { default: 'Failed' },
    })
    expect(wrapper.find('.ns-banner--error').exists()).toBe(true)
  })

  it('renders action slot', () => {
    const wrapper = mount(NsBanner, {
      slots: {
        default: 'Message',
        action: '<button class="test-action">Dismiss</button>',
      },
    })
    expect(wrapper.find('.test-action').exists()).toBe(true)
  })

  it('renders avatar slot', () => {
    const wrapper = mount(NsBanner, {
      slots: {
        default: 'Message',
        avatar: '<span class="test-avatar">!</span>',
      },
    })
    expect(wrapper.find('.test-avatar').exists()).toBe(true)
  })

  it('renders both avatar and action slots together', () => {
    const wrapper = mount(NsBanner, {
      slots: {
        default: 'Message',
        avatar: '<span class="combo-avatar">A</span>',
        action: '<button class="combo-action">OK</button>',
      },
    })
    expect(wrapper.find('.combo-avatar').exists()).toBe(true)
    expect(wrapper.find('.combo-action').exists()).toBe(true)
  })

  describe('with QBanner stub (template branch coverage)', () => {
    const stubs = { QBanner: QBannerStub }

    it('renders without optional slots', () => {
      const wrapper = mount(NsBanner, {
        slots: { default: 'Stub notice' },
        global: { stubs },
      })
      expect(wrapper.text()).toContain('Stub notice')
    })

    it('renders avatar slot through template', () => {
      const wrapper = mount(NsBanner, {
        slots: {
          default: 'With avatar',
          avatar: '<span class="stub-avatar">A</span>',
        },
        global: { stubs },
      })
      expect(wrapper.find('.stub-avatar').exists()).toBe(true)
    })

    it('renders action slot through template', () => {
      const wrapper = mount(NsBanner, {
        slots: {
          default: 'With action',
          action: '<button class="stub-action">Go</button>',
        },
        global: { stubs },
      })
      expect(wrapper.find('.stub-action').exists()).toBe(true)
    })

    it('renders both slots through template', () => {
      const wrapper = mount(NsBanner, {
        slots: {
          default: 'Full',
          avatar: '<span class="stub-av">X</span>',
          action: '<button class="stub-act">Y</button>',
        },
        global: { stubs },
      })
      expect(wrapper.find('.stub-av').exists()).toBe(true)
      expect(wrapper.find('.stub-act').exists()).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('has role="status" and aria-live="polite" for info type', () => {
      const wrapper = mount(NsBanner, {
        props: { type: 'info' },
        slots: { default: 'Info message' },
      })
      const banner = wrapper.find('.q-banner')
      expect(banner.attributes('role')).toBe('status')
      expect(banner.attributes('aria-live')).toBe('polite')
    })

    it('has role="status" and aria-live="polite" for success type', () => {
      const wrapper = mount(NsBanner, {
        props: { type: 'success' },
        slots: { default: 'Saved!' },
      })
      const banner = wrapper.find('.q-banner')
      expect(banner.attributes('role')).toBe('status')
      expect(banner.attributes('aria-live')).toBe('polite')
    })

    it('has role="alert" and aria-live="assertive" for warning type', () => {
      const wrapper = mount(NsBanner, {
        props: { type: 'warning' },
        slots: { default: 'Careful' },
      })
      const banner = wrapper.find('.q-banner')
      expect(banner.attributes('role')).toBe('alert')
      expect(banner.attributes('aria-live')).toBe('assertive')
    })

    it('has role="alert" and aria-live="assertive" for error type', () => {
      const wrapper = mount(NsBanner, {
        props: { type: 'error' },
        slots: { default: 'Failed' },
      })
      const banner = wrapper.find('.q-banner')
      expect(banner.attributes('role')).toBe('alert')
      expect(banner.attributes('aria-live')).toBe('assertive')
    })
  })
})
