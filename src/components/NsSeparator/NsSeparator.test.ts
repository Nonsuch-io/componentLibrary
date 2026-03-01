import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsSeparator from './NsSeparator.vue'

describe('NsSeparator', () => {
  it('renders as a separator element', () => {
    const wrapper = mount(NsSeparator)
    expect(wrapper.find('hr').exists()).toBe(true)
  })

  it('applies the ns-separator class', () => {
    const wrapper = mount(NsSeparator)
    expect(wrapper.find('.ns-separator').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsSeparator, { attrs: { 'data-testid': 'test-ns-separator' } })
    expect(wrapper.find('.q-separator').attributes('data-testid')).toBe('test-ns-separator')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsSeparator, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-separator').attributes('aria-label')).toBe('Test label')
    })
  })
})
