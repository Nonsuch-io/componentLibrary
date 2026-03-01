import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsPage from './NsPage.vue'

const meta: Meta<typeof NsPage> = {
  title: 'Components/NsPage',
  component: NsPage,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsPage },
    setup: () => ({ args }),
    template: '<NsPage v-bind="args">Default content</NsPage>',
  }),
}
