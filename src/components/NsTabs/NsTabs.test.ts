import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsTabs from './NsTabs.vue'

describe('NsTabs', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsTabs, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-tabs class', () => {
    const wrapper = mount(NsTabs)
    expect(wrapper.find('.ns-tabs').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsTabs, { attrs: { 'data-testid': 'test-ns-tabs' } })
    expect(wrapper.find('.q-tabs').attributes('data-testid')).toBe('test-ns-tabs')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsTabs, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-tabs').attributes('aria-label')).toBe('Test label')
    })
  })
})
