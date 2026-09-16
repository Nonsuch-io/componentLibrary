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

  // QMenu's own show/hide/toggle, passed through so popup content can close
  // its host without a v-model (componentLibrary-605).
  describe('imperative api', () => {
    let openWrapper: VueWrapper | undefined

    afterEach(() => {
      openWrapper?.unmount()
      openWrapper = undefined
    })

    it('exposes show, hide and toggle that drive the popup', async () => {
      openWrapper = mount(NsMenu, {
        attrs: { 'no-parent-event': true },
        slots: { default: 'Menu content' },
        attachTo: document.body,
      })
      const vm = openWrapper.vm as unknown as { show(): void; hide(): void; toggle(): void }
      const popup = () => document.querySelector('.q-menu')

      vm.show()
      await nextTick()
      await nextTick()
      expect(popup(), 'show').not.toBeNull()

      vm.hide()
      await nextTick()
      await nextTick()
      expect(popup(), 'hide').toBeNull()

      vm.toggle()
      await nextTick()
      await nextTick()
      expect(popup(), 'toggle').not.toBeNull()
    })
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

      // A pass-through contract, NOT the recommended way to build a menu — for
      // that the role goes on NsList so QItems derive menuitem. See the component
      // comment; review measured that role-on-NsMenu yields menu > list > button.
      it('forwards a consumer-declared role to the popup element', async () => {
        openWrapper = mount(NsMenu, {
          attrs: { modelValue: true, 'no-parent-event': true, role: 'menu' },
          slots: { default: 'Menu content' },
          attachTo: document.body,
        })
        await nextTick()
        await nextTick()

        const popup = document.querySelector('.q-menu')
        // Guarded like the test above, so a popup that never renders fails
        // saying so rather than looking like a role-forwarding bug.
        expect(popup).not.toBeNull()
        expect(popup?.getAttribute('role')).toBe('menu')
      })
    })
  })
})
