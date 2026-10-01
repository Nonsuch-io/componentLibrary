import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsNumberBadge from './NsNumberBadge.vue'

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

const meta: Meta<typeof NsNumberBadge> = {
  title: 'Components/NsNumberBadge',
  component: NsNumberBadge,
  tags: ['autodocs'],
  args: { variant: 'primary', size: 'small' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: ['small', 'medium'] },
  },
}

export default meta
type Story = StoryObj<typeof NsNumberBadge>

export const Default: Story = {
  render: (args) => ({
    components: { NsNumberBadge },
    setup: () => ({ args }),
    template: '<NsNumberBadge v-bind="args">3</NsNumberBadge>',
  }),
}

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => ({
    components: { NsNumberBadge },
    setup: () => ({ variants: VARIANTS }),
    template: `
      <table style="border-collapse:collapse; font-family:sans-serif; font-size:12px;">
        <thead>
          <tr>
            <th style="text-align:left; padding:8px 16px 8px 0; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Variant</th>
            <th style="text-align:center; padding:8px 16px; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Small (20px)</th>
            <th style="text-align:center; padding:8px 16px; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Medium (24px)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in variants" :key="v">
            <td style="padding:10px 16px 10px 0; color:#535353; white-space:nowrap;">{{ v }}</td>
            <td style="text-align:center; padding:10px 16px;"><NsNumberBadge :variant="v">3</NsNumberBadge></td>
            <td style="text-align:center; padding:10px 16px;"><NsNumberBadge :variant="v" size="medium">3</NsNumberBadge></td>
          </tr>
        </tbody>
      </table>
    `,
  }),
}
