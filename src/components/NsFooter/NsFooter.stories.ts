import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsFooter from './NsFooter.vue'

const meta: Meta<typeof NsFooter> = {
  title: 'Components/NsFooter',
  component: NsFooter,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsFooter },
    setup: () => ({ args }),
    template: '<NsFooter v-bind="args">Default content</NsFooter>',
  }),
}
