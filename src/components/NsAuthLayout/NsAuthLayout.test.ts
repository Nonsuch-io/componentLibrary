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

  // componentLibrary-grj.2: the sign-up shell — content straight on the canvas.
  describe('surface="canvas"', () => {
    it('renders the slot with NO card, and marks the layout', () => {
      const wrapper = mount(NsAuthLayout, {
        props: { surface: 'canvas', maxWidth: '910px' },
        slots: { default: '<section class="my-section">Profile</section>' },
      })
      expect(wrapper.classes()).toContain('ns-auth-layout--canvas')
      expect(wrapper.find('.ns-card').exists()).toBe(false)
      expect(wrapper.find('.ns-auth-layout__card').exists()).toBe(false)
      // The slot lands directly in the container, so the consumer's section
      // cards sit on the page as the frame draws them.
      expect(wrapper.find('.ns-auth-layout__container > .my-section').exists()).toBe(true)
      expect(
        (wrapper.find('.ns-auth-layout__container').element as HTMLElement).style.maxWidth,
      ).toBe('910px')
    })

    it('keeps the branding slot above the content', () => {
      const wrapper = mount(NsAuthLayout, {
        props: { surface: 'canvas' },
        slots: { default: 'Content', branding: '<h1>butiq</h1>' },
      })
      const container = wrapper.find('.ns-auth-layout__container')
      expect(container.element.children[0].className).toContain('ns-auth-layout__branding')
    })

    it('is the card by default — login, 2FA and reset do not move', () => {
      const wrapper = mount(NsAuthLayout, { slots: { default: 'Content' } })
      expect(wrapper.classes()).toContain('ns-auth-layout--card')
      expect(wrapper.find('.ns-card').exists()).toBe(true)
    })
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
