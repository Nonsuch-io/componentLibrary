import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsLayout from './NsLayout.vue'

const meta: Meta<typeof NsLayout> = {
  title: 'Components/NsLayout',
  component: NsLayout,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsLayout },
    setup: () => ({ args }),
    template: '<NsLayout v-bind="args">Default content</NsLayout>',
  }),
}
