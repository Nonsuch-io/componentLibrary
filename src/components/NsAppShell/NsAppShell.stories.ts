import type { Meta, StoryObj } from '@storybook/vue3-vite'
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
          <span class="text-weight-bold text-subtitle1 q-ml-sm">butiq</span>
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
          <span class="text-weight-bold text-subtitle1 q-ml-sm">butiq</span>
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
          <span class="text-weight-bold text-subtitle1 q-ml-sm">butiq</span>
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
          <span class="text-weight-bold text-subtitle1 q-ml-sm">butiq</span>
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
          <span class="text-weight-bold text-subtitle1 q-ml-sm">butiq</span>
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
          <span class="text-weight-bold text-subtitle1 q-ml-sm">butiq</span>
        </template>
        ${pageContent}
      </NsAppShell>
    `,
  }),
}
