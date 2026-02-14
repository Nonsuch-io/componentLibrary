import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsBanner from './NsBanner.vue'

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
})
