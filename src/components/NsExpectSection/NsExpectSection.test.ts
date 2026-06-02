import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsExpectSection from './NsExpectSection.vue'

describe('NsExpectSection', () => {
  it('should render default slot content', () => {
    const wrapper = mount(NsExpectSection, {
      slots: { default: '<p class="steps">Step list here</p>' },
    })
    expect(wrapper.find('.steps').exists()).toBe(true)
    expect(wrapper.text()).toContain('Step list here')
  })

  it('should render eyebrow slot content', () => {
    const wrapper = mount(NsExpectSection, {
      slots: { eyebrow: '<div class="eyebrow">What to expect</div>' },
    })
    expect(wrapper.find('.eyebrow').exists()).toBe(true)
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsExpectSection)
    expect(wrapper.find('.ns-expect-section').exists()).toBe(true)
  })

  it('should render as a section element', () => {
    const wrapper = mount(NsExpectSection)
    expect(wrapper.element.tagName).toBe('SECTION')
  })
})
