import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsToggle from './NsToggle.vue'

const meta: Meta<typeof NsToggle> = {
  title: 'Components/NsToggle',
  component: NsToggle,
  args: {
    label: 'Enable notifications',
    modelValue: false,
    dense: false,
    disable: false,
  },
  argTypes: {
    label: { control: 'text' },
    modelValue: { control: 'boolean' },
    dense: { control: 'boolean' },
    disable: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsToggle>

export const Default: Story = {}

export const Active: Story = {
  args: { modelValue: true },
}

export const Dense: Story = {
  args: { dense: true, label: 'Compact toggle' },
}

export const Disabled: Story = {
  args: { disable: true, label: 'Cannot toggle' },
}
