import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsItemSection from './NsItemSection.vue'

const meta: Meta<typeof NsItemSection> = {
  title: 'Components/NsItemSection',
  component: NsItemSection,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsItemSection },
    setup: () => ({ args }),
    template: '<NsItemSection v-bind="args">Default content</NsItemSection>',
  }),
}
