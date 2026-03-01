import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsToolbar from './NsToolbar.vue'

const meta: Meta<typeof NsToolbar> = {
  title: 'Components/NsToolbar',
  component: NsToolbar,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsToolbar },
    setup: () => ({ args }),
    template: '<NsToolbar v-bind="args">Default content</NsToolbar>',
  }),
}
