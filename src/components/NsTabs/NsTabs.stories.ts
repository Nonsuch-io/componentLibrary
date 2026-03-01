import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTabs from './NsTabs.vue'

const meta: Meta<typeof NsTabs> = {
  title: 'Components/NsTabs',
  component: NsTabs,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsTabs },
    setup: () => ({ args }),
    template: '<NsTabs v-bind="args">Default content</NsTabs>',
  }),
}
