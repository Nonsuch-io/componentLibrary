import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsItemSection from './NsItemSection.vue'

describe('NsItemSection', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsItemSection, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-item-section class', () => {
    const wrapper = mount(NsItemSection)
    expect(wrapper.find('.ns-item-section').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsItemSection, { attrs: { 'data-testid': 'test-ns-item-section' } })
    expect(wrapper.find('.q-item__section').attributes('data-testid')).toBe('test-ns-item-section')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsItemSection, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-item__section').attributes('aria-label')).toBe('Test label')
    })
  })
})
