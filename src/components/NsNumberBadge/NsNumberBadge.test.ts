import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsNumberBadge from './NsNumberBadge.vue'

describe('NsNumberBadge', () => {
  describe('rendering', () => {
    it('should render slot content', () => {
      const wrapper = mount(NsNumberBadge, { slots: { default: '3' } })
      expect(wrapper.find('.ns-number-badge').exists()).toBe(true)
      expect(wrapper.text()).toContain('3')
    })

    it('should default to primary variant and small size', () => {
      const wrapper = mount(NsNumberBadge, { slots: { default: '1' } })
      expect(wrapper.find('.ns-number-badge--primary').exists()).toBe(true)
      expect(wrapper.find('.ns-number-badge--small').exists()).toBe(true)
    })

    it('should apply variant class', () => {
      const wrapper = mount(NsNumberBadge, {
        props: { variant: 'negative' },
        slots: { default: '5' },
      })
      expect(wrapper.find('.ns-number-badge--negative').exists()).toBe(true)
    })

    it('should apply size class', () => {
      const wrapper = mount(NsNumberBadge, {
        props: { size: 'medium' },
        slots: { default: '2' },
      })
      expect(wrapper.find('.ns-number-badge--medium').exists()).toBe(true)
    })
  })

  describe('passthrough', () => {
    it('should forward attrs to the root element', () => {
      const wrapper = mount(NsNumberBadge, {
        attrs: { 'data-testid': 'my-number-badge' },
        slots: { default: '7' },
      })
      expect(wrapper.find('.ns-number-badge').attributes('data-testid')).toBe('my-number-badge')
    })

    it('should forward aria attributes', () => {
      const wrapper = mount(NsNumberBadge, {
        attrs: { 'aria-label': '3 unread messages' },
        slots: { default: '3' },
      })
      expect(wrapper.find('.ns-number-badge').attributes('aria-label')).toBe('3 unread messages')
    })
  })
})
