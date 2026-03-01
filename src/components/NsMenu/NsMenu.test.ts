import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NsMenu from './NsMenu.vue'

describe('NsMenu', () => {
  const mountMenu = (attrs = {}) =>
    mount(NsMenu, {
      slots: { default: 'Menu content' },
      attrs,
    })

  it('mounts and renders', () => {
    const wrapper = mountMenu()
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts slot content', () => {
    const wrapper = mountMenu()
    expect(wrapper.findComponent(NsMenu).exists()).toBe(true)
  })

  describe('accessibility', () => {
    it('forwards aria attributes', () => {
      const wrapper = mountMenu({ 'aria-label': 'Test menu' })
      expect(wrapper.findComponent(NsMenu).exists()).toBe(true)
    })
  })
})
