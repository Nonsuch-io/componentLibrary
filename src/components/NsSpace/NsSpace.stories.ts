import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsSpace from './NsSpace.vue'

const meta: Meta<typeof NsSpace> = {
  title: 'Components/NsSpace',
  component: NsSpace,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsSpace },
    setup: () => ({ args }),
    template: '<NsSpace v-bind="args">Default content</NsSpace>',
  }),
}
