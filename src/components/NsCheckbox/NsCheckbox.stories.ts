import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsCheckbox from './NsCheckbox.vue'

const meta: Meta<typeof NsCheckbox> = {
  title: 'Components/NsCheckbox',
  component: NsCheckbox,
  args: {
    label: 'I agree to the terms',
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
type Story = StoryObj<typeof NsCheckbox>

export const Default: Story = {}

export const Checked: Story = {
  args: { modelValue: true },
}

export const Dense: Story = {
  args: { dense: true, label: 'Compact checkbox' },
}

export const Disabled: Story = {
  args: { disable: true, label: 'Cannot change' },
}
