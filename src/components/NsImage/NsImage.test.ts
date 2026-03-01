import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsImage from './NsImage.vue'

describe('NsImage', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsImage, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-image class', () => {
    const wrapper = mount(NsImage)
    expect(wrapper.find('.ns-image').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsImage, { attrs: { 'data-testid': 'test-ns-image' } })
    expect(wrapper.find('.q-img').attributes('data-testid')).toBe('test-ns-image')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsImage, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-img').attributes('aria-label')).toBe('Test label')
    })
  })
})
