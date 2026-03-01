import type { Meta, StoryObj } from '@storybook/vue3-vite'
import NsCardSection from './NsCardSection.vue'

const meta: Meta<typeof NsCardSection> = {
  title: 'Components/NsCardSection',
  component: NsCardSection,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { NsCardSection },
    setup: () => ({ args }),
    template: '<NsCardSection v-bind="args">Default content</NsCardSection>',
  }),
}
