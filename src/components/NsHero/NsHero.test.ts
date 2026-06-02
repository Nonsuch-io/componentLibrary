import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsHero from './NsHero.vue'

describe('NsHero', () => {
  it('should render eyebrow slot content', () => {
    const wrapper = mount(NsHero, {
      slots: { eyebrow: '<span class="eyebrow">Canadian software</span>' },
    })
    expect(wrapper.find('.eyebrow').exists()).toBe(true)
  })

  it('should render headline slot content', () => {
    const wrapper = mount(NsHero, {
      slots: { headline: '<h1 class="headline">Run your shop.</h1>' },
    })
    expect(wrapper.find('.headline').exists()).toBe(true)
    expect(wrapper.text()).toContain('Run your shop.')
  })

  it('should render capture slot content', () => {
    const wrapper = mount(NsHero, {
      slots: { capture: '<div class="capture">Email input here</div>' },
    })
    expect(wrapper.find('.capture').exists()).toBe(true)
  })

  it('should render media slot content', () => {
    const wrapper = mount(NsHero, {
      slots: { media: '<img class="logo" src="logo.svg" alt="logo" />' },
    })
    expect(wrapper.find('.logo').exists()).toBe(true)
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsHero)
    expect(wrapper.find('.ns-hero').exists()).toBe(true)
  })

  it('should render as a section element', () => {
    const wrapper = mount(NsHero)
    expect(wrapper.element.tagName).toBe('SECTION')
  })
})
