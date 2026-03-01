import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsBadge from './NsBadge.vue'

const meta: Meta<typeof NsBadge> = {
  title: 'Components/NsBadge',
  component: NsBadge,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsBadge },
    setup: () => ({ args }),
    template: '<NsBadge v-bind="args">Default content</NsBadge>',
  }),
}
