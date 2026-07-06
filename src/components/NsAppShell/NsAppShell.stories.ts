import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { expect, userEvent, within } from 'storybook/test'
import NsAppShell from './NsAppShell.vue'
import NsButton from '../NsButton/NsButton.vue'
import NsCard from '../NsCard/NsCard.vue'
import type { NsAppShellTab, NsAppShellNavItem, NsAppShellUserMenuItem } from './types'

const sampleTabs: NsAppShellTab[] = [
  { name: 'home', label: 'Home', icon: 'home' },
  { name: 'browse', label: 'Browse', icon: 'explore' },
  { name: 'cart', label: 'Cart', icon: 'shopping_cart' },
  { name: 'account', label: 'Account', icon: 'person' },
]

const sampleNavItems: NsAppShellNavItem[] = [
  { name: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/dashboard', active: true },
  { name: 'products', label: 'Products', icon: 'inventory_2', to: '/products' },
  { name: 'orders', label: 'Orders', icon: 'receipt_long', to: '/orders' },
  { name: 'customers', label: 'Customers', icon: 'people', to: '/customers' },
  { name: 'analytics', label: 'Analytics', icon: 'bar_chart', to: '/analytics' },
  { name: 'settings', label: 'Settings', icon: 'settings', to: '/settings', separator: true },
]

// Nav items with nested children — these render as flyout sub-menus. Used to
// verify the flyout escapes the drawer's overflow clipping (it is teleported
// to <body>). See componentLibrary-5zz.
const navItemsWithSubmenus: NsAppShellNavItem[] = [
  { name: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/dashboard', active: true },
  {
    name: 'products',
    label: 'Products',
    icon: 'inventory_2',
    children: [
      { name: 'products-all', label: 'All Products', to: '/products' },
      { name: 'products-categories', label: 'Categories', to: '/products/categories' },
      { name: 'products-inventory', label: 'Inventory', to: '/products/inventory' },
    ],
  },
  {
    name: 'orders',
    label: 'Orders',
    icon: 'receipt_long',
    children: [
      { name: 'orders-open', label: 'Open', to: '/orders/open' },
      { name: 'orders-shipped', label: 'Shipped', to: '/orders/shipped' },
    ],
  },
  { name: 'settings', label: 'Settings', icon: 'settings', to: '/settings', separator: true },
]

const sampleUserMenuItems: NsAppShellUserMenuItem[] = [
  { name: 'profile', label: 'Profile', icon: 'person' },
  { name: 'account', label: 'Account Settings', icon: 'settings' },
  { name: 'logout', label: 'Log out', icon: 'logout', separator: true },
]

const meta: Meta<typeof NsAppShell> = {
  title: 'Templates/NsAppShell',
  component: NsAppShell,
  args: {
    tabs: sampleTabs,
    drawerItems: sampleNavItems,
    showSearch: true,
    miniDrawer: false,
    userName: 'Jane Doe',
    userInitials: 'JD',
    userMenuItems: sampleUserMenuItems,
  },
  argTypes: {
    showSearch: { control: 'boolean' },
    miniDrawer: { control: 'boolean' },
    collapsed: { control: 'boolean' },
    drawerBreakpoint: { control: 'number' },
  },
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof NsAppShell>

const pageContent = `
  <div class="q-pa-md">
    <h5 class="text-h5 q-mb-md">Dashboard</h5>
    <div class="row q-gutter-md">
      <div class="col-12 col-sm-6 col-md-3" v-for="i in 4" :key="i">
        <NsCard :title="'Widget ' + i">
          <p>Sample widget content for demo purposes.</p>
        </NsCard>
      </div>
    </div>
  </div>
`

export const Default: Story = {
  render: (args) => ({
    components: { NsAppShell, NsButton, NsCard },
    setup: () => ({ args }),
    template: `
      <NsAppShell v-bind="args">
        <template #header-left>
          <span class="text-weight-bold text-subtitle1 q-ml-sm">Acme</span>
        </template>
        <template #header-actions>
          <NsButton flat round dense aria-label="Notifications">
            <q-icon name="notifications" />
          </NsButton>
        </template>
        ${pageContent}
      </NsAppShell>
    `,
  }),
}

// Click "Products" or "Orders" in the drawer to open a sub-menu flyout. The
// flyout must render fully to the right of the drawer, un-clipped — it is
// teleported to <body> to escape the drawer's overflow (componentLibrary-5zz).
// Verify in both light and dark modes, and in mini/rail mode.
export const DrawerSubmenus: Story = {
  args: {
    drawerItems: navItemsWithSubmenus,
    // Low breakpoints so the persistent, full-width drawer (with labels) is
    // always shown — and the flyout reachable — regardless of viewport width.
    drawerBreakpoint: 400,
    fullDrawerBreakpoint: 400,
  },
  render: (args) => ({
    components: { NsAppShell, NsButton, NsCard },
    setup: () => ({ args }),
    template: `
      <NsAppShell v-bind="args">
        <template #header-left>
          <span class="text-weight-bold text-subtitle1 q-ml-sm">Acme</span>
        </template>
        ${pageContent}
      </NsAppShell>
    `,
  }),
  // Regression test for componentLibrary-5zz: opening a drawer sub-menu must
  // render the flyout OUTSIDE the drawer (teleported to <body>), so it is not
  // clipped by the drawer's overflow. Before the fix the flyout lived inside
  // .ns-app-shell__drawer and was clipped.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const doc = canvasElement.ownerDocument

    // Open the "Products" sub-menu.
    await userEvent.click(await canvas.findByText('Products'))

    // The sub-item renders in the teleported flyout on <body>.
    const subItem = await within(doc.body).findByText('All Products')
    const flyout = subItem.closest('.ns-nav-sidebar__flyout') as HTMLElement | null
    expect(flyout).not.toBeNull()

    const drawer = doc.querySelector('.ns-app-shell__drawer') as HTMLElement | null
    expect(drawer).not.toBeNull()

    // The core assertion: the flyout escaped the drawer's clipping subtree.
    expect(drawer!.contains(flyout!)).toBe(false)
    expect(doc.body.contains(flyout!)).toBe(true)

    // And it is positioned beside the drawer, on-screen.
    const dr = drawer!.getBoundingClientRect()
    const fr = flyout!.getBoundingClientRect()
    expect(fr.left).toBeGreaterThan(dr.left)
    expect(fr.width).toBeGreaterThan(0)
    expect(fr.right).toBeLessThanOrEqual(doc.defaultView!.innerWidth + 1)
  },
}

export const MiniDrawer: Story = {
  args: {
    miniDrawer: true,
  },
  render: (args) => ({
    components: { NsAppShell, NsCard },
    setup: () => ({ args }),
    template: `
      <NsAppShell v-bind="args">
        <template #header-left>
          <span class="text-weight-bold text-subtitle1 q-ml-sm">Acme</span>
        </template>
        ${pageContent}
      </NsAppShell>
    `,
  }),
}

export const NoSearch: Story = {
  args: {
    showSearch: false,
  },
  render: (args) => ({
    components: { NsAppShell, NsCard },
    setup: () => ({ args }),
    template: `
      <NsAppShell v-bind="args">
        <template #header-left>
          <span class="text-weight-bold text-subtitle1 q-ml-sm">Acme</span>
        </template>
        ${pageContent}
      </NsAppShell>
    `,
  }),
}

export const WithBottomBarAbove: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: (args) => ({
    components: { NsAppShell, NsCard },
    setup: () => ({ args }),
    template: `
      <NsAppShell v-bind="args">
        <template #header-left>
          <span class="text-weight-bold text-subtitle1 q-ml-sm">Acme</span>
        </template>
        <template #bottom-bar-above>
          <div class="bg-dark text-white q-pa-sm row items-center justify-between">
            <span class="text-caption">Now Playing: Summer Vibes</span>
            <q-icon name="play_arrow" />
          </div>
        </template>
        ${pageContent}
      </NsAppShell>
    `,
  }),
}

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: (args) => ({
    components: { NsAppShell, NsCard },
    setup: () => ({ args }),
    template: `
      <NsAppShell v-bind="args">
        <template #header-left>
          <span class="text-weight-bold text-subtitle1 q-ml-sm">Acme</span>
        </template>
        ${pageContent}
      </NsAppShell>
    `,
  }),
}

