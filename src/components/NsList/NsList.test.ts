import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsList from './NsList.vue'

describe('NsList', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsList)
    expect(wrapper.find('.ns-list').exists()).toBe(true)
  })

  it('applies ns-list class', () => {
    const wrapper = mount(NsList)
    expect(wrapper.find('.q-list').classes()).toContain('ns-list')
  })

  it('renders default slot content', () => {
    const wrapper = mount(NsList, {
      slots: { default: '<div class="test-item">Item 1</div>' },
    })
    expect(wrapper.find('.test-item').exists()).toBe(true)
  })

  it('applies separator by default', () => {
    const wrapper = mount(NsList)
    expect(wrapper.find('.q-list--separator').exists()).toBe(true)
  })

  it('applies bordered when set', () => {
    const wrapper = mount(NsList, { props: { bordered: true } })
    expect(wrapper.find('.q-list--bordered').exists()).toBe(true)
  })

  it('applies dense when set', () => {
    const wrapper = mount(NsList, { props: { dense: true } })
    expect(wrapper.find('.q-list--dense').exists()).toBe(true)
  })

  it('passes through attrs', () => {
    const wrapper = mount(NsList, {
      attrs: { 'data-testid': 'my-list' },
    })
    expect(wrapper.find('.q-list').attributes('data-testid')).toBe('my-list')
  })

  describe('accessibility', () => {
    it('has role="list"', () => {
      const wrapper = mount(NsList)
      expect(wrapper.find('.q-list').attributes('role')).toBe('list')
    })

    it('passes aria-label when provided', () => {
      const wrapper = mount(NsList, {
        props: { ariaLabel: 'Navigation items' },
      })
      expect(wrapper.find('.q-list').attributes('aria-label')).toBe('Navigation items')
    })

    it('omits aria-label when not provided', () => {
      const wrapper = mount(NsList)
      expect(wrapper.find('.q-list').attributes('aria-label')).toBeUndefined()
    })
  })
})
