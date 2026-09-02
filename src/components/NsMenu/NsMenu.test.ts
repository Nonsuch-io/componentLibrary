import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
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

    // QMenu's rendered popup is teleported to document.body, so these two
    // tests mount the menu open and read the live DOM rather than the
    // wrapper's own markup.
    describe('role (componentLibrary-nb7)', () => {
      let openWrapper: VueWrapper | undefined

      afterEach(() => {
        openWrapper?.unmount()
        openWrapper = undefined
      })

      it('does not set role="menu" by default', async () => {
        openWrapper = mount(NsMenu, {
          attrs: { modelValue: true, 'no-parent-event': true },
          slots: { default: 'Menu content' },
          attachTo: document.body,
        })
        await nextTick()
        await nextTick()

        const popup = document.querySelector('.q-menu')
        expect(popup).not.toBeNull()
        expect(popup?.hasAttribute('role')).toBe(false)
      })

      it('lets a consumer declare a role through fall-through attrs', async () => {
        openWrapper = mount(NsMenu, {
          attrs: { modelValue: true, 'no-parent-event': true, role: 'menu' },
          slots: { default: 'Menu content' },
          attachTo: document.body,
        })
        await nextTick()
        await nextTick()

        const popup = document.querySelector('.q-menu')
        expect(popup?.getAttribute('role')).toBe('menu')
      })
    })
  })
})
