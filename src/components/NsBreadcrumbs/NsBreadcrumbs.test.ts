import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsBreadcrumbs from './NsBreadcrumbs.vue'

describe('NsBreadcrumbs', () => {
  it('mounts without errors', () => {
    const wrapper = mount(NsBreadcrumbs, { slots: { default: 'Test content' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the component', () => {
    const wrapper = mount(NsBreadcrumbs)
    expect(wrapper.vm).toBeTruthy()
  })

  describe('accessibility', () => {
    it('component instance is accessible', () => {
      const wrapper = mount(NsBreadcrumbs)
      expect(wrapper.vm.$el).toBeTruthy()
    })
  })
})
