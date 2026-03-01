import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsInnerLoading from './NsInnerLoading.vue'

const meta: Meta<typeof NsInnerLoading> = {
  title: 'Components/NsInnerLoading',
  component: NsInnerLoading,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsInnerLoading },
    setup: () => ({ args }),
    template: '<NsInnerLoading v-bind="args">Default content</NsInnerLoading>',
  }),
}
