import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsItem from './NsItem.vue'

describe('NsItem', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsItem, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-item class', () => {
    const wrapper = mount(NsItem)
    expect(wrapper.find('.ns-item').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsItem, { attrs: { 'data-testid': 'test-ns-item' } })
    expect(wrapper.find('.q-item').attributes('data-testid')).toBe('test-ns-item')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsItem, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-item').attributes('aria-label')).toBe('Test label')
    })
  })
})

describe('disable', () => {
  it('declares a disable prop rather than relying on attrs fallthrough', () => {
    const wrapper = mount(NsItem, { props: { disable: true } })
    expect(wrapper.props('disable')).toBe(true)
  })
})
