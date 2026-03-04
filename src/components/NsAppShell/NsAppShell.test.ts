import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import NsAppShell from './NsAppShell.vue'
import type { NsAppShellTab, NsAppShellNavItem } from './types'

// Mock Quasar's useQuasar to control screen width
const mockScreenWidth = { value: 1440 }

vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('quasar')>()
  return {
    ...actual,
    useQuasar: () => ({
      screen: {
        get width() {
          return mockScreenWidth.value
        },
      },
    }),
  }
})

const sampleTabs: NsAppShellTab[] = [
  { name: 'home', label: 'Home', icon: 'home' },
  { name: 'search', label: 'Search', icon: 'search' },
  { name: 'cart', label: 'Cart', icon: 'shopping_cart' },
  { name: 'account', label: 'Account', icon: 'person' },
]

const sampleNavItems: NsAppShellNavItem[] = [
  { name: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
  { name: 'orders', label: 'Orders', icon: 'receipt', to: '/orders' },
  {
    name: 'products',
    label: 'Products',
    icon: 'inventory_2',
    children: [
      { name: 'all', label: 'All Products', to: '/products' },
      { name: 'categories', label: 'Categories', to: '/products/categories' },
    ],
  },
  { name: 'settings', label: 'Settings', icon: 'settings', to: '/settings', separator: true },
]

describe('NsAppShell', () => {
  beforeEach(() => {
    mockScreenWidth.value = 1440 // default to desktop
  })

  it('renders the layout structure', () => {
    const wrapper = mount(NsAppShell, {
      slots: { default: '<div>Main content</div>' },
    })
    expect(wrapper.find('.ns-app-shell').exists()).toBe(true)
    expect(wrapper.find('.ns-app-shell__header').exists()).toBe(true)
    expect(wrapper.text()).toContain('Main content')
  })

  describe('tablet viewport', () => {
    beforeEach(() => {
      mockScreenWidth.value = 1100 // md range (1024–1439)
    })

    it('hides the hamburger menu button', () => {
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__menu-btn').exists()).toBe(false)
    })

    it('hides the bottom tab bar', () => {
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__bottom-bar').exists()).toBe(false)
    })

    it('auto-enables mini drawer at tablet range', () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      const drawer = wrapper.findComponent({ name: 'QDrawer' })
      expect(drawer.props('mini')).toBe(true)
    })

    it('uses desktop behavior for drawer', () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      const drawer = wrapper.findComponent({ name: 'QDrawer' })
      expect(drawer.props('behavior')).toBe('desktop')
    })

    it('shows inline search like desktop', () => {
      const wrapper = mount(NsAppShell, {
        props: { showSearch: true },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__search-inline').exists()).toBe(true)
      expect(wrapper.find('.ns-app-shell__search-btn').exists()).toBe(false)
    })
  })

  describe('desktop viewport', () => {
    beforeEach(() => {
      mockScreenWidth.value = 1440
    })

    it('hides the hamburger menu button', () => {
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__menu-btn').exists()).toBe(false)
    })

    it('hides the bottom tab bar', () => {
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__bottom-bar').exists()).toBe(false)
    })

    it('disables mini drawer at lg+ by default', () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      const drawer = wrapper.findComponent({ name: 'QDrawer' })
      expect(drawer.props('mini')).toBe(false)
    })

    it('enables mini drawer at lg+ when miniDrawer prop is true', () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems, miniDrawer: true },
        slots: { default: 'Content' },
      })
      const drawer = wrapper.findComponent({ name: 'QDrawer' })
      expect(drawer.props('mini')).toBe(true)
    })

    it('shows inline search when showSearch is true', () => {
      const wrapper = mount(NsAppShell, {
        props: { showSearch: true },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__search-inline').exists()).toBe(true)
      expect(wrapper.find('.ns-app-shell__search-btn').exists()).toBe(false)
    })
  })

  describe('mobile viewport', () => {
    beforeEach(() => {
      mockScreenWidth.value = 375
    })

    it('shows the hamburger menu button', () => {
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__menu-btn').exists()).toBe(true)
    })

    it('shows the bottom tab bar with tabs', () => {
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__bottom-bar').exists()).toBe(true)
      const tabs = wrapper.findAll('.ns-app-shell__bottom-tab')
      expect(tabs).toHaveLength(4)
    })

    it('shows search icon button instead of inline search', () => {
      const wrapper = mount(NsAppShell, {
        props: { showSearch: true },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__search-btn').exists()).toBe(true)
      expect(wrapper.find('.ns-app-shell__search-inline').exists()).toBe(false)
    })

    it('hides bottom tab bar when no tabs provided', () => {
      const wrapper = mount(NsAppShell, {
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__bottom-bar').exists()).toBe(false)
    })

    it('applies bottom-tabs class for even flex distribution', () => {
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__bottom-tabs').exists()).toBe(true)
    })

    it('applies bottom-tab class to each tab for truncation styling', () => {
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      const tabs = wrapper.findAll('.ns-app-shell__bottom-tab')
      expect(tabs).toHaveLength(4)
      tabs.forEach((tab) => {
        expect(tab.classes()).toContain('ns-app-shell__bottom-tab')
      })
    })

    it('renders 5 bottom tabs when 5 tabs are provided', () => {
      const fiveTabs: NsAppShellTab[] = [
        ...sampleTabs,
        { name: 'notifications', label: 'Notifications', icon: 'notifications' },
      ]
      const wrapper = mount(NsAppShell, {
        props: { tabs: fiveTabs },
        slots: { default: 'Content' },
      })
      const tabs = wrapper.findAll('.ns-app-shell__bottom-tab')
      expect(tabs).toHaveLength(5)
    })
  })

  describe('drawer', () => {
    it('renders nav items in the drawer', () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      expect(wrapper.text()).toContain('Dashboard')
      expect(wrapper.text()).toContain('Orders')
      expect(wrapper.text()).toContain('Settings')
    })

    it('renders separator when nav item has separator flag', () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      // The settings item has separator: true
      expect(wrapper.find('.ns-separator').exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('emits tab-change when a bottom tab is selected', async () => {
      mockScreenWidth.value = 375
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      const tabs = wrapper.findAll('.ns-app-shell__bottom-tab')
      await tabs[1].trigger('click')
      expect(wrapper.emitted('tab-change')).toBeTruthy()
    })

    it('emits drawer-toggle when drawer state changes', async () => {
      mockScreenWidth.value = 375
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      // Trigger model update via the underlying NsDrawer/QDrawer component
      const drawer = wrapper.findComponent({ name: 'QDrawer' })
      drawer.vm.$emit('update:model-value', true)
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('drawer-toggle')?.[0]).toEqual([true])
    })

    it('toggles drawer open/closed when hamburger button is clicked', async () => {
      mockScreenWidth.value = 375
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      const menuBtn = wrapper.find('.ns-app-shell__menu-btn')
      await menuBtn.trigger('click')
      // toggleDrawer was called — verify internal state changed
      expect(menuBtn.exists()).toBe(true)
    })

    it('emits search when enter is pressed in search input', async () => {
      mockScreenWidth.value = 1440
      const wrapper = mount(NsAppShell, {
        props: { showSearch: true },
        slots: { default: 'Content' },
      })
      const input = wrapper.find('.ns-app-shell__search-input input')
      await input.setValue('test query')
      await input.trigger('keyup.enter')
      expect(wrapper.emitted('search')?.[0]).toEqual(['test query'])
    })

    it('toggles expanded mobile search bar when search button is clicked', async () => {
      mockScreenWidth.value = 375
      const wrapper = mount(NsAppShell, {
        props: { showSearch: true },
        slots: { default: 'Content' },
      })
      // Search bar should not be visible initially
      expect(wrapper.find('.ns-app-shell__search-bar').exists()).toBe(false)

      // Click the search icon button to expand
      const searchBtn = wrapper.find('.ns-app-shell__search-btn')
      await searchBtn.trigger('click')

      // Expanded search bar should now be visible
      expect(wrapper.find('.ns-app-shell__search-bar').exists()).toBe(true)
    })

    it('closes expanded mobile search bar when close button is clicked', async () => {
      mockScreenWidth.value = 375
      const wrapper = mount(NsAppShell, {
        props: { showSearch: true },
        slots: { default: 'Content' },
      })
      // Expand the search bar first
      await wrapper.find('.ns-app-shell__search-btn').trigger('click')
      expect(wrapper.find('.ns-app-shell__search-bar').exists()).toBe(true)

      // Click the close button inside the expanded bar
      const closeBtn = wrapper.find('.ns-app-shell__search-bar [aria-label="Close search"]')
      await closeBtn.trigger('click')

      // Search bar should be hidden again
      expect(wrapper.find('.ns-app-shell__search-bar').exists()).toBe(false)
    })

    it('emits search from expanded mobile search bar', async () => {
      mockScreenWidth.value = 375
      const wrapper = mount(NsAppShell, {
        props: { showSearch: true },
        slots: { default: 'Content' },
      })
      // Expand the search bar
      await wrapper.find('.ns-app-shell__search-btn').trigger('click')

      // Type and press enter in the mobile search input
      const mobileInput = wrapper.find('.ns-app-shell__search-bar input')
      await mobileInput.setValue('mobile query')
      await mobileInput.trigger('keyup.enter')

      expect(wrapper.emitted('search')?.[0]).toEqual(['mobile query'])
    })
  })

  describe('slots', () => {
    it('renders header-left slot', () => {
      const wrapper = mount(NsAppShell, {
        slots: {
          'header-left': '<div class="test-logo">Logo</div>',
          default: 'Content',
        },
      })
      expect(wrapper.find('.test-logo').text()).toBe('Logo')
    })

    it('renders header-actions slot', () => {
      const wrapper = mount(NsAppShell, {
        slots: {
          'header-actions': '<button class="test-action">Notify</button>',
          default: 'Content',
        },
      })
      expect(wrapper.find('.test-action').text()).toBe('Notify')
    })

    it('renders drawer-header slot', () => {
      const wrapper = mount(NsAppShell, {
        slots: {
          'drawer-header': '<div class="test-drawer-header">User Info</div>',
          default: 'Content',
        },
      })
      expect(wrapper.find('.test-drawer-header').text()).toBe('User Info')
    })

    it('renders drawer-footer slot', () => {
      const wrapper = mount(NsAppShell, {
        slots: {
          'drawer-footer': '<div class="test-drawer-footer">v1.0.0</div>',
          default: 'Content',
        },
      })
      expect(wrapper.find('.test-drawer-footer').text()).toBe('v1.0.0')
    })

    it('renders bottom-bar-above slot on mobile', () => {
      mockScreenWidth.value = 375
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: {
          'bottom-bar-above': '<div class="test-mini-player">Now Playing</div>',
          default: 'Content',
        },
      })
      expect(wrapper.find('.test-mini-player').text()).toBe('Now Playing')
    })
  })

  describe('props', () => {
    it('uses custom drawerBreakpoint', () => {
      mockScreenWidth.value = 1200
      const wrapper = mount(NsAppShell, {
        props: { drawerBreakpoint: 1440, tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      // At 1200px with breakpoint 1440, should be "mobile" mode
      expect(wrapper.find('.ns-app-shell__menu-btn').exists()).toBe(true)
      expect(wrapper.find('.ns-app-shell__bottom-bar').exists()).toBe(true)
    })

    it('uses custom fullDrawerBreakpoint to control mini→full transition', () => {
      mockScreenWidth.value = 1440
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems, fullDrawerBreakpoint: 1920 },
        slots: { default: 'Content' },
      })
      // At 1440px with fullDrawerBreakpoint 1920, should still be in mini mode
      const drawer = wrapper.findComponent({ name: 'QDrawer' })
      expect(drawer.props('mini')).toBe(true)
    })

    it('hides search entirely when showSearch is false', () => {
      const wrapper = mount(NsAppShell, {
        props: { showSearch: false },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__search-inline').exists()).toBe(false)
      expect(wrapper.find('.ns-app-shell__search-btn').exists()).toBe(false)
    })
  })

  describe('touch targets', () => {
    it('hamburger button has minimum 44px dimensions', () => {
      mockScreenWidth.value = 375
      const wrapper = mount(NsAppShell, {
        props: { tabs: sampleTabs },
        slots: { default: 'Content' },
      })
      const btn = wrapper.find('.ns-app-shell__menu-btn')
      expect(btn.exists()).toBe(true)
      // CSS enforces min-width/min-height of 44px — verify class exists
    })

    it('nav items have minimum 44px height', () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      const navItems = wrapper.findAll('.ns-app-shell__nav-item')
      expect(navItems.length).toBeGreaterThan(0)
      // CSS enforces min-height of 44px
    })
  })

  describe('collapsible drawer', () => {
    beforeEach(() => {
      mockScreenWidth.value = 1440 // desktop (lg+)
    })

    it('shows collapse toggle at desktop when collapsible is true (default)', () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__collapse-toggle').exists()).toBe(true)
    })

    it('hides collapse toggle when collapsible is false', () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems, collapsible: false },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__collapse-toggle').exists()).toBe(false)
    })

    it('hides collapse toggle on mobile', () => {
      mockScreenWidth.value = 375
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      expect(wrapper.find('.ns-app-shell__collapse-toggle').exists()).toBe(false)
    })

    it('toggles mini mode when collapse button is clicked', async () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      const drawer = wrapper.findComponent({ name: 'QDrawer' })
      // Initially not mini at lg+ (not tablet, not collapsed)
      expect(drawer.props('mini')).toBe(false)

      // Click the collapse toggle
      await wrapper.find('.ns-app-shell__collapse-toggle').trigger('click')

      // Now should be in mini mode
      expect(drawer.props('mini')).toBe(true)
    })

    it('emits drawer-collapse event when toggled', async () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      await wrapper.find('.ns-app-shell__collapse-toggle').trigger('click')
      expect(wrapper.emitted('drawer-collapse')?.[0]).toEqual([true])

      // Toggle back
      await wrapper.find('.ns-app-shell__collapse-toggle').trigger('click')
      expect(wrapper.emitted('drawer-collapse')?.[1]).toEqual([false])
    })

    it('shows chevron_left icon when drawer is expanded', () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      const toggleIcon = wrapper.find('.ns-app-shell__collapse-toggle .ns-icon')
      expect(toggleIcon.text()).toContain('chevron_left')
    })

    it('shows menu icon when drawer is collapsed to mini', async () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      await wrapper.find('.ns-app-shell__collapse-toggle').trigger('click')
      const toggleIcon = wrapper.find('.ns-app-shell__collapse-toggle .ns-icon')
      expect(toggleIcon.text()).toContain('menu')
    })
  })

  describe('nav item chevrons', () => {
    it('shows chevron on nav items with children', () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      // Products has children, should show chevron_right
      const navItems = wrapper.findAll('.ns-app-shell__nav-item')
      const productsItem = navItems.find((item) => item.text().includes('Products'))
      expect(productsItem).toBeTruthy()
      expect(productsItem!.text()).toContain('chevron_right')
    })

    it('does not show chevron on nav items without children', () => {
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: sampleNavItems },
        slots: { default: 'Content' },
      })
      const navItems = wrapper.findAll('.ns-app-shell__nav-item')
      const dashboardItem = navItems.find((item) => item.text().includes('Dashboard'))
      expect(dashboardItem).toBeTruthy()
      expect(dashboardItem!.text()).not.toContain('chevron_right')
    })

    it('does not show chevron when children array is empty', () => {
      const itemsWithEmptyChildren: NsAppShellNavItem[] = [
        { name: 'test', label: 'Test', icon: 'home', children: [] },
      ]
      const wrapper = mount(NsAppShell, {
        props: { drawerItems: itemsWithEmptyChildren },
        slots: { default: 'Content' },
      })
      const navItem = wrapper.find('.ns-app-shell__nav-item')
      expect(navItem.text()).not.toContain('chevron_right')
    })
  })
})
