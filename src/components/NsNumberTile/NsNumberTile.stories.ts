import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsNumberTile from './NsNumberTile.vue'

const meta = {
  title: 'Marketing/NsNumberTile',
  component: NsNumberTile,
  tags: ['autodocs'],
  argTypes: {
    number: { control: 'text' },
  },
} satisfies Meta<typeof NsNumberTile>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { number: 1 },
}

export const Sequence: Story = {
  render: () => ({
    components: { NsNumberTile },
    template: `
      <div style="display: flex; gap: 8px;">
        <NsNumberTile :number="1" />
        <NsNumberTile :number="2" />
        <NsNumberTile :number="3" />
      </div>
    `,
  }),
}
