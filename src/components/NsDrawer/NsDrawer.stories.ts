import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsDrawer from './NsDrawer.vue'

const meta: Meta<typeof NsDrawer> = {
  title: 'Components/NsDrawer',
  component: NsDrawer,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsDrawer },
    setup: () => ({ args }),
    template: '<NsDrawer v-bind="args">Default content</NsDrawer>',
  }),
}
