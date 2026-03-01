import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsIcon from './NsIcon.vue'

const meta: Meta<typeof NsIcon> = {
  title: 'Components/NsIcon',
  component: NsIcon,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsIcon },
    setup: () => ({ args }),
    template: '<NsIcon v-bind="args">Default content</NsIcon>',
  }),
}
