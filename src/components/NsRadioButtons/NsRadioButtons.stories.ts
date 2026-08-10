import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsRadioButtons from './NsRadioButtons.vue'

const sizeOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
  { label: 'Extra large', value: 'x-large' },
]

const meta: Meta<typeof NsRadioButtons> = {
  title: 'Components/NsRadioButtons',
  component: NsRadioButtons,
  args: {
    label: 'Size',
    options: sizeOptions,
    modelValue: 'medium',
    orientation: 'vertical',
    disable: false,
  },
  argTypes: {
    label: { control: 'text' },
    orientation: { control: 'radio', options: ['vertical', 'horizontal'] },
    disable: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof NsRadioButtons>

export const Vertical: Story = {}

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
}

export const WithLabel: Story = {
  args: { label: 'Size' },
}

/**
 * No visible label. Still an accessible name — `ariaLabel` is the supported
 * way to give a radiogroup a name without rendering visible text; leaving
 * both `label` and `ariaLabel` unset is the accessibility failure this
 * component exists to close, and NsRadioButtons warns in dev if you do it.
 */
export const WithoutVisibleLabel: Story = {
  args: { label: undefined, ariaLabel: 'Size' },
}

export const WithDisabledOption: Story = {
  args: {
    options: [
      { label: 'Small', value: 'small' },
      { label: 'Medium', value: 'medium', disable: true },
      { label: 'Large', value: 'large' },
    ],
  },
}
