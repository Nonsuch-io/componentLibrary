import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsEyebrowTag from './NsEyebrowTag.vue'

describe('NsEyebrowTag', () => {
  it('should render slot content when default slot is provided', () => {
    const wrapper = mount(NsEyebrowTag, { slots: { default: 'A new Canadian retail software' } })
    expect(wrapper.text()).toContain('A new Canadian retail software')
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsEyebrowTag)
    expect(wrapper.find('.ns-eyebrow-tag').exists()).toBe(true)
  })

  it('should render as a div element', () => {
    const wrapper = mount(NsEyebrowTag)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('should render slotted image alongside text', () => {
    const wrapper = mount(NsEyebrowTag, {
      slots: { default: 'Label <img src="flag.png" alt="flag" />' },
    })
    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.text()).toContain('Label')
  })
})
