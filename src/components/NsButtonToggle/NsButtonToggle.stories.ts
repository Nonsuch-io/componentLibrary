import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsButtonToggle from './NsButtonToggle.vue'

const meta: Meta<typeof NsButtonToggle> = {
  title: 'Components/NsButtonToggle',
  component: NsButtonToggle,
  tags: ['autodocs'],
  args: {
    modelValue: 'one',
    options: [
      { label: 'One', value: 'one' },
      { label: 'Two', value: 'two' },
      { label: 'Three', value: 'three' },
    ],
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsButtonToggle },
    setup: () => ({ args }),
    template: '<NsButtonToggle v-bind="args" />',
  }),
}
