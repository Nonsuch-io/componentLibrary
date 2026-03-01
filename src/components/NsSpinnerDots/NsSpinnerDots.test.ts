import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsSpinnerDots from './NsSpinnerDots.vue'

describe('NsSpinnerDots', () => {
  it('applies the ns-spinner-dots class', () => {
    const wrapper = mount(NsSpinnerDots)
    expect(wrapper.find('.ns-spinner-dots').exists()).toBe(true)
  })

  it('renders as an SVG element', () => {
    const wrapper = mount(NsSpinnerDots)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsSpinnerDots, { attrs: { 'data-testid': 'test-spinner-dots' } })
    expect(wrapper.find('svg.q-spinner').attributes('data-testid')).toBe('test-spinner-dots')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsSpinnerDots, { attrs: { 'aria-label': 'Loading' } })
      expect(wrapper.find('svg.q-spinner').attributes('aria-label')).toBe('Loading')
    })
  })
})
