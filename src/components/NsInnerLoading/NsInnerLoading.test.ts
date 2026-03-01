import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsInnerLoading from './NsInnerLoading.vue'

describe('NsInnerLoading', () => {
  it('mounts without errors', () => {
    const wrapper = mount(NsInnerLoading, { props: { showing: true } })
    expect(wrapper.exists()).toBe(true)
  })

  it('applies the ns-inner-loading class when showing', () => {
    const wrapper = mount(NsInnerLoading, { props: { showing: true } })
    expect(wrapper.find('.ns-inner-loading').exists()).toBe(true)
  })

  it('renders the component instance', () => {
    const wrapper = mount(NsInnerLoading)
    expect(wrapper.vm).toBeTruthy()
  })

  describe('accessibility', () => {
    it('component instance is accessible', () => {
      const wrapper = mount(NsInnerLoading)
      expect(wrapper.vm.$el).toBeTruthy()
    })
  })
})
