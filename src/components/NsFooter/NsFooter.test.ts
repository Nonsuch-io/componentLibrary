import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsFooter from './NsFooter.vue'

describe('NsFooter', () => {
  it('mounts without errors', () => {
    const wrapper = mount(NsFooter, { slots: { default: 'Test content' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the component', () => {
    const wrapper = mount(NsFooter)
    expect(wrapper.vm).toBeTruthy()
  })

  describe('accessibility', () => {
    it('component instance is accessible', () => {
      const wrapper = mount(NsFooter)
      expect(wrapper.vm.$el).toBeTruthy()
    })
  })
})
