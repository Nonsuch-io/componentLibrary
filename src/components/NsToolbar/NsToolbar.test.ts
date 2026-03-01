import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsToolbar from './NsToolbar.vue'

describe('NsToolbar', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsToolbar, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-toolbar class', () => {
    const wrapper = mount(NsToolbar)
    expect(wrapper.find('.ns-toolbar').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsToolbar, { attrs: { 'data-testid': 'test-ns-toolbar' } })
    expect(wrapper.find('.q-toolbar').attributes('data-testid')).toBe('test-ns-toolbar')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsToolbar, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-toolbar').attributes('aria-label')).toBe('Test label')
    })
  })
})
