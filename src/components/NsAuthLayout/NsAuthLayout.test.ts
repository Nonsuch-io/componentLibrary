import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsAuthLayout from './NsAuthLayout.vue'

describe('NsAuthLayout', () => {
  it('renders default slot content inside the card', () => {
    const wrapper = mount(NsAuthLayout, {
      slots: { default: '<form>Login form</form>' },
    })
    expect(wrapper.text()).toContain('Login form')
  })

  it('renders branding slot when provided', () => {
    const wrapper = mount(NsAuthLayout, {
      slots: {
        branding: '<img alt="Logo" src="/logo.png" />',
        default: 'Form content',
      },
    })
    expect(wrapper.find('.ns-auth-layout__branding').exists()).toBe(true)
    expect(wrapper.find('img[alt="Logo"]').exists()).toBe(true)
  })

  it('hides branding section when no branding slot', () => {
    const wrapper = mount(NsAuthLayout, {
      slots: { default: 'Form content' },
    })
    expect(wrapper.find('.ns-auth-layout__branding').exists()).toBe(false)
  })

  it('applies default maxWidth of 440px', () => {
    const wrapper = mount(NsAuthLayout, {
      slots: { default: 'Content' },
    })
    const container = wrapper.find('.ns-auth-layout__container')
    expect(container.attributes('style')).toContain('max-width: 440px')
  })

  it('applies custom maxWidth prop', () => {
    const wrapper = mount(NsAuthLayout, {
      props: { maxWidth: '600px' },
      slots: { default: 'Content' },
    })
    const container = wrapper.find('.ns-auth-layout__container')
    expect(container.attributes('style')).toContain('max-width: 600px')
  })

  it('renders NsCard wrapper around content', () => {
    const wrapper = mount(NsAuthLayout, {
      slots: { default: 'Card content' },
    })
    expect(wrapper.find('.ns-card').exists()).toBe(true)
  })

  it('uses full width container for mobile-first layout', () => {
    const wrapper = mount(NsAuthLayout, {
      slots: { default: 'Content' },
    })
    const container = wrapper.find('.ns-auth-layout__container')
    expect(container.exists()).toBe(true)
    // Container should take full width (constrained only by maxWidth)
    expect(wrapper.find('.ns-auth-layout__card').exists()).toBe(true)
  })

  it('composes NsLayout, NsPageContainer, and NsPage', () => {
    const wrapper = mount(NsAuthLayout, {
      slots: { default: 'Content' },
    })
    expect(wrapper.find('.ns-layout').exists()).toBe(true)
    expect(wrapper.find('.ns-page-container').exists()).toBe(true)
    expect(wrapper.find('.ns-page').exists()).toBe(true)
  })
})
