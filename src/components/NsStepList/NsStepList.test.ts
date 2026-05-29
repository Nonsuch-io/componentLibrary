import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsStepList from './NsStepList.vue'

describe('NsStepList', () => {
  it('should render slot content when default slot is provided', () => {
    const wrapper = mount(NsStepList, { slots: { default: '<p class="step">Step one</p>' } })
    expect(wrapper.find('.step').exists()).toBe(true)
    expect(wrapper.text()).toContain('Step one')
  })

  it('should apply the root class', () => {
    const wrapper = mount(NsStepList)
    expect(wrapper.find('.ns-step-list').exists()).toBe(true)
  })

  it('should render the closing separator', () => {
    const wrapper = mount(NsStepList)
    expect(wrapper.find('.ns-step-list__closing-separator').exists()).toBe(true)
  })

  it('should render multiple slotted children', () => {
    const wrapper = mount(NsStepList, {
      slots: {
        default: '<p class="a">A</p><p class="b">B</p><p class="c">C</p>',
      },
    })
    expect(wrapper.findAll('p')).toHaveLength(3)
  })
})
