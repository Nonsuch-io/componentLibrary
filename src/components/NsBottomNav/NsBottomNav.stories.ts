import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import {
  PhHouseLine,
  PhCashRegister,
  PhShirtFolded,
  PhPackage,
  PhStorefront,
  PhUsers,
  PhGear,
} from '@phosphor-icons/vue'
import NsBottomNav from './NsBottomNav.vue'
import type { NsNavItem } from '../NsNavSidebar/NsNavSidebar.vue'

const mainItems: NsNavItem[] = [
  { id: 'home', label: 'Home', icon: PhHouseLine },
  { id: 'checkout', label: 'Check Out', icon: PhCashRegister },
  {
    id: 'products',
    label: 'Products',
    icon: PhShirtFolded,
    sub: ['Discounts', 'Items', 'Inventory', 'Vendors'],
  },
  { id: 'orders', label: 'Orders', icon: PhPackage, sub: ['Outgoing', 'Incoming', 'Shipping'] },
]

const moreItems: NsNavItem[] = [
  {
    id: 'shop',
    label: 'My Shop',
    icon: PhStorefront,
    sub: ['Online Shop', 'Transactions', 'Team'],
  },
  { id: 'customers', label: 'Customers', icon: PhUsers },
  { id: 'settings', label: 'Settings', icon: PhGear },
]

const meta = {
  title: 'Components/NsBottomNav',
  component: NsBottomNav,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NsBottomNav>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { NsBottomNav },
    setup() {
      const active = ref('home')
      return { active, mainItems, moreItems }
    },
    template: `
      <div style="display: flex; align-items: flex-end; justify-content: center; height: 300px; background: var(--ns-color-bg-canvas); padding: 16px;">
        <NsBottomNav v-model="active" :main-items="mainItems" :more-items="moreItems" />
      </div>
    `,
  }),
}

export const WithSubOpen: Story = {
  render: () => ({
    components: { NsBottomNav },
    setup() {
      const active = ref('products')
      return { active, mainItems, moreItems }
    },
    template: `
      <div style="display: flex; align-items: flex-end; justify-content: center; height: 300px; background: var(--ns-color-bg-canvas); padding: 16px;">
        <NsBottomNav v-model="active" :main-items="mainItems" :more-items="moreItems" />
      </div>
    `,
  }),
}
