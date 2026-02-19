import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsAvatar from './NsAvatar.vue'

describe('NsAvatar', () => {
  it('renders with default props', () => {
    const wrapper = mount(NsAvatar)
    expect(wrapper.find('.ns-avatar').exists()).toBe(true)
  })

  it('applies ns-avatar class', () => {
    const wrapper = mount(NsAvatar)
    expect(wrapper.classes()).toContain('ns-avatar')
  })

  it('renders default slot content', () => {
    const wrapper = mount(NsAvatar, { slots: { default: 'JD' } })
    expect(wrapper.text()).toContain('JD')
  })

  it('maps sm size preset to 32px', () => {
    const wrapper = mount(NsAvatar, { props: { size: 'sm' } })
    const style = wrapper.find('.q-avatar').attributes('style')
    expect(style).toContain('32px')
  })

  it('maps lg size preset to 64px', () => {
    const wrapper = mount(NsAvatar, { props: { size: 'lg' } })
    const style = wrapper.find('.q-avatar').attributes('style')
    expect(style).toContain('64px')
  })

  it('maps xl size preset to 96px', () => {
    const wrapper = mount(NsAvatar, { props: { size: 'xl' } })
    const style = wrapper.find('.q-avatar').attributes('style')
    expect(style).toContain('96px')
  })

  it('passes through a custom size string when not a preset', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wrapper = mount(NsAvatar, { props: { size: '128px' as any } })
    const style = wrapper.find('.q-avatar').attributes('style')
    expect(style).toContain('128px')
  })

  describe('accessibility', () => {
    it('is hidden from screen readers when no ariaLabel', () => {
      const wrapper = mount(NsAvatar, { slots: { default: 'JD' } })
      const avatar = wrapper.find('.q-avatar')
      expect(avatar.attributes('aria-hidden')).toBe('true')
      expect(avatar.attributes('role')).toBeUndefined()
    })

    it('has role="img" and aria-label when ariaLabel is provided', () => {
      const wrapper = mount(NsAvatar, {
        props: { ariaLabel: 'Jane Doe' },
        slots: { default: 'JD' },
      })
      const avatar = wrapper.find('.q-avatar')
      expect(avatar.attributes('aria-label')).toBe('Jane Doe')
      expect(avatar.attributes('role')).toBe('img')
      expect(avatar.attributes('aria-hidden')).toBeUndefined()
    })
  })
})
