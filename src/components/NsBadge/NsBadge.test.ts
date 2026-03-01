import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsBadge from './NsBadge.vue'

describe('NsBadge', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsBadge, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-badge class', () => {
    const wrapper = mount(NsBadge)
    expect(wrapper.find('.ns-badge').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsBadge, { attrs: { 'data-testid': 'test-ns-badge' } })
    expect(wrapper.find('.q-badge').attributes('data-testid')).toBe('test-ns-badge')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsBadge, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-badge').attributes('aria-label')).toBe('Test label')
    })
  })
})
