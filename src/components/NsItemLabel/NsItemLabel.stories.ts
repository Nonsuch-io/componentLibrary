import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsItemLabel from './NsItemLabel.vue'

const meta: Meta<typeof NsItemLabel> = {
  title: 'Components/NsItemLabel',
  component: NsItemLabel,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsItemLabel },
    setup: () => ({ args }),
    template: '<NsItemLabel v-bind="args">Default content</NsItemLabel>',
  }),
}
