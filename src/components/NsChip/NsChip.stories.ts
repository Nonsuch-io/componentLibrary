import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsChip from './NsChip.vue'

const VARIANTS = [
  'primary',
  'secondary',
  'accent',
  'positive',
  'negative',
  'info',
  'warning',
] as const

const meta: Meta<typeof NsChip> = {
  title: 'Components/NsChip',
  component: NsChip,
  args: {
    variant: 'primary',
    size: 'md',
    outline: false,
    selected: false,
    removable: false,
    clickable: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    outline: { control: 'boolean' },
    selected: { control: 'boolean' },
    removable: { control: 'boolean' },
    clickable: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsChip>

export const Default: Story = {
  render: (args) => ({
    components: { NsChip },
    setup: () => ({ args }),
    template: '<NsChip v-bind="args">Label</NsChip>',
  }),
}

export const AllStates: Story = {
  name: 'All States',
  render: () => ({
    components: { NsChip },
    setup: () => ({ variants: VARIANTS }),
    template: `
      <table style="border-collapse: collapse; font-family: sans-serif; font-size: 12px;">
        <thead>
          <tr>
            <th style="text-align:left; padding:8px 16px 8px 0; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Variant</th>
            <th style="text-align:center; padding:8px 16px; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Selected</th>
            <th style="text-align:center; padding:8px 16px; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Unselected</th>
            <th style="text-align:center; padding:8px 16px; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Removable</th>
            <th style="text-align:center; padding:8px 16px; color:#757575; font-weight:600; border-bottom:1px solid #e5e7eb;">Disabled</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in variants" :key="v">
            <td style="padding:10px 16px 10px 0; color:#535353; white-space:nowrap;">{{ v }}</td>
            <td style="text-align:center; padding:10px 16px;"><NsChip :variant="v" selected>Label</NsChip></td>
            <td style="text-align:center; padding:10px 16px;"><NsChip :variant="v" outline>Label</NsChip></td>
            <td style="text-align:center; padding:10px 16px;"><NsChip :variant="v" removable>Label</NsChip></td>
            <td style="text-align:center; padding:10px 16px;"><NsChip :variant="v" disabled>Label</NsChip></td>
          </tr>
        </tbody>
      </table>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { NsChip },
    template: `
      <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <NsChip size="sm">Small</NsChip>
        <NsChip size="md">Medium</NsChip>
        <NsChip size="lg">Large</NsChip>
      </div>
    `,
  }),
}

export const Removable: Story = {
  render: () => ({
    components: { NsChip },
    setup: () => ({ variants: VARIANTS }),
    template: `
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <NsChip v-for="v in variants" :key="v" :variant="v" removable>{{ v }}</NsChip>
      </div>
    `,
  }),
}

export const SelectedVsUnselected: Story = {
  name: 'Selected vs Unselected',
  render: () => ({
    components: { NsChip },
    setup: () => ({ variants: VARIANTS }),
    template: `
      <div style="display:flex; gap:16px; flex-direction:column;">
        <div>
          <p style="font-family:sans-serif; font-size:11px; color:#757575; margin:0 0 8px;">Selected (filled — checkmark shown)</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <NsChip v-for="v in variants" :key="v" :variant="v" selected>{{ v }}</NsChip>
          </div>
        </div>
        <div>
          <p style="font-family:sans-serif; font-size:11px; color:#757575; margin:0 0 8px;">Unselected (outline — no checkmark)</p>
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
            <NsChip v-for="v in variants" :key="v" :variant="v" outline>{{ v }}</NsChip>
          </div>
        </div>
      </div>
    `,
  }),
}

export const OutlineVariants: Story = {
  name: 'Outline (Unselected)',
  render: () => ({
    components: { NsChip },
    setup: () => ({ variants: VARIANTS }),
    template: `
      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <NsChip v-for="v in variants" :key="v" :variant="v" outline>{{ v }}</NsChip>
      </div>
    `,
  }),
}
