import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsItem from './NsItem.vue'

const meta: Meta<typeof NsItem> = {
  title: 'Components/NsItem',
  component: NsItem,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsItem },
    setup: () => ({ args }),
    template: '<NsItem v-bind="args">Default content</NsItem>',
  }),
}
