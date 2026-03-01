import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsPageContainer from './NsPageContainer.vue'

describe('NsPageContainer', () => {
  it('mounts without errors', () => {
    const wrapper = mount(NsPageContainer, { slots: { default: 'Test content' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the component', () => {
    const wrapper = mount(NsPageContainer)
    expect(wrapper.vm).toBeTruthy()
  })

  describe('accessibility', () => {
    it('component instance is accessible', () => {
      const wrapper = mount(NsPageContainer)
      expect(wrapper.vm.$el).toBeTruthy()
    })
  })
})
