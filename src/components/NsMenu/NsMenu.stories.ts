import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsMenu from './NsMenu.vue'

const meta: Meta<typeof NsMenu> = {
  title: 'Components/NsMenu',
  component: NsMenu,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsMenu },
    setup: () => ({ args }),
    template: '<NsMenu v-bind="args">Default content</NsMenu>',
  }),
}
