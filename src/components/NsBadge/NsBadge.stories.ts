import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PhBell, PhWarning } from '@phosphor-icons/vue'
import NsBadge from './NsBadge.vue'

const VARIANTS = [
  'primary',
  'secondary',
  'accent',
  'positive',
  'negative',
  'info',
  'warning',
  'ghost',
  'neutral',
] as const

const meta: Meta<typeof NsBadge> = {
  title: 'Components/NsBadge',
  component: NsBadge,
  tags: ['autodocs'],
  args: { variant: 'primary', size: 'small' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: ['small', 'medium'] },
  },
}

export default meta
type Story = StoryObj<typeof NsBadge>

export const Default: Story = {
  render: (args) => ({
    components: { NsBadge },
    setup: () => ({ args }),
    template: '<NsBadge v-bind="args">Badge</NsBadge>',
  }),
}

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => ({
    components: { NsBadge, PhBell },
    setup: () => ({ variants: VARIANTS }),
    template: `
      <table style="border-collapse:collapse; font-family:sans-serif; font-size:12px;">
        <thead>
          <tr>
            <th style="text-align:left; padding:8px 16px 8px 0; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Variant</th>
            <th style="text-align:center; padding:8px 16px; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Small</th>
            <th style="text-align:center; padding:8px 16px; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Small + Icon</th>
            <th style="text-align:center; padding:8px 16px; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Medium</th>
            <th style="text-align:center; padding:8px 16px; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Medium + Icon</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in variants" :key="v">
            <td style="padding:10px 16px 10px 0; color:#535353; white-space:nowrap;">{{ v }}</td>
            <td style="text-align:center; padding:10px 16px;"><NsBadge :variant="v">Badge</NsBadge></td>
            <td style="text-align:center; padding:10px 16px;"><NsBadge :variant="v"><PhBell :size="12" /> Badge</NsBadge></td>
            <td style="text-align:center; padding:10px 16px;"><NsBadge :variant="v" size="medium">Badge</NsBadge></td>
            <td style="text-align:center; padding:10px 16px;"><NsBadge :variant="v" size="medium"><PhBell :size="16" /> Badge</NsBadge></td>
          </tr>
        </tbody>
      </table>
    `,
  }),
}

export const WithIcon: Story = {
  name: 'With Leading Icon',
  render: () => ({
    components: { NsBadge, PhBell, PhWarning },
    template: `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:flex; gap:8px; align-items:center;">
          <span style="font-family:sans-serif; font-size:11px; color:#757575; width:60px;">Small</span>
          <NsBadge variant="primary"><PhBell :size="12" /> Notifications</NsBadge>
          <NsBadge variant="negative"><PhWarning :size="12" /> Alert</NsBadge>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <span style="font-family:sans-serif; font-size:11px; color:#757575; width:60px;">Medium</span>
          <NsBadge variant="primary" size="medium"><PhBell :size="16" /> Notifications</NsBadge>
          <NsBadge variant="negative" size="medium"><PhWarning :size="16" /> Alert</NsBadge>
        </div>
      </div>
    `,
  }),
}