export const Tablet: Story = {
  parameters: {
    viewport: { defaultViewport: 'tablet' },
  },
  render: (args) => ({
    components: { NsAppShell, NsCard },
    setup: () => ({ args }),
    template: `
      <NsAppShell v-bind="args">
        <template #header-left>
          <span class="text-weight-bold text-subtitle1 q-ml-sm">Acme</span>
        </template>
        ${pageContent}
      </NsAppShell>
    `,
  }),
}

// Demonstrates v-model:collapsed. In a real app, initialise `collapsed` from a
// cookie (SSR — the server renders the correct width with no flash) or from
// localStorage (SPA), and persist it on change (e.g. watch(collapsed, save)).
export const PersistedCollapse: Story = {
  render: (args) => ({
    components: { NsAppShell },
    setup() {
      const collapsed = ref(false)
      return { args, collapsed }
    },
    template: `
      <NsAppShell v-bind="args" v-model:collapsed="collapsed">
        <template #header-left>
          <span class="text-weight-bold text-subtitle1 q-ml-sm">Acme</span>
        </template>
        <div class="q-pa-md">
          <h5 class="text-h5 q-mb-md">Persisted collapse</h5>
          <p>Bound <code>collapsed</code>: <strong>{{ collapsed }}</strong></p>
          <p>
            Toggle the sidebar eye — the bound value updates. A real app persists
            it (cookie for SSR, localStorage for a SPA) and passes the saved value
            back on load to restore the rail.
          </p>
        </div>
      </NsAppShell>
    `,
  }),
}
