import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import NsBottomNav from './NsBottomNav.vue'
import type { NsNavItem } from '../NsNavSidebar/NsNavSidebar.vue'

const MockIcon = defineComponent({ render: () => h('span', 'icon') })

const mainItems: NsNavItem[] = [
  { id: 'home', label: 'Home', icon: MockIcon },
  { id: 'checkout', label: 'Check Out', icon: MockIcon },
  { id: 'products', label: 'Products', icon: MockIcon, sub: ['Discounts', 'Items'] },
  { id: 'orders', label: 'Orders', icon: MockIcon, sub: ['Outgoing', 'Incoming'] },
]

const moreItems: NsNavItem[] = [
  { id: 'shop', label: 'My Shop', icon: MockIcon, sub: ['Online Shop', 'Transactions'] },
  { id: 'customers', label: 'Customers', icon: MockIcon },
  { id: 'settings', label: 'Settings', icon: MockIcon },
]

const mount$ = (props = {}) =>
  mount(NsBottomNav, {
    props: { mainItems, moreItems, modelValue: 'home', ...props },
    attachTo: document.body,
  })

describe('NsBottomNav', () => {
  it('renders all main items plus the More button', () => {
    const wrapper = mount$()
    const pills = wrapper.findAll('.ns-bottom-nav__pill')
    expect(pills.length).toBe(mainItems.length + 1)
  })

  it('marks the active main item', () => {
    const wrapper = mount$({ modelValue: 'checkout' })
    const pills = wrapper.findAll('.ns-bottom-nav__pill')
    expect(pills[1].classes()).toContain('ns-bottom-nav__pill--active')
  })

  it('emits update:modelValue on leaf item click', async () => {
    const wrapper = mount$()
    await wrapper.findAll('.ns-bottom-nav__pill')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['checkout'])
  })

  it('opens the More popup when More is clicked', async () => {
    const wrapper = mount$()
    expect(wrapper.find('.ns-bottom-nav__more-popup').exists()).toBe(false)
    await wrapper.findAll('.ns-bottom-nav__pill')[4].trigger('click')
    expect(wrapper.find('.ns-bottom-nav__more-popup').exists()).toBe(true)
  })

  it('renders more items in the More popup', async () => {
    const wrapper = mount$()
    await wrapper.findAll('.ns-bottom-nav__pill')[4].trigger('click')
    const morePills = wrapper.findAll('.ns-bottom-nav__more-row .ns-bottom-nav__pill')
    expect(morePills.length).toBe(moreItems.length)
  })

  it('selects a more item and closes the popup', async () => {
    const wrapper = mount$()
    await wrapper.findAll('.ns-bottom-nav__pill')[4].trigger('click')
    const morePill = wrapper.findAll('.ns-bottom-nav__more-row .ns-bottom-nav__pill')[1]
    await morePill.trigger('click')
    expect(wrapper.find('.ns-bottom-nav__more-popup').exists()).toBe(false)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['customers'])
  })

  it('shows sub-row when a parent main pill is tapped', async () => {
    const wrapper = mount$()
    await wrapper.findAll('.ns-bottom-nav__pill')[2].trigger('click')
    expect(wrapper.find('.ns-bottom-nav__sub-row').exists()).toBe(true)
    expect(wrapper.findAll('.ns-bottom-nav__sub-pill').length).toBe(2)
  })

  it('emits sub-item id on sub-pill click', async () => {
    const wrapper = mount$()
    await wrapper.findAll('.ns-bottom-nav__pill')[2].trigger('click')
    await wrapper.findAll('.ns-bottom-nav__sub-pill')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['products/discounts'])
  })

  it('makes parent pill visually active when its sub-row is open', async () => {
    const wrapper = mount$()
    await wrapper.findAll('.ns-bottom-nav__pill')[2].trigger('click')
    expect(wrapper.findAll('.ns-bottom-nav__pill')[2].classes()).toContain(
      'ns-bottom-nav__pill--active',
    )
  })

  it('hides sub-row when same parent is tapped again', async () => {
    const wrapper = mount$()
    await wrapper.findAll('.ns-bottom-nav__pill')[2].trigger('click')
    expect(wrapper.find('.ns-bottom-nav__sub-row').exists()).toBe(true)
    await wrapper.findAll('.ns-bottom-nav__pill')[2].trigger('click')
    // sub-row enters closing state (still rendered briefly), openSub is null
    expect(wrapper.findAll('.ns-bottom-nav__pill')[2].classes()).not.toContain(
      'ns-bottom-nav__pill--active',
    )
  })
})
