import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsSpinner from './NsSpinner.vue'

const meta: Meta<typeof NsSpinner> = {
  title: 'Components/NsSpinner',
  component: NsSpinner,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsSpinner },
    setup: () => ({ args }),
    template: '<NsSpinner v-bind="args">Default content</NsSpinner>',
  }),
}
