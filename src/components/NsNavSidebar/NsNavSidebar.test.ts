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
})
