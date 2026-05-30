import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import {
  PhHouseLine,
  PhCashRegister,
  PhStorefront,
  PhShirtFolded,
  PhPackage,
  PhUsers,
  PhGear,
} from '@phosphor-icons/vue'
import NsNavSidebar from './NsNavSidebar.vue'
import type { NsNavItem } from './NsNavSidebar.vue'

const sampleItems: NsNavItem[] = [
  { id: 'home', label: 'Home', icon: PhHouseLine },
  { id: 'checkout', label: 'Check Out', icon: PhCashRegister },
  {
    id: 'shop',
    label: 'My Shop',
    icon: PhStorefront,
    sub: ['Online Shop', 'Transactions', 'Team'],
  },
  {
    id: 'products',
    label: 'My Products',
    icon: PhShirtFolded,
    sub: ['Discounts', 'Items', 'Inventory', 'Vendors'],
  },
  { id: 'orders', label: 'Orders', icon: PhPackage, sub: ['Outgoing', 'Incoming', 'Shipping'] },
  { id: 'customers', label: 'Customers', icon: PhUsers },
]

const bottomItem: NsNavItem = { id: 'settings', label: 'Settings', icon: PhGear }

const meta = {
  title: 'Components/NsNavSidebar',
  component: NsNavSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NsNavSidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Expanded: Story = {
  render: () => ({
    components: { NsNavSidebar },
    setup() {
      const active = ref('home')
      return { active, sampleItems, bottomItem }
    },
    template: `
      <div style="display: flex; height: 600px; background: var(--ns-color-bg-canvas); padding: 24px;">
        <NsNavSidebar v-model="active" :items="sampleItems" :bottom-item="bottomItem" :default-expanded="true" />
      </div>
    `,
  }),
}

export const Collapsed: Story = {
  render: () => ({
    components: { NsNavSidebar },
    setup() {
      const active = ref('checkout')
      return { active, sampleItems, bottomItem }
    },
    template: `
      <div style="display: flex; height: 600px; background: var(--ns-color-bg-canvas); padding: 24px;">
        <NsNavSidebar v-model="active" :items="sampleItems" :bottom-item="bottomItem" :default-expanded="false" />
      </div>
    `,
  }),
}

export const WithSubItemActive: Story = {
  render: () => ({
    components: { NsNavSidebar },
    setup() {
      const active = ref('products/items')
      return { active, sampleItems, bottomItem }
    },
    template: `
      <div style="display: flex; height: 600px; background: var(--ns-color-bg-canvas); padding: 24px;">
        <NsNavSidebar v-model="active" :items="sampleItems" :bottom-item="bottomItem" />
      </div>
    `,
  }),
}

/**
 * Quasar-aligned API features in one place:
 *
 * - Material-icon **string** icon (`icon: 'dashboard'`) — wrapped in NsIcon
 * - `to` for navigation — renders pill as `<a href>`
 * - `active` explicit override
 * - `disable` (Quasar spelling) — non-interactive + aria-disabled + faded
 * - `separator` — divider before the item
 * - `sub` as rich objects with per-item `to`
 */
export const QuasarAlignedAPI: Story = {
  render: () => ({
    components: { NsNavSidebar },
    setup() {
      const active = ref('shop')
      const items: NsNavItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
        { id: 'orders', label: 'Orders', icon: 'receipt', to: '/orders' },
        {
          id: 'shop',
          label: 'Shop',
          icon: 'storefront',
          active: true,
          sub: [
            { id: 'shop-tops', label: 'Tops', to: '/shop/tops' },
            { id: 'shop-bottoms', label: 'Bottoms', to: '/shop/bottoms' },
            { id: 'shop-archive', label: 'Archive', disable: true },
          ],
        },
        { id: 'archived', label: 'Archived', icon: 'archive', disable: true },
        { id: 'settings', label: 'Settings', icon: 'settings', to: '/settings', separator: true },
      ]
      return { active, items }
    },
    template: `
      <div style="display: flex; height: 600px; background: var(--ns-color-background); padding: 24px;">
        <NsNavSidebar v-model="active" :items="items" />
      </div>
    `,
  }),
}
