import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsSiteHeader from './NsSiteHeader.vue'

describe('NsSiteHeader', () => {
  it('should render logo slot content', () => {
    const wrapper = mount(NsSiteHeader, {
      slots: { logo: '<img class="wordmark" src="logo.svg" alt="Acme" />' },
    })
    expect(wrapper.find('.wordmark').exists()).toBe(true)
  })

  it('should render nav slot content', () => {
    const wrapper = mount(NsSiteHeader, {
      slots: { nav: '<a class="nav-link" href="/">Home</a>' },
    })
    expect(wrapper.find('.nav-link').exists()).toBe(true)
    expect(wrapper.text()).toContain('Home')
  })

  it('should render actions slot when provided', () => {
    const wrapper = mount(NsSiteHeader, {
      slots: { actions: '<button class="sign-in">Sign in</button>' },
    })
    expect(wrapper.find('.ns-site-header__actions').exists()).toBe(true)
    expect(wrapper.find('.sign-in').exists()).toBe(true)
  })

  it('should not render actions container when actions slot is absent', () => {
    const wrapper = mount(NsSiteHeader)
    expect(wrapper.find('.ns-site-header__actions').exists()).toBe(false)
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsSiteHeader)
    expect(wrapper.find('.ns-site-header').exists()).toBe(true)
  })

  it('should render as a header element', () => {
    const wrapper = mount(NsSiteHeader)
    expect(wrapper.element.tagName).toBe('HEADER')
  })

  describe('accessibility', () => {
    it('should contain a nav element', () => {
      const wrapper = mount(NsSiteHeader)
      expect(wrapper.find('nav').exists()).toBe(true)
    })
  })
})
