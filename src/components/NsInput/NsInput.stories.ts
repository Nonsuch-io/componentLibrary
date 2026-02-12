import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsInput from './NsInput.vue'

const meta: Meta<typeof NsInput> = {
  title: 'Components/NsInput',
  component: NsInput,
  args: {
    label: 'Email address',
    outlined: true,
    dense: false,
  },
  argTypes: {
    label: { control: 'text' },
    outlined: { control: 'boolean' },
    dense: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsInput>

export const Default: Story = {}

export const Dense: Story = {
  args: {
    dense: true,
    label: 'Compact input',
  },
}

export const WithValidation: Story = {
  args: {
    label: 'Email',
    rules: [
      (val: string) => !!val || 'Required',
      (val: string) => val.includes('@') || 'Must be a valid email',
    ],
  },
}

export const NoLabel: Story = {
  args: {
    label: undefined,
  },
}
