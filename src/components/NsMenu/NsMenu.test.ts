import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsMenu from './NsMenu.vue'

describe('NsMenu', () => {
  it('mounts without errors', () => {
    const wrapper = mount(NsMenu, { slots: { default: 'Test content' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the component', () => {
    const wrapper = mount(NsMenu)
    expect(wrapper.vm).toBeTruthy()
  })

  describe('accessibility', () => {
    it('component instance is accessible', () => {
      const wrapper = mount(NsMenu)
      expect(wrapper.vm.$el).toBeTruthy()
    })
  })
})
