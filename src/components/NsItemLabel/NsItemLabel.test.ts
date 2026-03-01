import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsItemLabel from './NsItemLabel.vue'

describe('NsItemLabel', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsItemLabel, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-item-label class', () => {
    const wrapper = mount(NsItemLabel)
    expect(wrapper.find('.ns-item-label').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsItemLabel, { attrs: { 'data-testid': 'test-ns-item-label' } })
    expect(wrapper.find('.q-item__label').attributes('data-testid')).toBe('test-ns-item-label')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsItemLabel, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-item__label').attributes('aria-label')).toBe('Test label')
    })
  })
})
