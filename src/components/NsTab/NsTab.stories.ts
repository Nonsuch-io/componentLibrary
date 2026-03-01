import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsTab from './NsTab.vue'

const meta: Meta<typeof NsTab> = {
  title: 'Components/NsTab',
  component: NsTab,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsTab },
    setup: () => ({ args }),
    template: '<NsTab v-bind="args">Default content</NsTab>',
  }),
}
