import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import NsNavSidebar from './NsNavSidebar.vue'
import type { NsNavItem } from './NsNavSidebar.vue'

const MockIcon = defineComponent({ render: () => h('span', 'icon') })

const items: NsNavItem[] = [
  { id: 'home', label: 'Home', icon: MockIcon },
  { id: 'products', label: 'Products', icon: MockIcon, sub: ['All Products', 'Categories'] },
  { id: 'settings', label: 'Settings', icon: MockIcon },
]

const bottomItem: NsNavItem = { id: 'profile', label: 'Profile', icon: MockIcon }

// The sub-menu flyout is teleported to <body>, so it lives outside the wrapper.
// Track wrappers and attach to the document so unmount cleans the teleport.
let wrappers: VueWrapper[] = []

const mount$ = (props = {}) => {
  const wrapper = mount(NsNavSidebar, {
    props: { items, modelValue: 'home', ...props },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  vi.useRealTimers()
  wrappers.forEach((w) => w.unmount())
  wrappers = []
  document.body.innerHTML = ''
})

/** Sub-pills render in the teleported flyout on <body>, not inside the wrapper. */
const flyoutSubPills = (): HTMLElement[] =>
  Array.from(document.body.querySelectorAll('.ns-nav-sidebar__sub-pill'))

/** Fire a native click on a teleported (non-wrapper) element and flush. */
const clickEl = async (el: Element) => {
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  await nextTick()
}

describe('NsNavSidebar', () => {
  it('renders all nav items', () => {
    const wrapper = mount$()
    const pills = wrapper.findAll('.ns-nav-sidebar__pill')
    expect(pills.length).toBe(items.length)
  })

  it('always shows labels', () => {
    const wrapper = mount$()
    const labels = wrapper.findAll('.ns-nav-sidebar__label')
    expect(labels.length).toBe(items.length)
    expect(labels[0].text()).toBe('Home')
  })

  it('marks the active item', () => {
    const wrapper = mount$({ modelValue: 'settings' })
    const pills = wrapper.findAll('.ns-nav-sidebar__pill')
    expect(pills[2].classes()).toContain('ns-nav-sidebar__pill--active')
  })

  it('marks parent as active when a sub-item is selected', () => {
    const wrapper = mount$({ modelValue: 'products/all-products' })
    const pills = wrapper.findAll('.ns-nav-sidebar__pill')
    expect(pills[1].classes()).toContain('ns-nav-sidebar__pill--active')
  })

  it('emits update:modelValue when a leaf item is clicked', async () => {
    const wrapper = mount$()
    await wrapper.findAll('.ns-nav-sidebar__pill')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['settings'])
  })

  it('does not emit when a parent item (with sub) is clicked', async () => {
    const wrapper = mount$()
    await wrapper.findAll('.ns-nav-sidebar__pill')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeFalsy()
  })

  it('collapses when the toggle button is clicked', async () => {
    const wrapper = mount$()
    expect(wrapper.find('.ns-nav-sidebar--expanded').exists()).toBe(true)
    await wrapper.find('.ns-nav-sidebar__toggle-btn').trigger('click')
    expect(wrapper.find('.ns-nav-sidebar--expanded').exists()).toBe(false)
  })

  it('renders the bottom item when provided', () => {
    const wrapper = mount$({ bottomItem })
    const bottom = wrapper.find('.ns-nav-sidebar__bottom .ns-nav-sidebar__pill')
    expect(bottom.exists()).toBe(true)
    expect(bottom.text()).toContain('Profile')
  })

  it('shows sub-menu on click', async () => {
    const wrapper = mount$()
    await wrapper.findAll('.ns-nav-sidebar__pill')[1].trigger('click')
    expect(flyoutSubPills().length).toBe(2)
  })

  it('emits sub-item id on sub-item click', async () => {
    const wrapper = mount$()
    await wrapper.findAll('.ns-nav-sidebar__pill')[1].trigger('click')
    await clickEl(flyoutSubPills()[0])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['products/all-products'])
  })

  describe('accessibility', () => {
    it('sets aria-current="page" on the active pill', () => {
      const wrapper = mount$({ modelValue: 'settings' })
      const pills = wrapper.findAll('.ns-nav-sidebar__pill')
      expect(pills[2].attributes('aria-current')).toBe('page')
    })

    it('sets aria-disabled and tabindex=-1 on disabled items', () => {
      const wrapper = mount$({
        items: [
          { id: 'home', label: 'Home', icon: MockIcon },
          { id: 'archived', label: 'Archived', icon: MockIcon, disable: true },
        ],
      })
      const pills = wrapper.findAll('.ns-nav-sidebar__pill')
      expect(pills[1].attributes('aria-disabled')).toBe('true')
      expect(pills[1].attributes('tabindex')).toBe('-1')
    })

    it('renders a separator with role="separator"', () => {
      const wrapper = mount$({
        items: [
          { id: 'home', label: 'Home', icon: MockIcon },
          { id: 'settings', label: 'Settings', icon: MockIcon, separator: true },
        ],
      })
      const sep = wrapper.find('.ns-nav-sidebar__separator')
      expect(sep.exists()).toBe(true)
      expect(sep.attributes('role')).toBe('separator')
    })
  })

  describe('Quasar-aligned API', () => {
    it('renders pill as <a href> when item.to is set', () => {
      const wrapper = mount$({
        items: [{ id: 'home', label: 'Home', icon: MockIcon, to: '/home' }],
      })
      const pill = wrapper.find('.ns-nav-sidebar__pill')
      expect(pill.element.tagName).toBe('A')
      expect(pill.attributes('href')).toBe('/home')
    })

    it('renders pill as <button> when item.to is not set', () => {
      const wrapper = mount$()
      const pill = wrapper.find('.ns-nav-sidebar__pill')
      expect(pill.element.tagName).toBe('BUTTON')
    })

    it('does not render href on a disabled item even when to is set', () => {
      const wrapper = mount$({
        items: [{ id: 'home', label: 'Home', icon: MockIcon, to: '/home', disable: true }],
      })
      const pill = wrapper.find('.ns-nav-sidebar__pill')
      expect(pill.element.tagName).toBe('BUTTON')
      expect(pill.attributes('href')).toBeUndefined()
    })

    it('honors explicit active prop on an item', () => {
      const wrapper = mount$({
        modelValue: 'home',
        items: [
          { id: 'home', label: 'Home', icon: MockIcon },
          { id: 'sale', label: 'Sale', icon: MockIcon, active: true },
        ],
      })
      const pills = wrapper.findAll('.ns-nav-sidebar__pill')
      expect(pills[0].classes()).toContain('ns-nav-sidebar__pill--active')
      expect(pills[1].classes()).toContain('ns-nav-sidebar__pill--active')
    })

    it('does not emit update:modelValue when a disabled item is clicked', async () => {
      const wrapper = mount$({
        items: [{ id: 'home', label: 'Home', icon: MockIcon, disable: true }],
      })
      await wrapper.find('.ns-nav-sidebar__pill').trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('emits click event with the item payload', async () => {
      const wrapper = mount$()
      await wrapper.findAll('.ns-nav-sidebar__pill')[0].trigger('click')
      const clicks = wrapper.emitted('click')
      expect(clicks).toBeTruthy()
      expect(clicks![0][1]).toMatchObject({ id: 'home', label: 'Home' })
    })

    it('renders a string icon via NsIcon wrapper', () => {
      const wrapper = mount$({
        items: [{ id: 'home', label: 'Home', icon: 'dashboard' }],
      })
      const pill = wrapper.find('.ns-nav-sidebar__pill')
      // NsIcon wraps QIcon; the inner element should carry the 'q-icon' class
      expect(pill.find('.q-icon').exists()).toBe(true)
    })

    it('accepts sub items as rich objects with their own to', () => {
      const wrapper = mount$({
        items: [
          {
            id: 'shop',
            label: 'Shop',
            icon: MockIcon,
            sub: [
              { id: 'tops', label: 'Tops', to: '/shop/tops' },
              { id: 'bottoms', label: 'Bottoms', to: '/shop/bottoms' },
            ],
          },
        ],
      })
      // Open the flyout
      return wrapper
        .findAll('.ns-nav-sidebar__pill')[0]
        .trigger('click')
        .then(() => {
          const subPills = flyoutSubPills()
          expect(subPills.length).toBe(2)
          expect(subPills[0].tagName).toBe('A')
          expect(subPills[0].getAttribute('href')).toBe('/shop/tops')
          expect(subPills[0].textContent?.trim()).toBe('Tops')
        })
    })

    it('uses sub-item explicit id over derived id', async () => {
      const wrapper = mount$({
        items: [
          {
            id: 'shop',
            label: 'Shop',
            icon: MockIcon,
            sub: [{ id: 'custom-id', label: 'Tops' }],
          },
        ],
      })
      await wrapper.findAll('.ns-nav-sidebar__pill')[0].trigger('click')
      await clickEl(flyoutSubPills()[0])
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['custom-id'])
    })

    it('does not emit update:modelValue when a disabled sub-item is clicked', async () => {
      const wrapper = mount$({
        items: [
          {
            id: 'shop',
            label: 'Shop',
            icon: MockIcon,
            sub: [{ id: 'archived', label: 'Archived', disable: true }],
          },
        ],
      })
      await wrapper.findAll('.ns-nav-sidebar__pill')[0].trigger('click')
      await clickEl(flyoutSubPills()[0])
      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('renders a button without type=submit when item has to + disable both set', () => {
      const wrapper = mount$({
        items: [{ id: 'home', label: 'Home', icon: MockIcon, to: '/home', disable: true }],
      })
      const pill = wrapper.find('.ns-nav-sidebar__pill')
      expect(pill.element.tagName).toBe('BUTTON')
      expect(pill.attributes('type')).toBe('button')
    })
  })

  describe('controlled expanded (v-model:expanded)', () => {
    it('mirrors the expanded prop when controlled', () => {
      const wrapper = mount$({ expanded: false })
      expect(wrapper.find('.ns-nav-sidebar--expanded').exists()).toBe(false)
    })

    it('emits update:expanded when the toggle is clicked in controlled mode', async () => {
      const wrapper = mount$({ expanded: true })
      await wrapper.find('.ns-nav-sidebar__toggle-btn').trigger('click')
      expect(wrapper.emitted('update:expanded')?.[0]).toEqual([false])
    })

    it('updates the rendered state when expanded prop changes', async () => {
      const wrapper = mount$({ expanded: true })
      expect(wrapper.find('.ns-nav-sidebar--expanded').exists()).toBe(true)
      await wrapper.setProps({ expanded: false })
      expect(wrapper.find('.ns-nav-sidebar--expanded').exists()).toBe(false)
    })

    it('hides the toggle button when showToggle is false', () => {
      const wrapper = mount$({ showToggle: false })
      expect(wrapper.find('.ns-nav-sidebar__toggle-btn').exists()).toBe(false)
    })
  })

  describe('teleported flyout behavior', () => {
    const twoSubMenus = [
      { id: 'a', label: 'A', icon: MockIcon, sub: ['A1', 'A2'] },
      { id: 'b', label: 'B', icon: MockIcon, sub: ['B1'] },
    ]

    it('links the open pill to the flyout via aria-controls', async () => {
      const wrapper = mount$()
      const pill = wrapper.findAll('.ns-nav-sidebar__pill')[1]
      await pill.trigger('click')
      const flyout = document.body.querySelector('.ns-nav-sidebar__flyout')!
      const id = flyout.getAttribute('id')
      expect(id).toBeTruthy()
      expect(pill.attributes('aria-controls')).toBe(id)
      expect(pill.attributes('aria-expanded')).toBe('true')
    })

    it('keeps the newly opened flyout when switching submenus (stale-timer guard)', async () => {
      vi.useFakeTimers()
      const wrapper = mount$({ items: twoSubMenus })
      const pills = wrapper.findAll('.ns-nav-sidebar__pill')
      await pills[0].trigger('click') // open A (close timer would fire ~290ms)
      await pills[1].trigger('click') // switch to B before that
      vi.advanceTimersByTime(1000) // let any stale A-timer fire
      await nextTick()
      const labels = flyoutSubPills().map((p) => p.textContent?.trim())
      expect(labels).toContain('B1')
      expect(labels).not.toContain('A1')
    })

    it('closes the flyout on outside pointerdown', async () => {
      vi.useFakeTimers()
      const wrapper = mount$()
      await wrapper.findAll('.ns-nav-sidebar__pill')[1].trigger('click')
      expect(flyoutSubPills().length).toBe(2)
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      vi.advanceTimersByTime(1000)
      await nextTick()
      expect(flyoutSubPills().length).toBe(0)
    })

    it('does NOT close when pointerdown lands inside the flyout', async () => {
      const wrapper = mount$()
      await wrapper.findAll('.ns-nav-sidebar__pill')[1].trigger('click')
      const subPill = flyoutSubPills()[0]
      subPill.dispatchEvent(new Event('pointerdown', { bubbles: true }))
      await nextTick()
      expect(flyoutSubPills().length).toBe(2)
    })

    it('returns focus to the anchor pill after selecting a button sub-item', async () => {
      const wrapper = mount$()
      const productsPill = wrapper.findAll('.ns-nav-sidebar__pill')[1]
      await productsPill.trigger('click')
      await clickEl(flyoutSubPills()[0]) // 'All Products' — a button sub (no `to`)
      expect(document.activeElement).toBe(productsPill.element)
    })

    it('closes the flyout on Escape', async () => {
      vi.useFakeTimers()
      const wrapper = mount$()
      await wrapper.findAll('.ns-nav-sidebar__pill')[1].trigger('click')
      expect(flyoutSubPills().length).toBe(2)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      vi.advanceTimersByTime(1000)
      await nextTick()
      expect(flyoutSubPills().length).toBe(0)
    })

    it('mirrors a dark ancestor context onto the teleported flyout', async () => {
      const host = document.createElement('div')
      host.className = 'q-dark'
      document.body.appendChild(host)
      const wrapper = mount(NsNavSidebar, {
        props: { items, modelValue: 'home' },
        attachTo: host,
      })
      wrappers.push(wrapper)
      await wrapper.findAll('.ns-nav-sidebar__pill')[1].trigger('click')
      const flyout = document.body.querySelector('.ns-nav-sidebar__flyout')!
      expect(flyout.getAttribute('data-theme')).toBe('dark')
      host.remove()
    })

    it('leaves the flyout un-themed in a light context', async () => {
      const wrapper = mount$()
      await wrapper.findAll('.ns-nav-sidebar__pill')[1].trigger('click')
      const flyout = document.body.querySelector('.ns-nav-sidebar__flyout')!
      expect(flyout.getAttribute('data-theme')).toBeNull()
    })

    it('observes the anchor pill to track size/position changes while open', async () => {
      const observe = vi.fn()
      const disconnect = vi.fn()
      const orig = globalThis.ResizeObserver
      class MockResizeObserver {
        observe = observe
        unobserve = vi.fn()
        disconnect = disconnect
      }
      globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
      try {
        const wrapper = mount$()
        await wrapper.findAll('.ns-nav-sidebar__pill')[1].trigger('click')
        expect(observe).toHaveBeenCalledTimes(1)
      } finally {
        globalThis.ResizeObserver = orig
      }
    })
  })
})
