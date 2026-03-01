import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsCardSection from './NsCardSection.vue'

describe('NsCardSection', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsCardSection, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-card-section class', () => {
    const wrapper = mount(NsCardSection)
    expect(wrapper.find('.ns-card-section').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsCardSection, { attrs: { 'data-testid': 'test-ns-card-section' } })
    expect(wrapper.find('.q-card__section').attributes('data-testid')).toBe('test-ns-card-section')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsCardSection, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-card__section').attributes('aria-label')).toBe('Test label')
    })
  })
})
