import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsBadge from './NsBadge.vue'

describe('NsBadge', () => {
  describe('rendering', () => {
    it('should render slot content', () => {
      const wrapper = mount(NsBadge, { slots: { default: 'New' } })
      expect(wrapper.find('.ns-badge').exists()).toBe(true)
      expect(wrapper.text()).toContain('New')
    })

    it('should default to primary variant and small size', () => {
      const wrapper = mount(NsBadge, { slots: { default: 'New' } })
      expect(wrapper.find('.ns-badge--primary').exists()).toBe(true)
      expect(wrapper.find('.ns-badge--small').exists()).toBe(true)
    })

    it('should apply variant class', () => {
      const wrapper = mount(NsBadge, {
        props: { variant: 'negative' },
        slots: { default: 'Error' },
      })
      expect(wrapper.find('.ns-badge--negative').exists()).toBe(true)
    })

    it('should apply size class', () => {
      const wrapper = mount(NsBadge, {
        props: { size: 'medium' },
        slots: { default: 'New' },
      })
      expect(wrapper.find('.ns-badge--medium').exists()).toBe(true)
    })

    it('should apply small size class', () => {
      const wrapper = mount(NsBadge, {
        props: { size: 'small' },
        slots: { default: 'New' },
      })
      expect(wrapper.find('.ns-badge--small').exists()).toBe(true)
    })
  })

  describe('passthrough', () => {
    it('should forward attrs to the root element', () => {
      const wrapper = mount(NsBadge, {
        attrs: { 'data-testid': 'my-badge' },
        slots: { default: 'New' },
      })
      expect(wrapper.find('.ns-badge').attributes('data-testid')).toBe('my-badge')
    })

    it('should forward aria attributes', () => {
      const wrapper = mount(NsBadge, {
        attrs: { 'aria-label': 'New notifications' },
        slots: { default: '3' },
      })
      expect(wrapper.find('.ns-badge').attributes('aria-label')).toBe('New notifications')
    })
  })
})
