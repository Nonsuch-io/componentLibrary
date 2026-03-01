import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsPagination from './NsPagination.vue'

const meta: Meta<typeof NsPagination> = {
  title: 'Components/NsPagination',
  component: NsPagination,
  tags: ['autodocs'],
  args: {
    modelValue: 1,
    max: 10,
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsPagination },
    setup: () => ({ args }),
    template: '<NsPagination v-bind="args" />',
  }),
}
