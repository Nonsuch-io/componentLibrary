import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsSectionEyebrow from './NsSectionEyebrow.vue'

describe('NsSectionEyebrow', () => {
  it('should render label slot content', () => {
    const wrapper = mount(NsSectionEyebrow, { slots: { label: 'What to expect' } })
    expect(wrapper.text()).toContain('What to expect')
  })

  it('should render heading slot content', () => {
    const wrapper = mount(NsSectionEyebrow, { slots: { heading: 'In your Inbox' } })
    expect(wrapper.text()).toContain('In your Inbox')
  })

  it('should render icon slot when provided', () => {
    const wrapper = mount(NsSectionEyebrow, {
      slots: { icon: '<img class="section-icon" src="icon.svg" alt="" />' },
    })
    expect(wrapper.find('.ns-section-eyebrow__icon').exists()).toBe(true)
    expect(wrapper.find('.section-icon').exists()).toBe(true)
  })

  it('should not render icon container when icon slot is absent', () => {
    const wrapper = mount(NsSectionEyebrow)
    expect(wrapper.find('.ns-section-eyebrow__icon').exists()).toBe(false)
  })

  it('should apply brand label colour class by default', () => {
    const wrapper = mount(NsSectionEyebrow)
    expect(wrapper.find('.ns-section-eyebrow__label--brand').exists()).toBe(true)
  })

  it('should apply primary label colour class when labelColor is primary', () => {
    const wrapper = mount(NsSectionEyebrow, { props: { labelColor: 'primary' } })
    expect(wrapper.find('.ns-section-eyebrow__label--primary').exists()).toBe(true)
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsSectionEyebrow)
    expect(wrapper.find('.ns-section-eyebrow').exists()).toBe(true)
  })
})
