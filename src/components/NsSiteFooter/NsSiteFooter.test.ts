import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsSiteFooter from './NsSiteFooter.vue'

describe('NsSiteFooter', () => {
  it('should render the label when provided', () => {
    const wrapper = mount(NsSiteFooter, { props: { label: 'Contact or follow us' } })
    expect(wrapper.text()).toContain('Contact or follow us')
  })

  it('should not render the label element when label is absent', () => {
    const wrapper = mount(NsSiteFooter)
    expect(wrapper.find('.ns-site-footer__label').exists()).toBe(false)
  })

  it('should render social links when provided', () => {
    const wrapper = mount(NsSiteFooter, {
      props: {
        socialLinks: [
          { href: 'https://bsky.app', icon: 'bluesky.svg', label: 'Bluesky' },
          { href: 'https://instagram.com', icon: 'instagram.svg', label: 'Instagram' },
        ],
      },
    })
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(2)
  })

  it('should set the correct href on each social link', () => {
    const wrapper = mount(NsSiteFooter, {
      props: {
        socialLinks: [{ href: 'https://bsky.app', icon: 'bluesky.svg', label: 'Bluesky' }],
      },
    })
    expect(wrapper.find('a').attributes('href')).toBe('https://bsky.app')
  })

  it('should not render the social container when no links are provided', () => {
    const wrapper = mount(NsSiteFooter)
    expect(wrapper.find('.ns-site-footer__social').exists()).toBe(false)
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsSiteFooter)
    expect(wrapper.find('.ns-site-footer').exists()).toBe(true)
  })

  it('should render as a footer element', () => {
    const wrapper = mount(NsSiteFooter)
    expect(wrapper.element.tagName).toBe('FOOTER')
  })

  describe('accessibility', () => {
    it('should apply aria-label to each social link', () => {
      const wrapper = mount(NsSiteFooter, {
        props: {
          socialLinks: [{ href: 'https://bsky.app', icon: 'bluesky.svg', label: 'Bluesky' }],
        },
      })
      expect(wrapper.find('a').attributes('aria-label')).toBe('Bluesky')
    })

    it('should open social links in a new tab', () => {
      const wrapper = mount(NsSiteFooter, {
        props: {
          socialLinks: [{ href: 'https://bsky.app', icon: 'bluesky.svg', label: 'Bluesky' }],
        },
      })
      expect(wrapper.find('a').attributes('target')).toBe('_blank')
      expect(wrapper.find('a').attributes('rel')).toContain('noopener')
    })
  })
})
