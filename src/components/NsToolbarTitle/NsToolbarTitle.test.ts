import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsToolbarTitle from './NsToolbarTitle.vue'

describe('NsToolbarTitle', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsToolbarTitle, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-toolbar-title class', () => {
    const wrapper = mount(NsToolbarTitle)
    expect(wrapper.find('.ns-toolbar-title').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsToolbarTitle, { attrs: { 'data-testid': 'test-ns-toolbar-title' } })
    expect(wrapper.find('.q-toolbar__title').attributes('data-testid')).toBe(
      'test-ns-toolbar-title',
    )
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsToolbarTitle, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-toolbar__title').attributes('aria-label')).toBe('Test label')
    })
  })
})
