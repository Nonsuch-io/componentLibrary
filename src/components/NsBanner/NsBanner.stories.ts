import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsBanner from './NsBanner.vue'

const TYPES = ['positive', 'info', 'negative', 'warning', 'neutral', 'attention', 'accent'] as const

const meta: Meta<typeof NsBanner> = {
  title: 'Components/NsBanner',
  component: NsBanner,
  args: { type: 'info', removable: false },
  argTypes: {
    type: { control: 'select', options: TYPES },
    removable: { control: 'boolean' },
    removeLabel: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof NsBanner>

export const Default: Story = {
  render: (args) => ({
    components: { NsBanner },
    setup: () => ({ args }),
    template: '<NsBanner v-bind="args">This is a callout message for the user.</NsBanner>',
  }),
}

export const AllTypes: Story = {
  name: 'All Types',
  render: () => ({
    components: { NsBanner },
    setup: () => ({ types: TYPES }),
    template: `
      <div style="display:flex; flex-direction:column; gap:12px; padding:16px;">
        <NsBanner v-for="t in types" :key="t" :type="t">
          <strong style="text-transform:capitalize;">{{ t }}</strong> — This is a callout message for the user.
        </NsBanner>
      </div>
    `,
  }),
}

export const Removable: Story = {
  render: () => ({
    components: { NsBanner },
    setup: () => ({ types: ['positive', 'info', 'negative', 'warning'] as const }),
    template: `
      <div style="display:flex; flex-direction:column; gap:12px; padding:16px;">
        <NsBanner v-for="t in types" :key="t" :type="t" removable>
          <strong style="text-transform:capitalize;">{{ t }}</strong> — Click × to dismiss this banner.
        </NsBanner>
      </div>
    `,
  }),
}

export const WithAction: Story = {
  name: 'With Action Button',
  render: () => ({
    components: { NsBanner },
    template: `
      <div style="display:flex; flex-direction:column; gap:12px; padding:16px;">
        <NsBanner type="positive">
          Your changes have been saved.
          <template #action><button style="background:none;border:none;color:var(--ns-color-text-positive);font-weight:600;font-size:14px;cursor:pointer;padding:0;font-family:inherit;">View</button></template>
        </NsBanner>
        <NsBanner type="info">
          A new version is available.
          <template #action><button style="background:none;border:none;color:var(--ns-color-text-info);font-weight:600;font-size:14px;cursor:pointer;padding:0;font-family:inherit;">Update now</button></template>
        </NsBanner>
        <NsBanner type="negative">
          Payment failed. Please update your details.
          <template #action><button style="background:none;border:none;color:var(--ns-color-text-negative);font-weight:600;font-size:14px;cursor:pointer;padding:0;font-family:inherit;">Update billing</button></template>
        </NsBanner>
        <NsBanner type="warning">
          Your trial ends in 3 days.
          <template #action><button style="background:none;border:none;color:var(--ns-color-text-warning);font-weight:600;font-size:14px;cursor:pointer;padding:0;font-family:inherit;">Upgrade</button></template>
        </NsBanner>
      </div>
    `,
  }),
}

export const WithRichContent: Story = {
  name: 'With Rich Content',
  render: () => ({
    components: { NsBanner },
    template: `
      <div style="display:flex; flex-direction:column; gap:12px; padding:16px;">
        <NsBanner type="attention">
          Your plan renews on <strong>November 1, 2026</strong>. Update your payment method to avoid interruption.
        </NsBanner>
        <NsBanner type="accent">
          Welcome to butiq! Set up your store to start selling.
        </NsBanner>
        <NsBanner type="neutral">
          You're viewing a read-only version of this page.
        </NsBanner>
      </div>
    `,
  }),
}
