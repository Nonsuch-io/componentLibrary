import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsRadio from './NsRadio.vue'

const meta: Meta<typeof NsRadio> = {
  title: 'Components/NsRadio',
  component: NsRadio,
  args: {
    label: 'Small',
    val: 'small',
    modelValue: 'small',
    disable: false,
  },
  argTypes: {
    label: { control: 'text' },
    disable: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsRadio>

export const Default: Story = {}

export const Unselected: Story = {
  args: { modelValue: 'medium' },
}

export const Disabled: Story = {
  args: { disable: true },
}
