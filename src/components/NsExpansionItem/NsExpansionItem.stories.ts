import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsExpansionItem from './NsExpansionItem.vue'

const meta: Meta<typeof NsExpansionItem> = {
  title: 'Components/NsExpansionItem',
  component: NsExpansionItem,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsExpansionItem },
    setup: () => ({ args }),
    template: '<NsExpansionItem v-bind="args">Default content</NsExpansionItem>',
  }),
}
