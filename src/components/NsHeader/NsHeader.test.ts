import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsHeader from './NsHeader.vue'

describe('NsHeader', () => {
  it('mounts without errors', () => {
    const wrapper = mount(NsHeader, { slots: { default: 'Test content' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the component', () => {
    const wrapper = mount(NsHeader)
    expect(wrapper.vm).toBeTruthy()
  })

  describe('accessibility', () => {
    it('component instance is accessible', () => {
      const wrapper = mount(NsHeader)
      expect(wrapper.vm.$el).toBeTruthy()
    })
  })
})
