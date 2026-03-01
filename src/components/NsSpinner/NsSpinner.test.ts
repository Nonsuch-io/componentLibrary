import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsSpinner from './NsSpinner.vue'

describe('NsSpinner', () => {
  it('renders as an SVG element', () => {
    const wrapper = mount(NsSpinner)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('applies the ns-spinner class', () => {
    const wrapper = mount(NsSpinner)
    expect(wrapper.find('.ns-spinner').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsSpinner, { attrs: { 'data-testid': 'test-ns-spinner' } })
    expect(wrapper.find('.q-spinner').attributes('data-testid')).toBe('test-ns-spinner')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsSpinner, { attrs: { 'aria-label': 'Loading' } })
      expect(wrapper.find('.q-spinner').attributes('aria-label')).toBe('Loading')
    })
  })
})
