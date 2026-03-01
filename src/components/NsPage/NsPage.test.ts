import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsPage from './NsPage.vue'

describe('NsPage', () => {
  it('mounts without errors', () => {
    const wrapper = mount(NsPage, { slots: { default: 'Test content' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the component', () => {
    const wrapper = mount(NsPage)
    expect(wrapper.vm).toBeTruthy()
  })

  describe('accessibility', () => {
    it('component instance is accessible', () => {
      const wrapper = mount(NsPage)
      expect(wrapper.vm.$el).toBeTruthy()
    })
  })
})
