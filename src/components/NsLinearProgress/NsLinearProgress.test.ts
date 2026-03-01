import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsLinearProgress from './NsLinearProgress.vue'

describe('NsLinearProgress', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsLinearProgress, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-linear-progress class', () => {
    const wrapper = mount(NsLinearProgress)
    expect(wrapper.find('.ns-linear-progress').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsLinearProgress, { attrs: { 'data-testid': 'test-ns-linear-progress' } })
    expect(wrapper.find('.q-linear-progress').attributes('data-testid')).toBe(
      'test-ns-linear-progress',
    )
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsLinearProgress, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-linear-progress').attributes('aria-label')).toBe('Test label')
    })
  })
})
