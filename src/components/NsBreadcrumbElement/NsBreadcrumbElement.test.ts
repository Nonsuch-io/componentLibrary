import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsBreadcrumbElement from './NsBreadcrumbElement.vue'

describe('NsBreadcrumbElement', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsBreadcrumbElement, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-breadcrumb-element class', () => {
    const wrapper = mount(NsBreadcrumbElement)
    expect(wrapper.find('.ns-breadcrumb-element').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsBreadcrumbElement, { attrs: { 'data-testid': 'test-el' } })
    expect(wrapper.find('.q-breadcrumbs__el').attributes('data-testid')).toBe('test-el')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsBreadcrumbElement, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-breadcrumbs__el').attributes('aria-label')).toBe('Test label')
    })
  })
})
