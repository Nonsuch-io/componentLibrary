import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsTimeline from './NsTimeline.vue'

describe('NsTimeline', () => {
  it('renders with default slot content', () => {
    const wrapper = mount(NsTimeline, { slots: { default: 'Test content' } })
    expect(wrapper.text()).toContain('Test content')
  })

  it('applies the ns-timeline class', () => {
    const wrapper = mount(NsTimeline)
    expect(wrapper.find('.ns-timeline').exists()).toBe(true)
  })

  it('passes through attributes to the underlying Quasar component', () => {
    const wrapper = mount(NsTimeline, { attrs: { 'data-testid': 'test-ns-timeline' } })
    expect(wrapper.find('.q-timeline').attributes('data-testid')).toBe('test-ns-timeline')
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mount(NsTimeline, { attrs: { 'aria-label': 'Test label' } })
      expect(wrapper.find('.q-timeline').attributes('aria-label')).toBe('Test label')
    })
  })
})
