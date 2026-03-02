import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsExpansionItem from './NsExpansionItem.vue'

describe('NsExpansionItem', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsExpansionItem, { slots: { default: 'Expansion content' } })
    expect(wrapper.text()).toContain('Expansion content')
  })

  it('applies the ns-expansion-item class', () => {
    const wrapper = mount(NsExpansionItem)
    expect(wrapper.find('.ns-expansion-item').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsExpansionItem, { attrs: { 'data-testid': 'test-ns-expansion-item' } })
    expect(wrapper.find('.q-expansion-item').attributes('data-testid')).toBe(
      'test-ns-expansion-item',
    )
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsExpansionItem, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-expansion-item').attributes('aria-label')).toBe('Test label')
    })
  })
})
