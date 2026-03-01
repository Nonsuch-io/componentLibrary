import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsCardActions from './NsCardActions.vue'

describe('NsCardActions', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsCardActions, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-card-actions class', () => {
    const wrapper = mount(NsCardActions)
    expect(wrapper.find('.ns-card-actions').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsCardActions, { attrs: { 'data-testid': 'test-ns-card-actions' } })
    expect(wrapper.find('.q-card__actions').attributes('data-testid')).toBe('test-ns-card-actions')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsCardActions, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-card__actions').attributes('aria-label')).toBe('Test label')
    })
  })
})
