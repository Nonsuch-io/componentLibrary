import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsAvatar from './NsAvatar.vue'

describe('NsAvatar', () => {
  describe('rendering', () => {
    it('should render with ns-avatar class', () => {
      const wrapper = mount(NsAvatar)
      expect(wrapper.find('.ns-avatar').exists()).toBe(true)
    })

    it('should default to md size', () => {
      const wrapper = mount(NsAvatar)
      expect(wrapper.find('.ns-avatar--md').exists()).toBe(true)
    })

    it('should apply size class', () => {
      const wrapper = mount(NsAvatar, { props: { size: 'lg' } })
      expect(wrapper.find('.ns-avatar--lg').exists()).toBe(true)
    })
  })

  describe('photo state', () => {
    it('should render an img when src is provided', () => {
      const wrapper = mount(NsAvatar, { props: { src: '/avatar.jpg' } })
      const img = wrapper.find('img.ns-avatar__image')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('/avatar.jpg')
    })

    it('should use alt prop as image alt text', () => {
      const wrapper = mount(NsAvatar, { props: { src: '/avatar.jpg', alt: 'Jane Doe' } })
      expect(wrapper.find('img').attributes('alt')).toBe('Jane Doe')
    })

    it('should fall back to ariaLabel for alt text when alt is not set', () => {
      const wrapper = mount(NsAvatar, {
        props: { src: '/avatar.jpg', ariaLabel: 'Jane Doe' },
      })
      expect(wrapper.find('img').attributes('alt')).toBe('Jane Doe')
    })
  })

  describe('initials state', () => {
    it('should render slot content when no src', () => {
      const wrapper = mount(NsAvatar, { slots: { default: 'JD' } })
      expect(wrapper.text()).toContain('JD')
      expect(wrapper.find('img').exists()).toBe(false)
    })
  })

  describe('accessibility', () => {
    it('should be hidden from screen readers when no ariaLabel', () => {
      const wrapper = mount(NsAvatar)
      expect(wrapper.find('.ns-avatar').attributes('aria-hidden')).toBe('true')
      expect(wrapper.find('.ns-avatar').attributes('role')).toBeUndefined()
    })

    it('should have role="img" and aria-label when ariaLabel is provided', () => {
      const wrapper = mount(NsAvatar, {
        props: { ariaLabel: 'Jane Doe' },
        slots: { default: 'JD' },
      })
      expect(wrapper.find('.ns-avatar').attributes('aria-label')).toBe('Jane Doe')
      expect(wrapper.find('.ns-avatar').attributes('role')).toBe('img')
      expect(wrapper.find('.ns-avatar').attributes('aria-hidden')).toBeUndefined()
    })
  })

  describe('passthrough', () => {
    it('should forward attrs to the root element', () => {
      const wrapper = mount(NsAvatar, { attrs: { 'data-testid': 'my-avatar' } })
      expect(wrapper.find('.ns-avatar').attributes('data-testid')).toBe('my-avatar')
    })
  })
})
