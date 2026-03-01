import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsCardActions from './NsCardActions.vue'

const meta: Meta<typeof NsCardActions> = {
  title: 'Components/NsCardActions',
  component: NsCardActions,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsCardActions },
    setup: () => ({ args }),
    template: '<NsCardActions v-bind="args">Default content</NsCardActions>',
  }),
}
