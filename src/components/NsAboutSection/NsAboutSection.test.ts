import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsAboutSection from './NsAboutSection.vue'

describe('NsAboutSection', () => {
  it('should render default slot content', () => {
    const wrapper = mount(NsAboutSection, {
      slots: { default: '<p class="body">About butiq</p>' },
    })
    expect(wrapper.find('.body').exists()).toBe(true)
    expect(wrapper.text()).toContain('About butiq')
  })

  it('should render eyebrow slot content', () => {
    const wrapper = mount(NsAboutSection, {
      slots: { eyebrow: '<div class="eyebrow">More About</div>' },
    })
    expect(wrapper.find('.eyebrow').exists()).toBe(true)
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsAboutSection)
    expect(wrapper.find('.ns-about-section').exists()).toBe(true)
  })

  it('should render as a section element', () => {
    const wrapper = mount(NsAboutSection)
    expect(wrapper.element.tagName).toBe('SECTION')
  })
})
