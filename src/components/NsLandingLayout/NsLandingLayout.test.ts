import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsLandingLayout from './NsLandingLayout.vue'

describe('NsLandingLayout', () => {
  it('renders default slot content inside the main element', () => {
    const wrapper = mount(NsLandingLayout, {
      slots: { default: '<div class="content-marker">section content</div>' },
    })
    const main = wrapper.find('.ns-landing-layout__main')
    expect(main.exists()).toBe(true)
    expect(main.find('.content-marker').exists()).toBe(true)
  })

  it('renders header slot when provided', () => {
    const wrapper = mount(NsLandingLayout, {
      slots: { header: '<nav class="header-marker">nav</nav>' },
    })
    expect(wrapper.find('.ns-landing-layout__header').exists()).toBe(true)
    expect(wrapper.find('.header-marker').exists()).toBe(true)
  })

  it('renders hero slot when provided', () => {
    const wrapper = mount(NsLandingLayout, {
      slots: { hero: '<div class="hero-marker">hero</div>' },
    })
    expect(wrapper.find('.ns-landing-layout__hero').exists()).toBe(true)
    expect(wrapper.find('.hero-marker').exists()).toBe(true)
  })

  it('renders footer slot when provided', () => {
    const wrapper = mount(NsLandingLayout, {
      slots: { footer: '<div class="footer-marker">footer</div>' },
    })
    expect(wrapper.find('.ns-landing-layout__footer').exists()).toBe(true)
    expect(wrapper.find('.footer-marker').exists()).toBe(true)
  })

  it('omits structural elements when their slots are empty', () => {
    const wrapper = mount(NsLandingLayout)
    expect(wrapper.find('.ns-landing-layout__header').exists()).toBe(false)
    expect(wrapper.find('.ns-landing-layout__hero').exists()).toBe(false)
    expect(wrapper.find('.ns-landing-layout__main').exists()).toBe(false)
    expect(wrapper.find('.ns-landing-layout__footer').exists()).toBe(false)
  })

  it('renders slots in source order: header, hero, main, footer', () => {
    const wrapper = mount(NsLandingLayout, {
      slots: {
        header: '<div>HEADER</div>',
        hero: '<div>HERO</div>',
        default: '<div>MAIN</div>',
        footer: '<div>FOOTER</div>',
      },
    })
    const html = wrapper.html()
    const headerIdx = html.indexOf('HEADER')
    const heroIdx = html.indexOf('HERO')
    const mainIdx = html.indexOf('MAIN')
    const footerIdx = html.indexOf('FOOTER')
    expect(headerIdx).toBeLessThan(heroIdx)
    expect(heroIdx).toBeLessThan(mainIdx)
    expect(mainIdx).toBeLessThan(footerIdx)
  })

  it('owns <main> only — the slot content owns banner and contentinfo', () => {
    // CHANGED DELIBERATELY. This asserted <header> and <footer> here, which is
    // what produced nested duplicate landmarks: this layout is documented to hold
    // NsSiteHeader / NsSiteFooter, and those render their own. axe reported five
    // rules at once (componentLibrary-057). <main> stays because nothing else
    // provides it.
    const wrapper = mount(NsLandingLayout, {
      slots: {
        header: 'h',
        hero: 'hero',
        default: 'main',
        footer: 'f',
      },
    })
    expect(wrapper.find('header').exists()).toBe(false)
    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(false)
  })
})
