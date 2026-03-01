import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsHeader from './NsHeader.vue'

const meta: Meta<typeof NsHeader> = {
  title: 'Components/NsHeader',
  component: NsHeader,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsHeader },
    setup: () => ({ args }),
    template: '<NsHeader v-bind="args">Default content</NsHeader>',
  }),
}
