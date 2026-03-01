import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTableCell from './NsTableCell.vue'

const meta: Meta<typeof NsTableCell> = {
  title: 'Components/NsTableCell',
  component: NsTableCell,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsTableCell },
    setup: () => ({ args }),
    template: '<NsTableCell v-bind="args">Default content</NsTableCell>',
  }),
}
