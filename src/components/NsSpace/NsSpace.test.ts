import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsSpace from './NsSpace.vue'

describe('NsSpace', () => {
  it('renders with slot content', () => {
    const wrapper = mount(NsSpace, { slots: { default: 'Spacer content' } })
    expect(wrapper.find('.q-space').exists()).toBe(true)
  })

  it('applies the ns-space class', () => {
    const wrapper = mount(NsSpace, { slots: { default: 'content' } })
    expect(wrapper.find('.ns-space').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsSpace, {
      slots: { default: 'content' },
      attrs: { 'data-testid': 'test-ns-space' },
    })
    expect(wrapper.find('.q-space').attributes('data-testid')).toBe('test-ns-space')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsSpace, {
        slots: { default: 'content' },
        attrs: { 'aria-label': 'Test label' },
      })
      expect(wrapper.find('.q-space').attributes('aria-label')).toBe('Test label')
    })
  })
})
