import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import NsRadioButtons from './NsRadioButtons.vue'

const SIZES = [
  { value: 'xs', label: 'Extra small' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
]

const meta: Meta<typeof NsRadioButtons> = {
  title: 'Components/NsRadioButtons',
  component: NsRadioButtons,
  args: {
    label: 'Size',
    options: SIZES,
    orientation: 'vertical',
    variant: 'simple',
    disable: false,
  },
  argTypes: {
    orientation: { control: 'select', options: ['vertical', 'horizontal'] },
    variant: { control: 'select', options: ['simple', 'card'] },
    disable: { control: 'boolean' },
    label: { control: 'text' },
    caption: { control: 'text' },
  },
}

export default meta
type Story = StoryObj<typeof NsRadioButtons>

export const Vertical: Story = {
  args: { orientation: 'vertical', modelValue: 'sm' },
}

export const Horizontal: Story = {
  args: { orientation: 'horizontal', modelValue: 'sm' },
}

export const WithCaption: Story = {
  name: 'With Caption',
  args: {
    orientation: 'vertical',
    modelValue: 'md',
    caption: 'Choose the size that best fits your needs',
  },
}

export const Interactive: Story = {
  render: () => ({
    components: { NsRadioButtons },
    setup: () => {
      const selected = ref('md')
      return { selected, options: SIZES }
    },
    template: `
      <div style="padding:16px; font-family:sans-serif;">
        <NsRadioButtons
          v-model="selected"
          label="Size"
          caption="Choose the size that best fits your needs"
          :options="options"
          orientation="vertical"
        />
        <p style="margin-top:16px; font-size:12px; color:#757575;">Selected: <strong>{{ selected }}</strong></p>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  args: { orientation: 'vertical', modelValue: 'sm', disable: true },
}
