import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsToolbarTitle from './NsToolbarTitle.vue'

const meta: Meta<typeof NsToolbarTitle> = {
  title: 'Components/NsToolbarTitle',
  component: NsToolbarTitle,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsToolbarTitle },
    setup: () => ({ args }),
    template: '<NsToolbarTitle v-bind="args">Default content</NsToolbarTitle>',
  }),
}
