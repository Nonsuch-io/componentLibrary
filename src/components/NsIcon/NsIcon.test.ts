import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsIcon from './NsIcon.vue'

describe('NsIcon', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsIcon, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-icon class', () => {
    const wrapper = mount(NsIcon)
    expect(wrapper.find('.ns-icon').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsIcon, { attrs: { 'data-testid': 'test-ns-icon' } })
    expect(wrapper.find('.q-icon').attributes('data-testid')).toBe('test-ns-icon')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsIcon, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-icon').attributes('aria-label')).toBe('Test label')
    })
  })
})
