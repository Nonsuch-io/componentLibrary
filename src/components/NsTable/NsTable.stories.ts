import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTable from './NsTable.vue'

const meta: Meta<typeof NsTable> = {
  title: 'Components/NsTable',
  component: NsTable,
  tags: ['autodocs'],
  args: {
    rows: [
      { id: 1, name: 'Row 1' },
      { id: 2, name: 'Row 2' },
    ],
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsTable },
    setup: () => ({ args }),
    template: '<NsTable v-bind="args" />',
  }),
}
