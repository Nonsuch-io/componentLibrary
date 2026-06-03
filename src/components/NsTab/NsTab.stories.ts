import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PhHouse, PhMagnifyingGlass, PhShoppingCart, PhUser } from '@phosphor-icons/vue'
import NsTab from './NsTab.vue'
import NsTabs from '../NsTabs/NsTabs.vue'

const meta: Meta<typeof NsTab> = {
  title: 'Components/NsTab',
  component: NsTab,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    name: 'tab1',
    label: 'Tab 1',
  },
  render: (args) => ({
    components: { NsTab, NsTabs },
    setup: () => ({ args }),
    template: `
      <NsTabs model-value="tab1">
        <NsTab v-bind="args" />
        <NsTab name="tab2" label="Tab 2" />
      </NsTabs>
    `,
  }),
}

/** String icon name (Quasar / Material Icons) forwarded to QTab's native :icon prop. */
export const StringIcon: Story = {
  render: () => ({
    components: { NsTab, NsTabs },
    template: `
      <NsTabs model-value="home">
        <NsTab name="home" label="Home" icon="home" />
        <NsTab name="search" label="Search" icon="search" />
        <NsTab name="cart" label="Cart" icon="shopping_cart" />
        <NsTab name="account" label="Account" icon="person" />
      </NsTabs>
    `,
  }),
}

/** Phosphor icon component — same API as NsAppShellNavItem and NsAppShellUserMenuItem icons. */
export const ComponentIcon: Story = {
  render: () => ({
    components: { NsTab, NsTabs, PhHouse, PhMagnifyingGlass, PhShoppingCart, PhUser },
    template: `
      <NsTabs model-value="home">
        <NsTab name="home" label="Home" :icon="PhHouse" />
        <NsTab name="search" label="Search" :icon="PhMagnifyingGlass" />
        <NsTab name="cart" label="Cart" :icon="PhShoppingCart" />
        <NsTab name="account" label="Account" :icon="PhUser" />
      </NsTabs>
    `,
    setup: () => ({ PhHouse, PhMagnifyingGlass, PhShoppingCart, PhUser }),
  }),
}

/** Custom #icon slot — for cases where neither a string name nor a standard component suffices. */
export const IconSlot: Story = {
  render: () => ({
    components: { NsTab, NsTabs },
    template: `
      <NsTabs model-value="home">
        <NsTab name="home" label="Home">
          <template #icon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </template>
        </NsTab>
        <NsTab name="other" label="Other" icon="star" />
      </NsTabs>
    `,
  }),
}
