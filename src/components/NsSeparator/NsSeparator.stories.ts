import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsSeparator from './NsSeparator.vue'

const meta: Meta<typeof NsSeparator> = {
  title: 'Components/NsSeparator',
  component: NsSeparator,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsSeparator },
    setup: () => ({ args }),
    template: '<NsSeparator v-bind="args">Default content</NsSeparator>',
  }),
}
