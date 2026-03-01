import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsLinearProgress from './NsLinearProgress.vue'

const meta: Meta<typeof NsLinearProgress> = {
  title: 'Components/NsLinearProgress',
  component: NsLinearProgress,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsLinearProgress },
    setup: () => ({ args }),
    template: '<NsLinearProgress v-bind="args">Default content</NsLinearProgress>',
  }),
}
