import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsLayout from './NsLayout.vue'

describe('NsLayout', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsLayout, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-layout class', () => {
    const wrapper = mount(NsLayout)
    expect(wrapper.find('.ns-layout').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsLayout, { attrs: { 'data-testid': 'test-ns-layout' } })
    expect(wrapper.find('.q-layout').attributes('data-testid')).toBe('test-ns-layout')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsLayout, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-layout').attributes('aria-label')).toBe('Test label')
    })
  })
})
