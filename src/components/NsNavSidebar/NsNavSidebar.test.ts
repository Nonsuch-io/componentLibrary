import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import NsNavSidebar from './NsNavSidebar.vue'
import type { NsNavItem } from './NsNavSidebar.vue'

const MockIcon = defineComponent({ render: () => h('span', 'icon') })

const items: NsNavItem[] = [
  { id: 'home', label: 'Home', icon: MockIcon },
  { id: 'products', label: 'Products', icon: MockIcon, sub: ['All Products', 'Categories'] },
  { id: 'settings', label: 'Settings', icon: MockIcon },
]

const bottomItem: NsNavItem = { id: 'profile', label: 'Profile', icon: MockIcon }

const mount$ = (props = {}) =>
  mount(NsNavSidebar, {
    props: { items, modelValue: 'home', ...props },
  })

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
    const subPills = wrapper.findAll('.ns-nav-sidebar__sub-pill')
    expect(subPills.length).toBe(2)
  })

  it('emits sub-item id on sub-item click', async () => {
    const wrapper = mount$()
    await wrapper.findAll('.ns-nav-sidebar__pill')[1].trigger('click')
    await wrapper.findAll('.ns-nav-sidebar__sub-pill')[0].trigger('click')
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
          const subPills = wrapper.findAll('.ns-nav-sidebar__sub-pill')
          expect(subPills.length).toBe(2)
          expect(subPills[0].element.tagName).toBe('A')
          expect(subPills[0].attributes('href')).toBe('/shop/tops')
          expect(subPills[0].text()).toBe('Tops')
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
      await wrapper.findAll('.ns-nav-sidebar__sub-pill')[0].trigger('click')
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['custom-id'])
    })
  })
})
